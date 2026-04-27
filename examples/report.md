# BackupProof Report

Scanned file: `examples/risky-compose.yml`

Total findings: 11

## HIGH Risk

### Database volume has no visible backup hint

Service: `db`
Rule: `DATABASE_VOLUME_WITHOUT_BACKUP_HINT`
Severity: `high`

Description:
Service `db` appears to use persistent database storage, but no obvious backup service, backup command, or backup label was detected for it.

Evidence:
```
db_data:/var/lib/postgresql/data
```

Recommendation:
Add a documented backup job or backup service for this datastore. For databases, prefer logical dumps or tested backup tools instead of only copying raw volumes.

### Database volume has no visible backup hint

Service: `cache`
Rule: `DATABASE_VOLUME_WITHOUT_BACKUP_HINT`
Severity: `high`

Description:
Service `cache` appears to use persistent database storage, but no obvious backup service, backup command, or backup label was detected for it.

Evidence:
```
redis_data:/data
```

Recommendation:
Add a documented backup job or backup service for this datastore. For databases, prefer logical dumps or tested backup tools instead of only copying raw volumes.

## MEDIUM Risk

### Persistent storage is not obviously covered by a backup service

Service: `app`
Rule: `IMPORTANT_VOLUME_NOT_OBVIOUSLY_COVERED`
Severity: `medium`

Description:
Service `app` has persistent storage, but BackupProof could not connect it to a visible backup service, backup command, or backup label.

Evidence:
```
./uploads:/app/data
```

Recommendation:
Make the backup relationship explicit. For example, add a backup service, a label, or documentation that names this volume/path and explains how it is restored.

### Persistent storage is not obviously covered by a backup service

Service: `db`
Rule: `IMPORTANT_VOLUME_NOT_OBVIOUSLY_COVERED`
Severity: `medium`

Description:
Service `db` has persistent storage, but BackupProof could not connect it to a visible backup service, backup command, or backup label.

Evidence:
```
db_data:/var/lib/postgresql/data
```

Recommendation:
Make the backup relationship explicit. For example, add a backup service, a label, or documentation that names this volume/path and explains how it is restored.

### Persistent storage is not obviously covered by a backup service

Service: `cache`
Rule: `IMPORTANT_VOLUME_NOT_OBVIOUSLY_COVERED`
Severity: `medium`

Description:
Service `cache` has persistent storage, but BackupProof could not connect it to a visible backup service, backup command, or backup label.

Evidence:
```
redis_data:/data
```

Recommendation:
Make the backup relationship explicit. For example, add a backup service, a label, or documentation that names this volume/path and explains how it is restored.

### Persistent services have no visible restore-test hint

Service: `all`
Rule: `PERSISTENT_SERVICE_WITHOUT_RESTORE_TEST_HINT`
Severity: `medium`

Description:
One or more services use persistent storage, but no restore-test, verification, recovery, or restore documentation hint was detected in the Compose file.

Evidence:
```
app, db, cache
```

Recommendation:
Document a restore-test process and run it on a schedule. A backup that has never been restored is still an assumption.

## LOW Risk

### Persistent named volume detected

Service: `db`
Rule: `PERSISTENT_NAMED_VOLUME_DETECTED`
Severity: `low`

Description:
Service `db` uses a named Docker volume that should be included in backup planning.

Evidence:
```
db_data:/var/lib/postgresql/data
```

Recommendation:
Confirm this named volume is documented, backed up, and included in a restore test.

### Persistent named volume detected

Service: `cache`
Rule: `PERSISTENT_NAMED_VOLUME_DETECTED`
Severity: `low`

Description:
Service `cache` uses a named Docker volume that should be included in backup planning.

Evidence:
```
redis_data:/data
```

Recommendation:
Confirm this named volume is documented, backed up, and included in a restore test.

### Persistent bind mount detected

Service: `app`
Rule: `PERSISTENT_BIND_MOUNT_DETECTED`
Severity: `low`

Description:
Service `app` uses a bind-mounted path that appears to contain persistent data.

Evidence:
```
./uploads:/app/data
```

Recommendation:
Confirm the host path is included in backups and that restore steps are documented.

### Database-like service detected

Service: `db`
Rule: `DATABASE_SERVICE_DETECTED`
Severity: `low`

Description:
Service `db` looks like a database or stateful datastore.

Evidence:
```
image: postgres:16
```

Recommendation:
Use database-aware backups and verify that restore procedures work before relying on them.

### Database-like service detected

Service: `cache`
Rule: `DATABASE_SERVICE_DETECTED`
Severity: `low`

Description:
Service `cache` looks like a database or stateful datastore.

Evidence:
```
image: redis:7
```

Recommendation:
Use database-aware backups and verify that restore procedures work before relying on them.

## Persistent Services Summary

| Service | Database-like | Persistent mounts |
| --- | --- | --- |
| `app` | no | `./uploads:/app/data` |
| `db` | yes | `db_data:/var/lib/postgresql/data` |
| `cache` | yes | `redis_data:/data` |

## Volumes Summary

| Service | Type | Source | Target | Evidence |
| --- | --- | --- | --- | --- |
| `app` | bind | `./uploads` | `/app/data` | `./uploads:/app/data` |
| `db` | named | `db_data` | `/var/lib/postgresql/data` | `db_data:/var/lib/postgresql/data` |
| `cache` | named | `redis_data` | `/data` | `redis_data:/data` |

## Backup hints detected

No backup hints detected.

## Restore-test hints detected

No restore-test hints detected.

## Restore Readiness Checklist

- Identify every persistent volume and bind mount.
- Confirm each volume/path is included in a backup process.
- Document where backups are stored.
- Document the restore command or restore runbook.
- Run a restore test.
- Schedule recurring restore verification.
- Keep at least one backup copy outside the host running the stack.
