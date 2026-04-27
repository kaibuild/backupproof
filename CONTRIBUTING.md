# Contributing

Thanks for considering a contribution to BackupProof.

BackupProof is intentionally small: parse Docker Compose, run readable rules, render a useful report. Contributions that keep that shape are easiest to review.

## Install

```bash
npm install
```

## Run Tests

```bash
npm test
```

## Build

```bash
npm run build
```

## Run The CLI

```bash
npm run build
node dist/cli.js scan examples/risky-compose.yml --format markdown
```

Or with Docker:

```bash
docker build -t backupproof .
docker run --rm -v $(pwd):/scan backupproof scan /scan/examples/risky-compose.yml --format markdown
```

## Add A New Rule

1. Add the rule in `src/rules/`.
2. Export a stable `ruleId`.
3. Return findings that match `Finding` in `src/types.ts`.
4. Add the rule to the `rules` list in `src/index.ts`.
5. Add focused tests in `tests/`.
6. Update `README.md` if the user-visible checks change.

## Open An Issue Or PR

Please include:

- what you expected
- what happened
- a minimal Compose snippet with secrets removed
- the command you ran
- your Node.js version

## Coding Style

- Keep code readable and direct.
- Prefer explicit names over abbreviations.
- Keep rule descriptions actionable.
- Add tests for parser and rule changes.
- Do not add telemetry, cloud calls, authentication, backup execution, or restore execution without prior discussion.

## Safety

Do not include secrets, private hostnames, tokens, real passwords, `.env` files, or full production Compose files in public issues or PRs.
