/**
 * Cloud sync utilities for WeddingOS
 * Handles backup/restore to iCloud and Google Drive
 */

import { encryptData, decryptData } from "./crypto";

export interface BackupData {
  version: number;
  timestamp: string;
  wedding: any;
  guests: any[];
  tables: any[];
  vendors: any[];
  quotePricings: any[];
  tasks: any[];
  taskCategories: any[];
  ideas: any[];
  ideaCollections: any[];
}

const BACKUP_VERSION = 1;
const BACKUP_FILENAME = "weddingos_backup.enc";

/** Create a backup payload from all stores */
export function createBackupPayload(data: Omit<BackupData, "version" | "timestamp">): BackupData {
  return {
    version: BACKUP_VERSION,
    timestamp: new Date().toISOString(),
    ...data,
  };
}

/** Encrypt backup data for cloud storage */
export async function encryptBackup(
  data: BackupData,
  encryptionKey: string
): Promise<string> {
  const json = JSON.stringify(data);
  return encryptData(json, encryptionKey);
}

/** Decrypt and parse a backup from cloud storage */
export async function decryptBackup(
  encrypted: string,
  encryptionKey: string
): Promise<BackupData> {
  const json = await decryptData(encrypted, encryptionKey);
  const data = JSON.parse(json) as BackupData;

  if (data.version > BACKUP_VERSION) {
    throw new Error(
      `Backup version ${data.version} is newer than app version ${BACKUP_VERSION}. Please update WeddingOS.`
    );
  }

  return data;
}

/** Check if cloud backup is newer than local data */
export function isCloudNewer(
  cloudTimestamp: string,
  localTimestamp: string
): boolean {
  return new Date(cloudTimestamp) > new Date(localTimestamp);
}
