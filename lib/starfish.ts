/**
 * Starfish cloud sync integration for WeddingOS
 * Uses createStarfishStore() Zustand binding for reactive sync state
 */

import { StarfishClient, SyncManager } from "@starfish/client";
import {
  createStarfishStore,
  type StarfishStore,
} from "@starfish/client/zustand";
import type { StoreApi } from "zustand/vanilla";
import { useStore } from "zustand";
import { createBackupDocument, restoreFromBackup } from "./sync";
import { getDatabase } from "@/db/provider";

let store: StoreApi<StarfishStore> | null = null;

export interface StarfishConfig {
  serverUrl: string;
  authToken: string;
  userId: string;
  encryptionKey: string;
}

export function initStarfish(config: StarfishConfig): StoreApi<StarfishStore> {
  const client = new StarfishClient({
    baseUrl: config.serverUrl,
    auth: async () => ({ Authorization: `Bearer ${config.authToken}` }),
  });

  const syncManager = new SyncManager({
    client,
    pullPath: `/pull/users/${config.userId}/wedding`,
    pushPath: `/push/users/${config.userId}/wedding`,
    encryptionSecret: config.encryptionKey,
    encryptionSalt: config.userId,
    onConflict: (local: unknown, remote: unknown) => {
      const localTs = (local as Record<string, string>).timestamp || "";
      const remoteTs = (remote as Record<string, string>).timestamp || "";
      return remoteTs > localTs ? remote : local;
    },
    maxRetries: 3,
  });

  store = createStarfishStore({
    name: "wedding-sync",
    syncManager,
    storage: false,
    devtools: __DEV__,
  });

  // Subscribe to remote pull results → restore to stores + SQLite
  store.subscribe((state, prevState) => {
    if (
      state.data &&
      state.data !== prevState.data &&
      (state.data as Record<string, unknown>).version
    ) {
      const db = getDatabase();
      if (db) {
        restoreFromBackup(state.data as Record<string, unknown>, db);
      }
    }
  });

  return store;
}

export function getStarfishStore(): StoreApi<StarfishStore> | null {
  return store;
}

/** React hook for reading Starfish sync state in components */
export function useStarfishSync<T>(selector: (s: StarfishStore) => T): T {
  if (!store) throw new Error("Starfish not initialized");
  return useStore(store, selector);
}

/**
 * Called by domain stores after every mutation.
 * Pushes the full backup document into the Starfish store,
 * which auto-flushes to the server when online.
 */
export function notifySync(): void {
  if (!store) return;
  store.getState().set(() => createBackupDocument());
}

export function teardownStarfish(): void {
  store = null;
}
