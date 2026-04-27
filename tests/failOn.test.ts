import { describe, expect, it } from "vitest";
import { parseFailOnThreshold, shouldFailOnThreshold } from "../src/failOn.js";
import type { Finding } from "../src/types.js";

const findings: Finding[] = [
  {
    ruleId: "HIGH_RULE",
    severity: "high",
    service: "db",
    title: "High finding",
    description: "High finding",
    evidence: "db_data:/data",
    recommendation: "Fix it"
  },
  {
    ruleId: "MEDIUM_RULE",
    severity: "medium",
    service: "app",
    title: "Medium finding",
    description: "Medium finding",
    evidence: "./data:/data",
    recommendation: "Fix it"
  },
  {
    ruleId: "LOW_RULE",
    severity: "low",
    service: "cache",
    title: "Low finding",
    description: "Low finding",
    evidence: "cache_data:/data",
    recommendation: "Review it"
  }
];

describe("--fail-on threshold handling", () => {
  it("parses supported threshold values", () => {
    expect(parseFailOnThreshold("high")).toBe("high");
    expect(parseFailOnThreshold("medium")).toBe("medium");
    expect(parseFailOnThreshold("low")).toBe("low");
    expect(parseFailOnThreshold("none")).toBe("none");
  });

  it("rejects unsupported threshold values", () => {
    expect(() => parseFailOnThreshold("critical")).toThrow("Invalid --fail-on value");
  });

  it("fails only when findings meet or exceed the selected threshold", () => {
    expect(shouldFailOnThreshold(findings, "none")).toBe(false);
    expect(shouldFailOnThreshold(findings, "high")).toBe(true);
    expect(shouldFailOnThreshold(findings, "medium")).toBe(true);
    expect(shouldFailOnThreshold(findings, "low")).toBe(true);
    expect(shouldFailOnThreshold([findings[1], findings[2]], "high")).toBe(false);
    expect(shouldFailOnThreshold([findings[2]], "medium")).toBe(false);
    expect(shouldFailOnThreshold([findings[2]], "low")).toBe(true);
  });
});
