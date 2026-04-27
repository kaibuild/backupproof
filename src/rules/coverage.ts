import type { MountedVolume, ScanContext, ServiceAnalysis } from "../types.js";

export function isServiceCoveredByBackup(service: ServiceAnalysis, context: ScanContext): boolean {
  if (service.backupHints.length > 0) {
    return true;
  }

  return service.persistentMounts.some((mount) => isMountCoveredByBackup(mount, context));
}

export function isMountCoveredByBackup(mount: MountedVolume, context: ScanContext): boolean {
  const backupServices = context.services.filter((service) => service.isBackupRelated);

  for (const backupService of backupServices) {
    if (backupService.name === mount.service) {
      continue;
    }

    if (backupService.mounts.some((backupMount) => sameSource(backupMount, mount))) {
      return true;
    }
  }

  const source = mount.source?.toLowerCase();
  const target = mount.target?.toLowerCase();
  const serviceName = mount.service.toLowerCase();

  return context.backupHints.some((hint) => {
    const value = hint.value.toLowerCase();
    return Boolean(
      (source && value.includes(source)) ||
        (target && value.includes(target)) ||
        value.includes(serviceName)
    );
  });
}

function sameSource(a: MountedVolume, b: MountedVolume): boolean {
  if (a.type !== b.type) {
    return false;
  }

  if (!a.source || !b.source) {
    return false;
  }

  return a.source === b.source;
}
