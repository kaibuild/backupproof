import { isServiceCoveredByBackup } from "./coverage.js";
import type { Finding, ScanContext } from "../types.js";

export const DATABASE_VOLUME_WITHOUT_BACKUP_HINT_RULE_ID = "DATABASE_VOLUME_WITHOUT_BACKUP_HINT";

export function backupHintsRule(context: ScanContext): Finding[] {
  return context.services
    .filter((service) => service.isDatabaseLike && service.persistentMounts.length > 0)
    .filter((service) => !isServiceCoveredByBackup(service, context))
    .map((service) => ({
      ruleId: DATABASE_VOLUME_WITHOUT_BACKUP_HINT_RULE_ID,
      severity: "high",
      service: service.name,
      title: "Database volume has no visible backup hint",
      description: `Service \`${service.name}\` appears to use persistent database storage, but no obvious backup service, backup command, or backup label was detected for it.`,
      evidence: service.persistentMounts.map((mount) => mount.raw).join("\n"),
      recommendation:
        "Add a documented backup job or backup service for this datastore. For databases, prefer logical dumps or tested backup tools instead of only copying raw volumes."
    }));
}
