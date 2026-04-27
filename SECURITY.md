# Security Policy

BackupProof reviews Docker Compose configuration locally. It does not send Compose files or reports anywhere, and it does not connect to containers.

## Reporting Security Concerns

Please do not paste secrets, private Compose files, tokens, passwords, hostnames, or credentials into public issues.

For now, report security concerns by contacting the maintainer:

`[maintainer contact placeholder]`

If GitHub private vulnerability reporting is enabled for the repository, use that instead.

## Scope

BackupProof is a lightweight backup readiness review tool. It is not a full disaster recovery audit and does not guarantee recoverability.

BackupProof does not:

- run backups
- run restores
- connect to containers
- inspect live databases
- verify backup integrity
- replace a real restore test

Users should run real restore tests and keep documented recovery procedures.
