I built BackupProof, an open-source backup readiness checker for self-hosted Docker Compose stacks.

It is a small local CLI that scans `docker-compose.yml` and reports:

- persistent named volumes
- persistent bind mounts
- database-like services
- missing backup hints
- missing restore-test or verification signals
- important storage that is not obviously covered by a backup service

It is designed for self-hosters, homelab users, and small teams running Compose on a VPS, NAS, or home server.

BackupProof does not run backups, run restores, connect to containers, or upload Compose files anywhere. It is not a disaster recovery audit and does not replace a real restore test. The goal is simply to make backup assumptions visible.

GitHub:
https://github.com/kaibuild/backupproof

Feedback on real-world Compose setups, false positives, and missing backup-tool patterns would be very useful.
