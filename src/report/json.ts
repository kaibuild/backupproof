import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Finding, Hint, MountedVolume, ScanResult, ServiceAnalysis, Severity } from "../types.js";

interface PackageJson {
  version?: string;
}

export interface JsonReport {
  tool: "BackupProof";
  version: string;
  scannedFile: string;
  generatedAt: string;
  summary: {
    totalFindings: number;
    high: number;
    medium: number;
    low: number;
    persistentVolumes: number;
    databaseLikeServices: number;
    backupHints: number;
    restoreTestHints: number;
  };
  persistentServices: Array<{
    name: string;
    image?: string;
    isDatabaseLike: boolean;
    persistentMounts: MountedVolume[];
  }>;
  volumes: MountedVolume[];
  backupHints: Hint[];
  restoreHints: Hint[];
  findings: Finding[];
}

const severities: Severity[] = ["high", "medium", "low"];

export function renderJsonReport(result: ScanResult, generatedAt = new Date()): string {
  return `${JSON.stringify(createJsonReport(result, generatedAt), null, 2)}\n`;
}

export function createJsonReport(result: ScanResult, generatedAt = new Date()): JsonReport {
  return {
    tool: "BackupProof",
    version: getPackageVersion(),
    scannedFile: result.filePath,
    generatedAt: generatedAt.toISOString(),
    summary: {
      totalFindings: result.findings.length,
      high: countFindings(result.findings, "high"),
      medium: countFindings(result.findings, "medium"),
      low: countFindings(result.findings, "low"),
      persistentVolumes: result.persistentVolumes.length,
      databaseLikeServices: result.services.filter((service) => service.isDatabaseLike).length,
      backupHints: result.backupHints.length,
      restoreTestHints: result.restoreHints.length
    },
    persistentServices: result.persistentServices.map(toPersistentServiceJson),
    volumes: result.volumes,
    backupHints: result.backupHints,
    restoreHints: result.restoreHints,
    findings: result.findings
  };
}

function countFindings(findings: Finding[], severity: Severity): number {
  return findings.filter((finding) => finding.severity === severity).length;
}

function toPersistentServiceJson(service: ServiceAnalysis): JsonReport["persistentServices"][number] {
  return {
    name: service.name,
    image: service.image,
    isDatabaseLike: service.isDatabaseLike,
    persistentMounts: service.persistentMounts
  };
}

function getPackageVersion(): string {
  try {
    const packageJsonPath = fileURLToPath(new URL("../../package.json", import.meta.url));
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as PackageJson;
    return packageJson.version ?? "unknown";
  } catch {
    return "unknown";
  }
}
