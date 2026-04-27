import { describe, expect, it } from "vitest";
import { scanCompose } from "../src/index.js";
import { parseComposeContent } from "../src/parser.js";
import { findBackupServices, IMPORTANT_VOLUME_NOT_COVERED_RULE_ID } from "../src/rules/backupServices.js";

describe("backup service detection", () => {
  it("detects backup-related services by image, name, command, or labels", () => {
    const compose = parseComposeContent(`
services:
  restic:
    image: restic/restic
    command: backup /data
  worker:
    image: example/worker
    labels:
      org.backupproof.backup: "rsync snapshot job"
`);

    const result = scanCompose(compose);
    const backupServices = findBackupServices(result).map((service) => service.name);

    expect(backupServices).toEqual(["restic", "worker"]);
  });

  it("warns when important persistent storage is not obviously covered", () => {
    const compose = parseComposeContent(`
services:
  app:
    image: example/app
    volumes:
      - app_data:/data
volumes:
  app_data:
`);

    const result = scanCompose(compose);

    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: IMPORTANT_VOLUME_NOT_COVERED_RULE_ID,
          service: "app"
        })
      ])
    );
  });

  it("does not warn when a backup service mounts the same source", () => {
    const compose = parseComposeContent(`
services:
  app:
    image: example/app
    volumes:
      - app_data:/data
  backup:
    image: restic/restic
    command: backup /app-data
    volumes:
      - app_data:/app-data:ro
volumes:
  app_data:
`);

    const result = scanCompose(compose);

    expect(result.findings).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: IMPORTANT_VOLUME_NOT_COVERED_RULE_ID,
          service: "app"
        })
      ])
    );
  });
});
