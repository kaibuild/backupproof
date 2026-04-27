#!/usr/bin/env node
import { Command } from "commander";
import { parseFailOnThreshold, shouldFailOnThreshold } from "./failOn.js";
import { renderJsonReport, renderMarkdownReport, scanComposeFile } from "./index.js";

const program = new Command();
const EXIT_USAGE_OR_PARSE_ERROR = 2;

program
  .name("backupproof")
  .description("Backup readiness checker for self-hosted Docker Compose stacks")
  .version("0.2.0");

program
  .command("scan")
  .description("Scan a docker-compose.yml file")
  .argument("<file>", "Path to docker-compose.yml")
  .option("-f, --format <format>", "Report format: markdown or json", "markdown")
  .option("--fail-on <severity>", "Exit 1 when findings at or above severity exist: high, medium, low, none", "none")
  .action(async (file: string, options: { format: string; failOn: string }) => {
    try {
      if (options.format !== "markdown" && options.format !== "json") {
        throw new Error(`Unsupported format: ${options.format}. Allowed values are markdown, json.`);
      }

      const failOn = parseFailOnThreshold(options.failOn);
      const result = await scanComposeFile(file);
      const report = options.format === "json" ? renderJsonReport(result) : `${renderMarkdownReport(result)}\n`;
      process.stdout.write(report);

      if (shouldFailOnThreshold(result.findings, failOn)) {
        process.exitCode = 1;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`BackupProof scan failed: ${message}\n`);
      process.exitCode = EXIT_USAGE_OR_PARSE_ERROR;
    }
  });

program.parseAsync(process.argv);
