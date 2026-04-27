import { describe, expect, it } from "vitest";
import { scanCompose } from "../src/index.js";
import { parseComposeContent } from "../src/parser.js";
import { findPersistentNamedVolumes } from "../src/rules/persistentVolumes.js";

describe("persistent named volume detection", () => {
  it("detects named volumes mounted into services", () => {
    const compose = parseComposeContent(`
services:
  db:
    image: postgres:16
    volumes:
      - db_data:/var/lib/postgresql/data
`);

    const result = scanCompose(compose);
    const volumes = findPersistentNamedVolumes(result);

    expect(volumes).toHaveLength(1);
    expect(volumes[0]).toMatchObject({
      service: "db",
      type: "named",
      source: "db_data",
      target: "/var/lib/postgresql/data",
      persistent: true
    });
  });
});
