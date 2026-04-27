import type { Finding, ScanContext } from "../types.js";

export const PERSISTENT_SERVICE_WITHOUT_RESTORE_TEST_HINT_RULE_ID =
  "PERSISTENT_SERVICE_WITHOUT_RESTORE_TEST_HINT";

export function restoreHintsRule(context: ScanContext): Finding[] {
  if (context.persistentServices.length === 0 || context.restoreHints.length > 0) {
    return [];
  }

  return [
    {
      ruleId: PERSISTENT_SERVICE_WITHOUT_RESTORE_TEST_HINT_RULE_ID,
      severity: "medium",
      service: "all",
      title: "Persistent services have no visible restore-test hint",
      description:
        "One or more services use persistent storage, but no restore-test, verification, recovery, or restore documentation hint was detected in the Compose file.",
      evidence: context.persistentServices.map((service) => service.name).join(", "),
      recommendation:
        "Document a restore-test process and run it on a schedule. A backup that has never been restored is still an assumption."
    }
  ];
}
