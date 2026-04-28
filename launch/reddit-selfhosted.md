Title:
I built an open-source backup readiness checker for self-hosted Docker Compose stacks

Body:
I built BackupProof, a small open-source CLI that scans a `docker-compose.yml` file and prints a Markdown report about backup readiness.

GitHub:
https://github.com/kaibuild/backupproof

Why I built it:

I have seen a lot of self-hosted stacks where the backup story is partly implicit. A database volume exists, an uploads folder exists, maybe there is a backup container somewhere, but it is not always obvious what is actually covered or whether anyone has tested a restore.

BackupProof checks for:

- persistent named volumes
- persistent bind mounts
- database-like services such as Postgres, MySQL, MariaDB, MongoDB, Redis, OpenSearch, etc.
- visible backup hints in service names, images, commands, labels, and env
- visible restore-test / verification / recovery hints
- important storage that does not appear to be covered by a backup service

It runs locally and can run with Docker:

```bash
docker build -t backupproof .
docker run --rm -v $(pwd):/scan backupproof scan /scan/docker-compose.yml --format markdown
```

It does not run backups, run restores, connect to containers, or upload Compose files anywhere. It is just a read-only sanity check. It also does not replace a real restore test.

I'm also collecting interest for a hosted SelfHostGuard dashboard and backup setup reviews, but the CLI itself is free and open source.

I would appreciate feedback from people with real self-hosted Compose setups, especially examples where the heuristic gets something wrong or misses a common backup pattern. If it seems useful, a GitHub star also helps other self-hosters find it, but feedback is more useful right now.
