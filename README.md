# BackupProof

Open-source backup readiness checker for self-hosted Docker Compose stacks.

BackupProof scans a `docker-compose.yml` file and prints a Markdown or JSON report about persistent services, database volumes, missing backup hints, and missing restore-test signals. It is built for self-hosters, homelab users, small teams, and developers running apps on a VPS, NAS, home server, Tailscale, WireGuard, or a reverse proxy.

BackupProof is a lightweight readiness review tool. It does not guarantee recoverability, run backups, run restores, connect to containers, or replace a real restore test.

## What BackupProof Is

BackupProof is a local, read-only TypeScript CLI for reviewing Docker Compose backup readiness. It parses Compose configuration and looks for common signs that stateful services may not be backed up or restore-tested clearly enough.

It runs locally and does not send your `docker-compose.yml`, findings, or reports anywhere.

## Why BackupProof Exists

Self-hosted stacks often grow one service at a time. A volume gets added, then a database, then uploads, then a cache, then a backup container. Months later, it can be hard to answer basic recovery questions:

- Which services have persistent data?
- Which volumes are database volumes?
- Which paths are bind-mounted from the host?
- Is there an obvious backup process?
- Has anyone documented or run a restore test?

BackupProof tries to make those questions visible from the Compose file before an outage makes them urgent.

## What It Checks

- Persistent named volumes such as `db_data:/var/lib/postgresql/data`
- Bind-mounted persistent paths such as `./data:/data` or `/srv/app:/app/data`
- Database-like services, including PostgreSQL, MySQL, MariaDB, MongoDB, Redis, Elasticsearch, OpenSearch, CouchDB, InfluxDB, TimescaleDB, and CockroachDB
- Backup hints in service names, images, commands, labels, and environment
- Restore-test hints such as `restore-test`, `verify`, `verification`, and `recovery`
- Persistent storage that is not obviously covered by a backup service or backup hint

## Who It Is For

- Self-hosters
- Homelab users
- Small teams running Docker Compose
- Developers running services on VPS, NAS, home servers, Tailscale, WireGuard, or reverse proxies

## Quick Start

```bash
npm install
npm run build
node dist/cli.js scan ./docker-compose.yml --format markdown
```

After installing from npm in the future, the intended command is:

```bash
backupproof scan ./docker-compose.yml --format markdown
```

Markdown is the default output format:

```bash
node dist/cli.js scan ./docker-compose.yml
```

## JSON Output

Use JSON when you want machine-readable output for CI, scripts, or dashboards you build yourself:

```bash
node dist/cli.js scan ./docker-compose.yml --format json
```

The JSON report includes tool metadata, the scanned file path, finding counts by severity, persistent volume counts, database-like service counts, backup hints, restore-test hints, persistent services, volumes, and findings.

## CI Fail Thresholds

Use `--fail-on` to make BackupProof return a failing exit code when findings meet or exceed a severity threshold:

```bash
node dist/cli.js scan ./docker-compose.yml --fail-on high
node dist/cli.js scan ./docker-compose.yml --format json --fail-on medium
```

Allowed values:

- `none` - always exit `0`; this is the default for backward compatibility
- `high` - exit `1` if any high finding exists
- `medium` - exit `1` if any medium or high finding exists
- `low` - exit `1` if any low, medium, or high finding exists

Exit codes:

- `0` - scan completed and the selected threshold was not violated
- `1` - scan completed and the selected `--fail-on` threshold was violated
- `2` - invalid CLI usage or file parsing error

## Run With Docker

```bash
docker build -t backupproof .
docker run --rm -v $(pwd):/scan backupproof scan /scan/docker-compose.yml --format markdown
```

Docker with JSON output:

```bash
docker run --rm -v $(pwd):/scan backupproof scan /scan/docker-compose.yml --format json
```

Docker with CI threshold:

```bash
docker run --rm -v $(pwd):/scan backupproof scan /scan/docker-compose.yml --format json --fail-on high
```

## GitHub Actions

BackupProof can run in CI without contacting your containers or sending Compose files anywhere.

Minimal example:

```yaml
name: BackupProof

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  backupproof:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: npm
      - run: npm ci
      - run: npm run build
      - run: node dist/cli.js scan examples/risky-compose.yml --format markdown --fail-on high
      - run: node dist/cli.js scan examples/risky-compose.yml --format json
```

See [docs/ci-usage.md](docs/ci-usage.md) and [docs/github-actions-example.yml](docs/github-actions-example.yml).

## Example Report

Run the included risky example:

```bash
npm run build
node dist/cli.js scan examples/risky-compose.yml --format markdown
```

The report includes:

- total findings
- findings grouped by severity
- persistent services summary
- volumes summary
- backup hints detected
- restore-test hints detected
- restore readiness checklist

See [examples/report.md](examples/report.md) for a generated example.

## Current Limitations

- No actual backup execution in the MVP
- No actual restore execution in the MVP
- No Kubernetes support in the MVP
- No hosted dashboard in the MVP
- Findings are heuristic checks, not a complete disaster recovery audit
- BackupProof does not guarantee recoverability
- BackupProof does not replace an actual restore test

## Roadmap

- HTML report output
- Better backup tool detection
- Restore-test reminder templates
- Backup schedule detection
- Restic, Kopia, Borg, and Backrest-specific checks
- Hosted dashboard

## Contributing

Contributions are welcome. The project is intentionally small and rule-based so it is easy to review and extend.

Start with [CONTRIBUTING.md](CONTRIBUTING.md). Useful contributions include new detection rules, better examples, documentation improvements, and tests for real-world Compose patterns.

## Community

For now, use GitHub Issues and Discussions if enabled. Please avoid posting secrets, private hostnames, tokens, passwords, or complete production Compose files in public issues.

## Hosted Version / Support Note

Hosted dashboards, scheduled backup readiness scans, alerts, and setup reviews may come later. If you are interested, open an issue or contact the maintainer.

## License

AGPL-3.0-only. See [LICENSE](LICENSE).
