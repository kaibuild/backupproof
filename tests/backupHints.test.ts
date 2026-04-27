import { describe, expect, it } from "vitest";
import { scanCompose } from "../src/index.js";
import { parseComposeContent } from "../src/parser.js";
import { DATABASE_VOLUME_WITHOUT_BACKUP_HINT_RULE_ID } from "../src/rules/backupHints.js";

describe("missing backup hint detection", () => {
  it("warns when a database-like service uses persistent storage without backup hints", () => {
    const compose = parseComposeContent(`
services:
  db:
    image: postgres:16
    volumes:
      - db_data:/var/lib/postgresql/data
volumes:
  db_data:
`);

    const result = scanCompose(compose);

    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: DATABASE_VOLUME_WITHOUT_BACKUP_HINT_RULE_ID,
          severity: "high",
          service: "db"
        })
      ])
    );
  });
});
