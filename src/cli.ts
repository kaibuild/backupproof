#!/usr/bin/env node
import { Command } from "commander";
import { renderMarkdownReport, scanComposeFile } from "./index.js";

const program = new Command();

program
  .name("backupproof")
  .description("Backup readiness checker for self-hosted Docker Compose stacks")
  .version("0.1.0");

program
  .command("scan")
  .description("Scan a docker-compose.yml file")
  .argument("<file>", "Path to docker-compose.yml")
  .option("-f, --format <format>", "Report format: markdown", "markdown")
  .action(async (file: string, options: { format: string }) => {
    try {
      if (options.format !== "markdown") {
        throw new Error(`Unsupported format: ${options.format}. The MVP supports markdown only.`);
      }

      const result = await scanComposeFile(file);
      process.stdout.write(`${renderMarkdownReport(result)}\n`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`BackupProof scan failed: ${message}\n`);
      process.exitCode = 1;
    }
  });

program.parseAsync(process.argv);
