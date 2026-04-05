/**
 * Starfish cloud sync integration for WeddingOS
 * Uses createStarfishStore() Zustand binding for reactive sync state
 */

import { StarfishClient, SyncManager } from "@drakkar.software/starfish-client";
import {
  createStarfishStore,
  type StarfishStore,
} from "@drakkar.software/starfish-client/zustand";
import type { StoreApi } from "zustand/vanilla";
import { useStore } from "zustand";
import { createBackupDocument, restoreFromBackup, saveToLocalStorage } from "./sync";
import { getDatabase } from "@/db/provider";

function isIdArray(val: unknown): val is { id: string }[] {
  if (!Array.isArray(val)) return false;
  return val.length === 0 || typeof val[0]?.id === "string";
}

/**
 * Merge two backup documents:
 * - Arrays of objects with `id`: ID-based union (local wins per-item, remote-only items kept)
 * - Everything else: latest timestamp wins
 */
function mergeBackups(
  local: Record<string, unknown>,
  remote: Record<string, unknown>,
): Record<string, unknown> {
  const localTs = (local.timestamp as string) || "";
  const remoteTs = (remote.timestamp as string) || "";
  const remoteNewer = remoteTs > localTs;
  const merged: Record<string, unknown> = { ...local };

  for (const key of Object.keys(remote)) {
    const localVal = local[key];
    const remoteVal = remote[key];

    if (isIdArray(localVal) || isIdArray(remoteVal)) {
      const localArr = (localVal as { id: string }[] | undefined) ?? [];
      const remoteArr = (remoteVal as { id: string }[] | undefined) ?? [];
      const byId = new Map(remoteArr.map((item) => [item.id, item]));
      for (const item of localArr) {
        byId.set(item.id, item);
      }
      merged[key] = Array.from(byId.values());
    } else if (remoteNewer) {
      merged[key] = remoteVal;
    }
  }

  return merged;
}

let store: StoreApi<StarfishStore> | null = null;
let isRestoring = false;

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
    pullPath: `/pull/wedding/${config.userId}`,
    pushPath: `/push/wedding/${config.userId}`,
    encryptionSecret: config.encryptionKey,
    encryptionSalt: config.userId,
    onConflict: (local: unknown, remote: unknown) =>
      mergeBackups(
        local as Record<string, unknown>,
        remote as Record<string, unknown>,
      ),
    maxRetries: 3,
  });

  store = createStarfishStore({
    name: "wedding-sync",
    syncManager,
    storage: false,
    devtools: __DEV__,
  });

  // Subscribe to remote pull results → restore to stores + SQLite
  // restoreFromBackup updates stores via hydrateAllStores which does NOT
  // call notifySync, so no infinite loop. The isRestoring flag is an extra
  // safeguard to prevent notifySync during restore.
  store.subscribe((state, prevState) => {
    if (
      state.data &&
      state.data !== prevState.data &&
      (state.data as Record<string, unknown>).version
    ) {
      isRestoring = true;
      try {
        restoreFromBackup(state.data as Record<string, unknown>, getDatabase());
      } finally {
        isRestoring = false;
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
  saveToLocalStorage();
  if (!store || isRestoring) return;
  store.getState().set(() => createBackupDocument());
}

export function teardownStarfish(): void {
  store = null;
}
