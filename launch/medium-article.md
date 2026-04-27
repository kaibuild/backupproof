# How to know if your self-hosted Docker stack is actually backed up

Backups are easy to believe in and harder to trust.

A self-hosted Docker Compose stack might have a backup container, a cron job, a NAS snapshot, or a directory named `backups`. But the useful question is more specific:

If the host failed today, could you restore the application and its data?

For Compose users, that answer is often spread across named volumes, bind mounts, database containers, and undocumented assumptions.

## Why backups are easy to assume and hard to trust

Docker Compose makes stateful services simple to run. A volume can be added in one line. A database can be started in a few seconds. Uploads, config, caches, and search indexes can all become persistent before the backup plan catches up.

The result is a stack that works fine day to day, but is hard to reason about during recovery.

## Mistake 1: Backing up files but not databases correctly

Databases need special care. Copying raw database files while the database is running may not produce a useful backup.

Depending on the database, use logical dumps, database-native backup tools, or snapshots with appropriate consistency guarantees. Most importantly, document and test the restore path.

## Mistake 2: Forgetting named volumes

Named volumes are easy to overlook:

```yaml
services:
  db:
    image: postgres:16
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```

If your backup process copies only the project directory, this data may be missed.

## Mistake 3: No restore-test process

A backup that has never been restored is still an assumption.

Even a simple restore test can reveal missing credentials, incomplete volume coverage, broken commands, or undocumented manual steps.

## Mistake 4: No documentation of what is covered

Backup documentation should name the volumes, paths, schedules, storage locations, and restore steps. This matters even for one-person homelabs because future you may not remember every detail.

## Mistake 5: Depending on one backup location

A backup stored only on the same host may not survive the failure you are trying to recover from. Consider local and remote copies, retention, and restore instructions that remain available when the original machine is gone.

## Why I built BackupProof

I built BackupProof as a small open-source CLI for reviewing Docker Compose backup readiness.

It scans `docker-compose.yml` and reports persistent named volumes, bind mounts, database-like services, missing backup hints, missing restore-test hints, and storage that is not obviously covered by a backup service.

BackupProof runs locally. It does not upload Compose files, connect to containers, run backups, or run restores. It is not a disaster recovery audit and does not replace a real restore test.

It is just a way to make backup assumptions easier to see.

GitHub:
https://github.com/kozinkaihatusya/backupproof
