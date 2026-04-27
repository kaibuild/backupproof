import type { Finding, MountedVolume, ScanContext } from "../types.js";

export const PERSISTENT_NAMED_VOLUME_RULE_ID = "PERSISTENT_NAMED_VOLUME_DETECTED";

export function findPersistentNamedVolumes(context: ScanContext): MountedVolume[] {
  return context.persistentVolumes.filter((volume) => volume.type === "named");
}

export function persistentVolumesRule(context: ScanContext): Finding[] {
  return findPersistentNamedVolumes(context).map((volume) => ({
    ruleId: PERSISTENT_NAMED_VOLUME_RULE_ID,
    severity: "low",
    service: volume.service,
    title: "Persistent named volume detected",
    description: `Service \`${volume.service}\` uses a named Docker volume that should be included in backup planning.`,
    evidence: volume.raw,
    recommendation: "Confirm this named volume is documented, backed up, and included in a restore test."
  }));
}
