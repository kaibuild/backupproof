import { isMountCoveredByBackup } from "./coverage.js";
import type { Finding, MountedVolume, ScanContext, ServiceAnalysis } from "../types.js";

export const IMPORTANT_VOLUME_NOT_COVERED_RULE_ID = "IMPORTANT_VOLUME_NOT_OBVIOUSLY_COVERED";

export function findBackupServices(context: ScanContext): ServiceAnalysis[] {
  return context.services.filter((service) => service.isBackupRelated);
}

export function findUncoveredPersistentVolumes(context: ScanContext): MountedVolume[] {
  return context.persistentVolumes.filter((volume) => !isMountCoveredByBackup(volume, context));
}

export function backupServicesRule(context: ScanContext): Finding[] {
  return findUncoveredPersistentVolumes(context).map((volume) => ({
    ruleId: IMPORTANT_VOLUME_NOT_COVERED_RULE_ID,
    severity: "medium",
    service: volume.service,
    title: "Persistent storage is not obviously covered by a backup service",
    description: `Service \`${volume.service}\` has persistent storage, but BackupProof could not connect it to a visible backup service, backup command, or backup label.`,
    evidence: volume.raw,
    recommendation:
      "Make the backup relationship explicit. For example, add a backup service, a label, or documentation that names this volume/path and explains how it is restored."
  }));
}
