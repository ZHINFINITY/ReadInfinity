import { invoke, PermissionState } from '@tauri-apps/api/core';

interface Permissions {
  manageStorage: PermissionState;
}

/**
 * Whether a thrown error is an Android storage-permission denial (EACCES). A
 * custom library folder on shared storage needs All Files Access; without it
 * file writes fail with "Permission denied (os error 13)".
 */
export const isStoragePermissionError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  return /os error 13|permission denied|eacces/i.test(message);
};

export const checkStoragePermission = async (): Promise<boolean> => {
  const permission = await invoke<Permissions>('plugin:native-bridge|check_permissions');
  return permission.manageStorage === 'granted';
};

const sleep = (milliseconds: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });

/**
 * Request Android shared-storage access and re-check after returning from the
 * system All Files Access screen. The native command launches Settings on
 * Android 11+, but its first response is necessarily `denied` while Settings
 * is open; polling prevents the library scan from exiting before the user has
 * granted access.
 */
export const requestStoragePermission = async (): Promise<boolean> => {
  if (await checkStoragePermission()) return true;

  await invoke<Permissions>('plugin:native-bridge|request_manage_storage_permission');

  // The activity may be paused while the system settings page is visible. Once
  // the WebView resumes, this short polling window observes the new grant.
  for (let attempt = 0; attempt < 30; attempt += 1) {
    await sleep(500);
    if (await checkStoragePermission()) return true;
  }
  return false;
};
