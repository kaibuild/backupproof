import type { Finding, MountedVolume, ScanContext } from "../types.js";

export const PERSISTENT_BIND_MOUNT_RULE_ID = "PERSISTENT_BIND_MOUNT_DETECTED";

export function findPersistentBindMounts(context: ScanContext): MountedVolume[] {
  return context.persistentVolumes.filter((volume) => volume.type === "bind");
}

export function bindMountsRule(context: ScanContext): Finding[] {
  return findPersistentBindMounts(context).map((volume) => ({
    ruleId: PERSISTENT_BIND_MOUNT_RULE_ID,
    severity: "low",
    service: volume.service,
    title: "Persistent bind mount detected",
    description: `Service \`${volume.service}\` uses a bind-mounted path that appears to contain persistent data.`,
    evidence: volume.raw,
    recommendation: "Confirm the host path is included in backups and that restore steps are documented."
  }));
}
