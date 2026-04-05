/**
 * Cloud sync utilities for WeddingOS
 * Handles backup document creation and restoration via Starfish
 */

import { Platform } from "react-native";
import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import type * as schema from "@/db/schema";
import { useWeddingStore } from "@/store/useWeddingStore";
import { useGuestsStore } from "@/store/useGuestsStore";
import { useVendorsStore } from "@/store/useVendorsStore";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useIdeasStore } from "@/store/useIdeasStore";
import { restoreAllTables, hydrateAllStores } from "./persistence";

type DrizzleDB = ExpoSQLiteDatabase<typeof schema>;

export interface BackupData {
  version: number;
  timestamp: string;
  wedding: unknown;
  guests: unknown[];
  tables: unknown[];
  vendors: unknown[];
  quotePricings: unknown[];
  tasks: unknown[];
  taskCategories: unknown[];
  ideas: unknown[];
  ideaCollections: unknown[];
}

const BACKUP_VERSION = 1;

const WEB_STORAGE_KEY = "wedding_data";

/** Save all store state to localStorage (web only, called after every mutation) */
export function saveToLocalStorage(): void {
  if (Platform.OS !== "web") return;
  try {
    localStorage.setItem(WEB_STORAGE_KEY, JSON.stringify(createBackupDocument()));
  } catch {
    // localStorage full or unavailable
  }
}

/** Collect all domain store state into a single backup document */
export function createBackupDocument(): Record<string, unknown> {
  return {
    version: BACKUP_VERSION,
    timestamp: new Date().toISOString(),
    wedding: useWeddingStore.getState().wedding,
    guests: useGuestsStore.getState().guests,
    tables: useGuestsStore.getState().tables,
    vendors: useVendorsStore.getState().vendors,
    quotePricings: useVendorsStore.getState().quotePricings,
    tasks: usePlanningStore.getState().tasks,
    taskCategories: usePlanningStore.getState().categories,
    ideas: useIdeasStore.getState().ideas,
    ideaCollections: useIdeasStore.getState().collections,
  };
}

/** Restore all stores + SQLite from a pulled backup document */
export function restoreFromBackup(
  data: Record<string, unknown>,
  db: DrizzleDB
): void {
  const backup = data as unknown as BackupData;

  if (backup.version > BACKUP_VERSION) {
    throw new Error(
      `Backup version ${backup.version} is newer than app version ${BACKUP_VERSION}. Please update WeddingOS.`
    );
  }

  // Write to SQLite first (source of truth)
  restoreAllTables(db, {
    wedding: backup.wedding,
    guests: (backup.guests || []) as any[],
    tables: (backup.tables || []) as any[],
    vendors: (backup.vendors || []) as any[],
    quotePricings: (backup.quotePricings || []) as any[],
    tasks: (backup.tasks || []) as any[],
    taskCategories: (backup.taskCategories || []) as any[],
    ideas: (backup.ideas || []) as any[],
    ideaCollections: (backup.ideaCollections || []) as any[],
  });

  // Re-hydrate Zustand stores from SQLite
  hydrateAllStores(db);
}
