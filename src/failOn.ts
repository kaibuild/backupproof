import type { Finding, Severity } from "./types.js";

export type FailOnThreshold = Severity | "none";

const severityRank: Record<Severity, number> = {
  high: 3,
  medium: 2,
  low: 1
};

export function parseFailOnThreshold(value: string): FailOnThreshold {
  if (value === "high" || value === "medium" || value === "low" || value === "none") {
    return value;
  }

  throw new Error(`Invalid --fail-on value: ${value}. Allowed values are high, medium, low, none.`);
}

export function shouldFailOnThreshold(findings: Finding[], threshold: FailOnThreshold): boolean {
  if (threshold === "none") {
    return false;
  }

  const minimumRank = severityRank[threshold];
  return findings.some((finding) => severityRank[finding.severity] >= minimumRank);
}
