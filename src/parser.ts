import { readFile } from "node:fs/promises";
import { parse } from "yaml";
import type { ComposeFile } from "./types.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseComposeContent(content: string): ComposeFile {
  const parsed = parse(content);

  if (!isRecord(parsed)) {
    throw new Error("Compose file must contain a YAML object.");
  }

  if (!isRecord(parsed.services)) {
    throw new Error("Compose file must contain a services object.");
  }

  return parsed as ComposeFile;
}

export async function parseComposeFile(filePath: string): Promise<ComposeFile> {
  const content = await readFile(filePath, "utf8");
  return parseComposeContent(content);
}
