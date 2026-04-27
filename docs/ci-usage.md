# CI Usage

BackupProof is a local, read-only backup readiness review tool for Docker Compose stacks. It does not run backups, run restore tests, connect to containers, modify Compose files, or send Compose files and reports anywhere.

Use CI to make backup readiness drift visible during pull requests.

## Local Usage

```bash
npm install
npm run build
node dist/cli.js scan ./docker-compose.yml --format markdown
```

Markdown is the default:

```bash
node dist/cli.js scan ./docker-compose.yml
```

## Docker Usage

```bash
docker build -t backupproof .
docker run --rm -v $(pwd):/scan backupproof scan /scan/docker-compose.yml --format markdown
```

JSON output with Docker:

```bash
docker run --rm -v $(pwd):/scan backupproof scan /scan/docker-compose.yml --format json
```

## JSON Output

Use JSON when another tool needs to read the report:

```bash
node dist/cli.js scan ./docker-compose.yml --format json
```

The JSON report includes:

- tool name and version
- scanned file path
- generated timestamp
- finding counts by severity
- persistent volume count
- database-like service count
- backup and restore-test hint counts
- persistent services
- volumes
- backup hints
- restore-test hints
- findings

## Fail-On Thresholds

Use `--fail-on` to make CI fail when findings meet or exceed a selected severity:

```bash
node dist/cli.js scan ./docker-compose.yml --fail-on high
node dist/cli.js scan ./docker-compose.yml --format json --fail-on medium
```

Allowed values:

- `none` - always exit `0`; default
- `high` - exit `1` if any high finding exists
- `medium` - exit `1` if any medium or high finding exists
- `low` - exit `1` if any low, medium, or high finding exists

Exit codes:

- `0` - scan completed and the selected threshold was not violated
- `1` - scan completed and the selected threshold was violated
- `2` - invalid CLI usage or file parsing error

## GitHub Actions Example

See [github-actions-example.yml](github-actions-example.yml).

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

## Recommended Usage

For self-hosted projects, start with:

```bash
node dist/cli.js scan docker-compose.yml --format markdown --fail-on high
```

This fails CI only for high-risk findings, which keeps the signal useful while you tune backup labels, backup services, and restore-test documentation.

Once the project is cleaner, consider:

```bash
node dist/cli.js scan docker-compose.yml --format json --fail-on medium
```

Do not treat a passing BackupProof scan as proof that backups are recoverable. Run real restore tests and keep recovery steps documented.
