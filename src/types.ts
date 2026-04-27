export type Severity = "high" | "medium" | "low";

export interface ComposeFile {
  services: Record<string, ComposeService>;
  volumes?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ComposeService {
  image?: string;
  build?: unknown;
  command?: string | string[];
  entrypoint?: string | string[];
  volumes?: Array<string | ComposeVolumeObject>;
  labels?: string[] | Record<string, string | number | boolean | null>;
  environment?: string[] | Record<string, string | number | boolean | null>;
  [key: string]: unknown;
}

export interface ComposeVolumeObject {
  type?: string;
  source?: string;
  src?: string;
  target?: string;
  dst?: string;
  destination?: string;
  read_only?: boolean;
  readonly?: boolean;
  [key: string]: unknown;
}

export type MountType = "named" | "bind" | "anonymous" | "unknown";

export interface MountedVolume {
  service: string;
  type: MountType;
  source?: string;
  target?: string;
  raw: string;
  readOnly: boolean;
  persistent: boolean;
}

export type HintKind = "backup" | "restore";
export type HintSource = "name" | "image" | "command" | "entrypoint" | "labels" | "environment";

export interface Hint {
  service: string;
  kind: HintKind;
  source: HintSource;
  keyword: string;
  value: string;
}

export interface ServiceAnalysis {
  name: string;
  service: ComposeService;
  image?: string;
  isDatabaseLike: boolean;
  isBackupRelated: boolean;
  mounts: MountedVolume[];
  persistentMounts: MountedVolume[];
  backupHints: Hint[];
  restoreHints: Hint[];
}

export interface Finding {
  ruleId: string;
  severity: Severity;
  service: string;
  title: string;
  description: string;
  evidence: string;
  recommendation: string;
}

export interface ScanContext {
  filePath: string;
  compose: ComposeFile;
  services: ServiceAnalysis[];
  volumes: MountedVolume[];
  persistentServices: ServiceAnalysis[];
  persistentVolumes: MountedVolume[];
  backupHints: Hint[];
  restoreHints: Hint[];
}

export interface ScanResult extends ScanContext {
  findings: Finding[];
}

export type Rule = (context: ScanContext) => Finding[];
