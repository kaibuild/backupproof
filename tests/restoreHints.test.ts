import { describe, expect, it } from "vitest";
import { scanCompose } from "../src/index.js";
import { parseComposeContent } from "../src/parser.js";
import { PERSISTENT_SERVICE_WITHOUT_RESTORE_TEST_HINT_RULE_ID } from "../src/rules/restoreHints.js";

describe("missing restore-test hint detection", () => {
  it("warns when persistent services have no restore-test signal", () => {
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
          ruleId: PERSISTENT_SERVICE_WITHOUT_RESTORE_TEST_HINT_RULE_ID,
          severity: "medium",
          service: "all"
        })
      ])
    );
  });

  it("does not warn when a restore-test hint is present", () => {
    const compose = parseComposeContent(`
services:
  app:
    image: example/app
    labels:
      org.backupproof.restore-test: "quarterly verification"
    volumes:
      - app_data:/data
volumes:
  app_data:
`);

    const result = scanCompose(compose);

    expect(result.findings).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: PERSISTENT_SERVICE_WITHOUT_RESTORE_TEST_HINT_RULE_ID
        })
      ])
    );
  });
});
