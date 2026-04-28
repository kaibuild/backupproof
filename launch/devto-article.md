# How to know if your self-hosted Docker stack is actually backed up

Backups are one of those things that can look finished long before they are actually trustworthy.

You might have a cron job. You might have a backup container. You might have a NAS snapshot. You might have a folder named `backups`. But when a disk fails or a VPS disappears, the real question is narrower:

Can you restore the application and its data?

For self-hosted Docker Compose stacks, the answer is often hidden across named volumes, bind mounts, database containers, backup scripts, and undocumented assumptions.

## Why backups are easy to assume and hard to trust

Docker Compose makes it easy to run stateful services. That is good, but it also means persistent data can appear in several places:

- named Docker volumes
- host bind mounts
- database data directories
- uploaded files
- application config
- backup repository paths

Over time, a Compose stack can grow from "just one service" into a small production system. The backup plan may not grow at the same pace.

## Mistake 1: Backing up files but not databases correctly

Copying a database data directory is not always enough. Depending on the database and timing, raw file copies can produce inconsistent backups.

For databases, prefer a database-aware approach:

- logical dumps such as `pg_dump`, `mysqldump`, or `mongodump`
- backup tools designed for that database
- filesystem snapshots with the right consistency guarantees
- documented restore steps

The important part is not just that a backup exists. It is that the backup can be restored into a working service.

## Mistake 2: Forgetting named volumes

Named volumes are easy to miss because they do not always appear as obvious host paths.

Example:

```yaml
services:
  db:
    image: postgres:16
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```

If your backup process only copies project files, it may miss `db_data` entirely.

## Mistake 3: No restore-test process

A backup that has never been restored is still an assumption.

Restore tests do not have to be elaborate at first. Even a small recurring checklist is better than nothing:

- restore the database into a temporary environment
- start the app against restored data
- confirm login and one important workflow
- document what failed or took too long

The goal is to discover gaps before an emergency.

## Mistake 4: No documentation of what is covered

Backup systems are often obvious to the person who built them and unclear to everyone else.

Good backup documentation should answer:

- which volumes are backed up
- which bind mounts are backed up
- where backups are stored
- how often backups run
- how to restore
- when the last restore test happened

This is especially important for small teams and homelabs where maintenance happens in bursts.

## Mistake 5: Depending on one backup location

If the only backup lives on the same machine as the stack, it may not help after disk loss, ransomware, accidental deletion, or provider failure.

At minimum, consider whether you have:

- one local backup for fast restore
- one remote backup for host failure
- retention that protects against accidental deletion
- restore documentation that does not depend on the failed machine

## Why I built BackupProof

I built BackupProof to make these assumptions visible in Docker Compose stacks.

BackupProof is an open-source CLI that scans `docker-compose.yml` and reports:

- persistent named volumes
- persistent bind mounts
- database-like services
- missing backup hints
- missing restore-test hints
- important storage that is not obviously covered by a backup service

It runs locally. It does not upload Compose files, connect to containers, run backups, or run restores.

It also does not guarantee recoverability. It is a lightweight readiness review tool, not a replacement for a real restore test.

## What might come next

If the CLI proves useful, I may explore SelfHostGuard as a hosted dashboard for scheduled scans, restore-test reminders, scan history, backup risk changes over time, and alerts.

That does not exist yet. The CLI is still free and open source, and real restore tests are still required.

## GitHub link

GitHub:
https://github.com/kaibuild/backupproof
