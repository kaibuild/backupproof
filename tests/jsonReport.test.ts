import { describe, expect, it } from "vitest";
import { scanCompose } from "../src/index.js";
import { parseComposeContent } from "../src/parser.js";
import { createJsonReport, renderJsonReport } from "../src/report/json.js";

describe("JSON report output", () => {
  it("renders summary, hints, volumes, persistent services, and findings", () => {
    const compose = parseComposeContent(`
services:
  db:
    image: postgres:16
    volumes:
      - db_data:/var/lib/postgresql/data
  restic:
    image: restic/restic
    command: backup /postgres-data
    labels:
      restore-test: "quarterly verification"
    volumes:
      - db_data:/postgres-data:ro
volumes:
  db_data:
`);

    const result = scanCompose(compose, "docker-compose.yml");
    const report = createJsonReport(result, new Date("2026-04-28T00:00:00.000Z"));

    expect(report.tool).toBe("BackupProof");
    expect(report.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(report.scannedFile).toBe("docker-compose.yml");
    expect(report.generatedAt).toBe("2026-04-28T00:00:00.000Z");
    expect(report.summary).toMatchObject({
      totalFindings: result.findings.length,
      high: 0,
      medium: 0,
      low: 2,
      persistentVolumes: 1,
      databaseLikeServices: 1,
      backupHints: 3,
      restoreTestHints: 3
    });
    expect(report.persistentServices).toHaveLength(1);
    expect(report.persistentServices[0]).toMatchObject({
      name: "db",
      image: "postgres:16",
      isDatabaseLike: true
    });
    expect(report.volumes).toHaveLength(2);
    expect(report.backupHints.map((hint) => hint.keyword)).toEqual(["restic", "restic", "backup"]);
    expect(report.restoreHints.map((hint) => hint.keyword)).toEqual(["restore", "restore-test", "verification"]);
    expect(report.findings[0]).toEqual(
      expect.objectContaining({
        ruleId: "PERSISTENT_NAMED_VOLUME_DETECTED",
        severity: "low",
        service: "db"
      })
    );
  });

  it("returns parseable pretty JSON with a trailing newline", () => {
    const compose = parseComposeContent(`
services:
  app:
    image: example/app
`);

    const result = scanCompose(compose, "compose.yml");
    const json = renderJsonReport(result, new Date("2026-04-28T00:00:00.000Z"));

    expect(json.endsWith("\n")).toBe(true);
    expect(JSON.parse(json)).toMatchObject({
      tool: "BackupProof",
      scannedFile: "compose.yml",
      generatedAt: "2026-04-28T00:00:00.000Z"
    });
  });
});
