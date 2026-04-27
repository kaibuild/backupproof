import type { Finding, ServiceAnalysis, ScanContext } from "../types.js";

export const DATABASE_SERVICE_RULE_ID = "DATABASE_SERVICE_DETECTED";

export function findDatabaseServices(context: ScanContext): ServiceAnalysis[] {
  return context.services.filter((service) => service.isDatabaseLike);
}

export function databaseServicesRule(context: ScanContext): Finding[] {
  return findDatabaseServices(context).map((service) => ({
    ruleId: DATABASE_SERVICE_RULE_ID,
    severity: "low",
    service: service.name,
    title: "Database-like service detected",
    description: `Service \`${service.name}\` looks like a database or stateful datastore.`,
    evidence: service.image ? `image: ${service.image}` : `service: ${service.name}`,
    recommendation: "Use database-aware backups and verify that restore procedures work before relying on them."
  }));
}
