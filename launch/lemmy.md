Title:
I built an open-source backup readiness checker for Docker Compose stacks

Body:
I built BackupProof, a small open-source CLI for self-hosted Docker Compose stacks:

https://github.com/kozinkaihatusya/backupproof

It scans `docker-compose.yml` and reports:

- persistent named volumes
- persistent bind mounts
- database-like services
- missing backup hints
- missing restore-test / verification hints
- important storage that is not obviously covered by a backup service

It runs locally, supports Docker usage, and does not run backups, run restores, connect to containers, or upload Compose files anywhere.

The goal is not to guarantee recoverability. It is a lightweight review tool to make backup assumptions visible before they become a problem.

Feedback on real-world Compose patterns and false positives would be very welcome.
