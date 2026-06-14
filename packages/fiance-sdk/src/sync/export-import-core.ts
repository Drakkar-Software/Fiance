/**
 * Export / import core — JSON validation and pure restore orchestration.
 * No Expo file I/O, no expo-document-picker, no expo-sharing.
 * The app-side lib/export-import.ts wraps these with platform file APIs.
 */

// NodeNext .js extension required
import { migrateBackup, restoreFromBackup } from './backup.js';
import type { BackupData, WeddingSnapshot } from './backup.js';

export type ImportError = "invalid_json" | "invalid_backup";

export { BackupData, WeddingSnapshot };

/**
 * Build a filename for the exported JSON file.
 * Safe for both web download and native share sheet.
 */
export function buildExportFilename(label: string): string {
  const safe = label.replace(/[^a-zA-Z0-9À-ÿ&_ -]/g, "").trim() || "wedding";
  const date = new Date().toISOString().slice(0, 10);
  return `Fiancé_${safe}_${date}.json`;
}

/**
 * Validate a raw JSON string and return a parsed BackupData.
 * Returns ImportError strings on failure.
 */
export function parseExportDoc(json: string): BackupData | ImportError {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return "invalid_json";
  }

  try {
    return migrateBackup(raw);
  } catch {
    return "invalid_backup";
  }
}

/**
 * Validate an already-parsed object and return a BackupData or ImportError.
 */
export function validateExportDoc(data: Record<string, unknown>): BackupData | ImportError {
  if (!data.version) return "invalid_backup";
  try {
    return migrateBackup(data);
  } catch {
    return "invalid_backup";
  }
}

/**
 * Full restore pipeline: raw JSON → WeddingSnapshot or ImportError.
 */
export function parseAndRestore(json: string): WeddingSnapshot | ImportError {
  const doc = parseExportDoc(json);
  if (typeof doc === "string") return doc;
  return restoreFromBackup(doc);
}
