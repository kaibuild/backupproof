# Agent Instructions

## Project Purpose

BackupProof is a TypeScript CLI tool for self-hosted Docker Compose backup readiness review.

The MVP scans Docker Compose files and reports persistent services, database volumes, missing backup hints, and missing restore-test signals. BackupProof must be read-only in the MVP.

## Architecture

- Keep code simple, readable, modular, and easy for open-source contributors to understand.
- Put individual checks in `src/rules/`.
- Put shared types in `src/types.ts`.
- Put report rendering in `src/report/`.
- Keep CLI wiring in `src/cli.ts`.
- Keep parsing in `src/parser.ts`.

## Product Boundaries

- Do not build a web dashboard unless explicitly requested.
- Do not add cloud or hosted functionality unless explicitly requested.
- Do not add authentication unless explicitly requested.
- Do not run backups or restore operations in the MVP.
- Do not modify `docker-compose.yml`.
- Do not connect to containers.
- BackupProof must remain a local, read-only configuration review tool.

## Code Style

- Use TypeScript.
- Prefer small functions and explicit types.
- Keep rule output consistent with the shared `Finding` type.
- Avoid clever abstractions unless they reduce real duplication.
- Keep messages clear, technical, and useful.

## Testing Rules

- Use Vitest.
- Add or update tests when changing parser behavior, rule behavior, or report rendering.
- Run `npm test` before committing.
- Run `npm run build` before committing.
- If Docker behavior changes, run `docker build -t backupproof .` and the documented Docker scan command.

## README Update Rules

- Update `README.md` when CLI usage, supported checks, Docker usage, limitations, or roadmap items change.
- Do not claim BackupProof guarantees recoverability.
- Make it clear that BackupProof runs locally and does not send Compose files or reports anywhere.
- Make it clear that BackupProof does not replace a real restore test.

## Git Workflow Rules

- Work on a feature branch.
- Do not commit unrelated files.
- Do not commit secrets, `.env` files, `node_modules`, `dist`, build artifacts, coverage output, OS junk, or unrelated files.
- Do not force push.
- Check `git status` before staging.
- Stage only files related to the task.
- Run tests and build before committing.

## Security And Safety

- Treat Compose files as potentially sensitive.
- Do not paste secrets into public issues, PRs, logs, examples, or docs.
- Use placeholder credentials in examples.
- Do not add telemetry.
- Do not add network calls from the CLI unless explicitly requested and documented.

## Task Completion Report

End every task with:

- branch name
- commit hash
- push status
- PR link if available
- tests run
- build status
- Docker status if relevant
