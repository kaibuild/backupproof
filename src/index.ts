import { resolve } from "node:path";
import { parseComposeFile } from "./parser.js";
import { renderMarkdownReport } from "./report/markdown.js";
import { backupHintsRule } from "./rules/backupHints.js";
import { backupServicesRule } from "./rules/backupServices.js";
import { bindMountsRule } from "./rules/bindMounts.js";
import { databaseServicesRule } from "./rules/databaseServices.js";
import { persistentVolumesRule } from "./rules/persistentVolumes.js";
import { restoreHintsRule } from "./rules/restoreHints.js";
import type {
  ComposeFile,
  ComposeService,
  ComposeVolumeObject,
  Hint,
  HintSource,
  MountedVolume,
  Rule,
  ScanContext,
  ScanResult,
  ServiceAnalysis
} from "./types.js";

export const DATABASE_KEYWORDS = [
  "postgres",
  "postgresql",
  "mysql",
  "mariadb",
  "mongodb",
  "mongo",
  "redis",
  "elasticsearch",
  "opensearch",
  "couchdb",
  "influxdb",
  "timescaledb",
  "cockroach"
];

export const BACKUP_KEYWORDS = [
  "backup",
  "restic",
  "borg",
  "kopia",
  "duplicati",
  "backrest",
  "pgbackrest",
  "dump",
  "mysqldump",
  "mongodump",
  "rclone",
  "rsync",
  "snapshots",
  "snapshot"
];

export const RESTORE_KEYWORDS = [
  "restore",
  "restore-test",
  "restore_test",
  "test-restore",
  "verify",
  "verification",
  "recovery"
];

const PERSISTENT_PATH_KEYWORDS = [
  "/data",
  "data",
  "/var/lib",
  "database",
  "db",
  "storage",
  "uploads",
  "media",
  "files",
  "content",
  "config",
  "backups",
  "backup",
  "snapshots",
  "snapshot"
];

const IGNORED_BIND_TARGETS = [
  "/var/run/docker.sock",
  "/run/docker.sock",
  "/etc/localtime",
  "/etc/timezone"
];

const READ_ONLY_MODES = new Set(["ro", "readonly"]);

const rules: Rule[] = [
  persistentVolumesRule,
  bindMountsRule,
  databaseServicesRule,
  backupHintsRule,
  backupServicesRule,
  restoreHintsRule
];

export async function scanComposeFile(filePath: string): Promise<ScanResult> {
  const resolvedPath = resolve(filePath);
  const compose = await parseComposeFile(resolvedPath);
  return scanCompose(compose, filePath);
}

export function scanCompose(compose: ComposeFile, filePath = "docker-compose.yml"): ScanResult {
  const context = analyzeCompose(compose, filePath);
  const findings = rules.flatMap((rule) => rule(context));
  return {
    ...context,
    findings
  };
}

export { renderMarkdownReport };

export function analyzeCompose(compose: ComposeFile, filePath: string): ScanContext {
  const services = Object.entries(compose.services).map(([name, service]) => analyzeService(name, service));
  const volumes = services.flatMap((service) => service.mounts);
  const persistentServices = services.filter((service) => service.persistentMounts.length > 0);
  const persistentVolumes = volumes.filter((volume) => volume.persistent);
  const backupHints = services.flatMap((service) => service.backupHints);
  const restoreHints = services.flatMap((service) => service.restoreHints);

  return {
    filePath,
    compose,
    services,
    volumes,
    persistentServices,
    persistentVolumes,
    backupHints,
    restoreHints
  };
}

export function analyzeService(name: string, service: ComposeService): ServiceAnalysis {
  const mounts = parseServiceVolumes(name, service.volumes ?? []);
  const backupHints = collectHints(name, service, "backup", BACKUP_KEYWORDS);
  const restoreHints = collectHints(name, service, "restore", RESTORE_KEYWORDS);
  const isDatabaseLike = isDatabaseLikeService(name, service);

  return {
    name,
    service,
    image: service.image,
    isDatabaseLike,
    isBackupRelated: backupHints.length > 0,
    mounts,
    persistentMounts: mounts.filter((mount) => mount.persistent),
    backupHints,
    restoreHints
  };
}

export function isDatabaseLikeService(name: string, service: ComposeService): boolean {
  const searchable = [name, service.image, stringifyValue(service.labels)].filter(Boolean).join(" ");
  return includesKeyword(searchable, DATABASE_KEYWORDS);
}

export function collectHints(
  serviceName: string,
  service: ComposeService,
  kind: "backup" | "restore",
  keywords: string[]
): Hint[] {
  const fields: Array<[HintSource, string | undefined]> = [
    ["name", serviceName],
    ["image", service.image],
    ["command", stringifyValue(service.command)],
    ["entrypoint", stringifyValue(service.entrypoint)],
    ["labels", stringifyValue(service.labels)],
    ["environment", stringifyValue(service.environment)]
  ];

  const hints: Hint[] = [];

  for (const [source, value] of fields) {
    if (!value) {
      continue;
    }

    for (const keyword of keywords) {
      if (value.toLowerCase().includes(keyword)) {
        hints.push({
          service: serviceName,
          kind,
          source,
          keyword,
          value
        });
      }
    }
  }

  return hints;
}

export function parseServiceVolumes(
  serviceName: string,
  volumes: Array<string | ComposeVolumeObject>
): MountedVolume[] {
  return volumes.map((volume) => parseServiceVolume(serviceName, volume));
}

export function parseServiceVolume(serviceName: string, volume: string | ComposeVolumeObject): MountedVolume {
  if (typeof volume === "string") {
    return parseShortVolume(serviceName, volume);
  }

  const source = stringOrUndefined(volume.source ?? volume.src);
  const target = stringOrUndefined(volume.target ?? volume.dst ?? volume.destination);
  const declaredType = stringOrUndefined(volume.type)?.toLowerCase();
  const readOnly = Boolean(volume.read_only ?? volume.readonly);
  const type = classifyMountType(source, declaredType);
  const raw = formatObjectVolume(volume);

  return {
    service: serviceName,
    type,
    source,
    target,
    raw,
    readOnly,
    persistent: isPersistentMount(type, source, target, readOnly)
  };
}

function parseShortVolume(serviceName: string, raw: string): MountedVolume {
  const parts = splitVolumeSpec(raw);
  const [first, second, third] = parts;
  const source = parts.length === 1 ? undefined : first;
  const target = parts.length === 1 ? first : second;
  const readOnly = third ? READ_ONLY_MODES.has(third.toLowerCase()) : false;
  const type = classifyMountType(source, undefined);

  return {
    service: serviceName,
    type,
    source,
    target,
    raw,
    readOnly,
    persistent: isPersistentMount(type, source, target, readOnly)
  };
}

function splitVolumeSpec(raw: string): string[] {
  const parts = raw.split(":");

  if (parts.length > 2 && /^[A-Za-z]$/.test(parts[0])) {
    return [`${parts[0]}:${parts[1]}`, ...parts.slice(2)];
  }

  return parts;
}

function classifyMountType(source: string | undefined, declaredType: string | undefined): MountedVolume["type"] {
  if (declaredType === "bind") {
    return "bind";
  }

  if (declaredType === "volume") {
    return source ? "named" : "anonymous";
  }

  if (!source) {
    return "anonymous";
  }

  if (looksLikeBindSource(source)) {
    return "bind";
  }

  return "named";
}

function looksLikeBindSource(source: string): boolean {
  return (
    source === "." ||
    source === ".." ||
    source.startsWith("./") ||
    source.startsWith("../") ||
    source.startsWith("/") ||
    source.startsWith("~/") ||
    source.includes("${") ||
    /^[A-Za-z]:[\\/]/.test(source)
  );
}

function isPersistentMount(
  type: MountedVolume["type"],
  source: string | undefined,
  target: string | undefined,
  readOnly: boolean
): boolean {
  if (readOnly) {
    return false;
  }

  const loweredTarget = (target ?? "").toLowerCase();
  const loweredSource = (source ?? "").toLowerCase();

  if (IGNORED_BIND_TARGETS.includes(loweredTarget)) {
    return false;
  }

  if (type === "named") {
    return true;
  }

  if (type === "anonymous") {
    return target ? looksImportantPath(target) : false;
  }

  if (type === "bind") {
    return looksImportantPath(loweredTarget) || looksImportantPath(loweredSource);
  }

  return false;
}

function looksImportantPath(pathValue: string): boolean {
  const lower = pathValue.toLowerCase();
  return PERSISTENT_PATH_KEYWORDS.some((keyword) => lower.includes(keyword));
}

function includesKeyword(value: string, keywords: string[]): boolean {
  const lower = value.toLowerCase();
  return keywords.some((keyword) => lower.includes(keyword));
}

function stringifyValue(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => stringifyValue(item)).filter(Boolean).join(" ");
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, entryValue]) => `${key}=${String(entryValue)}`)
      .join(" ");
  }

  return String(value);
}

function stringOrUndefined(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function formatObjectVolume(volume: ComposeVolumeObject): string {
  const type = stringOrUndefined(volume.type);
  const source = stringOrUndefined(volume.source ?? volume.src);
  const target = stringOrUndefined(volume.target ?? volume.dst ?? volume.destination);
  const readOnly = Boolean(volume.read_only ?? volume.readonly);
  return [
    type ? `type=${type}` : undefined,
    source ? `source=${source}` : undefined,
    target ? `target=${target}` : undefined,
    readOnly ? "read_only=true" : undefined
  ]
    .filter(Boolean)
    .join(", ");
}
