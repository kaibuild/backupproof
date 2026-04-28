# How to know if your self-hosted Docker stack is actually backed up

Most backup failures are not dramatic at first. They start as assumptions.

The database volume is probably included. The uploads folder is probably copied. The backup container probably covers the new service. The restore command probably still works.

For self-hosted Docker Compose stacks, those assumptions can accumulate quickly.

## Why backups are easy to assume and hard to trust

Compose makes it simple to add state:

- named volumes
- bind mounts
- databases
- uploaded files
- application config
- backup repositories

That simplicity is useful, but it can hide recovery risk. The stack runs fine, while the backup plan becomes harder to inspect.

## Mistake 1: Backing up files but not databases correctly

Databases should usually be backed up with database-aware tools or consistency-safe snapshots. A raw copy of a live database directory may not be enough.

For example, PostgreSQL, MySQL, MongoDB, and other datastores each have their own backup and restore expectations. The restore path matters as much as the backup command.

## Mistake 2: Forgetting named volumes

Named volumes do not always look like normal project files:

```yaml
services:
  db:
    image: postgres:16
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```

If your script only copies the Compose directory, it may not copy `db_data`.

## Mistake 3: No restore-test process

The only convincing backup test is a restore.

A useful first restore test can be simple:

- restore into a temporary environment
- start the service
- check one important workflow
- write down the steps
- repeat on a schedule

## Mistake 4: No documentation of what is covered

Backup documentation does not need to be long. It needs to be specific.

Name the volumes, host paths, backup destination, schedule, retention, and restore steps. Also record when the restore process was last tested.

## Mistake 5: Depending on one backup location

One backup location can be a single point of failure. If the backup is on the same disk, same host, or same account, it may fail with the system it is supposed to protect.

Local backups are useful. Remote copies and restore documentation are what make them safer.

## Why I built BackupProof

I built BackupProof to make Compose backup assumptions easier to see.

BackupProof is an open-source CLI that scans `docker-compose.yml` and reports:

- persistent named volumes
- persistent bind mounts
- database-like services
- missing backup hints
- missing restore-test hints
- important storage that is not obviously covered by a backup service

It runs locally and is read-only. It does not upload Compose files, connect to containers, run backups, or run restores.

It also does not guarantee recoverability. It is a lightweight review tool, not a replacement for a real restore test.

GitHub:
https://github.com/kaibuild/backupproof
