import { describe, expect, it } from "vitest";
import { scanCompose } from "../src/index.js";
import { parseComposeContent } from "../src/parser.js";
import { findDatabaseServices } from "../src/rules/databaseServices.js";

describe("database-like service detection", () => {
  it("detects database-like services by image or service name", () => {
    const compose = parseComposeContent(`
services:
  db:
    image: postgres:16
  cache:
    image: redis:7
  search:
    image: opensearchproject/opensearch:2
  web:
    image: nginx:alpine
`);

    const result = scanCompose(compose);
    const services = findDatabaseServices(result).map((service) => service.name);

    expect(services).toEqual(["db", "cache", "search"]);
  });
});
