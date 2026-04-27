import { describe, expect, it } from "vitest";
import { scanCompose } from "../src/index.js";
import { parseComposeContent } from "../src/parser.js";
import { findPersistentBindMounts } from "../src/rules/bindMounts.js";

describe("bind mount detection", () => {
  it("detects bind-mounted paths that look persistent", () => {
    const compose = parseComposeContent(`
services:
  app:
    image: example/app
    volumes:
      - ./data:/data
      - /srv/app:/app/data
      - /var/run/docker.sock:/var/run/docker.sock
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
`);

    const result = scanCompose(compose);
    const mounts = findPersistentBindMounts(result);

    expect(mounts.map((mount) => mount.raw)).toEqual(["./data:/data", "/srv/app:/app/data"]);
  });
});
