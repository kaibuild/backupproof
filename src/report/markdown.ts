import type { Finding, ScanResult, Severity } from "../types.js";

const severities: Severity[] = ["high", "medium", "low"];

export function renderMarkdownReport(result: ScanResult): string {
  const lines: string[] = [
    "# BackupProof Report",
    "",
    `Scanned file: \`${result.filePath}\``,
    "",
    `Total findings: ${result.findings.length}`,
    ""
  ];

  for (const severity of severities) {
    const findings = result.findings.filter((finding) => finding.severity === severity);
    if (findings.length === 0) {
      continue;
    }

    lines.push(`## ${severity.toUpperCase()} Risk`, "");
    for (const finding of findings) {
      lines.push(...renderFinding(finding), "");
    }
  }

  lines.push(...renderPersistentServices(result), "");
  lines.push(...renderVolumes(result), "");
  lines.push(...renderHints("Backup hints detected", result.backupHints), "");
  lines.push(...renderHints("Restore-test hints detected", result.restoreHints), "");
  lines.push(...renderRestoreChecklist());

  return lines.join("\n").trimEnd();
}

function renderFinding(finding: Finding): string[] {
  return [
    `### ${finding.title}`,
    "",
    `Service: \`${finding.service}\``,
    `Rule: \`${finding.ruleId}\``,
    `Severity: \`${finding.severity}\``,
    "",
    "Description:",
    finding.description,
    "",
    "Evidence:",
    codeBlock(finding.evidence),
    "",
    "Recommendation:",
    finding.recommendation
  ];
}

function renderPersistentServices(result: ScanResult): string[] {
  const lines = ["## Persistent Services Summary", ""];

  if (result.persistentServices.length === 0) {
    return [...lines, "No persistent services detected."];
  }

  lines.push("| Service | Database-like | Persistent mounts |", "| --- | --- | --- |");
  for (const service of result.persistentServices) {
    const mounts = service.persistentMounts.map((mount) => inlineCode(mount.raw)).join("<br>");
    lines.push(`| ${inlineCode(service.name)} | ${service.isDatabaseLike ? "yes" : "no"} | ${mounts} |`);
  }

  return lines;
}

function renderVolumes(result: ScanResult): string[] {
  const lines = ["## Volumes Summary", ""];

  if (result.persistentVolumes.length === 0) {
    return [...lines, "No persistent named volumes or important bind mounts detected."];
  }

  lines.push("| Service | Type | Source | Target | Evidence |", "| --- | --- | --- | --- | --- |");
  for (const volume of result.persistentVolumes) {
    lines.push(
      `| ${inlineCode(volume.service)} | ${volume.type} | ${inlineCode(volume.source ?? "-")} | ${inlineCode(
        volume.target ?? "-"
      )} | ${inlineCode(volume.raw)} |`
    );
  }

  return lines;
}

function renderHints(title: string, hints: ScanResult["backupHints"]): string[] {
  const lines = [`## ${title}`, ""];

  if (hints.length === 0) {
    return [...lines, `No ${title.toLowerCase()}.`];
  }

  for (const hint of hints) {
    lines.push(`- Service ${inlineCode(hint.service)} matched ${inlineCode(hint.keyword)} in ${hint.source}.`);
  }

  return lines;
}

function renderRestoreChecklist(): string[] {
  return [
    "## Restore Readiness Checklist",
    "",
    "- Identify every persistent volume and bind mount.",
    "- Confirm each volume/path is included in a backup process.",
    "- Document where backups are stored.",
    "- Document the restore command or restore runbook.",
    "- Run a restore test.",
    "- Schedule recurring restore verification.",
    "- Keep at least one backup copy outside the host running the stack."
  ];
}

function codeBlock(value: string): string {
  return ["```", value, "```"].join("\n");
}

function inlineCode(value: string): string {
  return `\`${value.replaceAll("|", "\\|")}\``;
}
