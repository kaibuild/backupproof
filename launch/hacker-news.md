Title:
Show HN: BackupProof - open-source backup readiness checker for Docker Compose

Body:
Hi HN,

I built BackupProof, an open-source backup readiness checker for self-hosted Docker Compose stacks:

https://github.com/kozinkaihatusya/backupproof

It scans a `docker-compose.yml` file and prints a Markdown report that tries to answer a few practical questions:

- which services have persistent named volumes
- which services use persistent bind mounts
- which services look like databases
- whether backup hints are visible
- whether restore-test or verification hints are visible
- which persistent volumes do not appear to be covered by a backup service

It is built for self-hosters, homelab users, and small teams running Compose on a VPS, NAS, or home server.

The tool runs locally. It does not send Compose files anywhere, connect to containers, run backups, or run restores. It is intentionally just a lightweight review tool, not a guarantee that backups are correct.

The MVP is TypeScript, a CLI, and Docker-friendly. Feedback on false positives, missing backup tools, and real-world Compose patterns would be very welcome.
