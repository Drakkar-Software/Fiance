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
let lastSyncTimestamp: string | null = null;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
const PUSH_DEBOUNCE_MS = 2000;

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

  // Only restore from explicit remote pulls (user-initiated or join flow).
  // The subscription watches for pull results; local pushes never trigger it
  // because notifySync uses a debounced push that sets isRestoring first.
  store.subscribe((state, prevState) => {
    if (
      state.data &&
      state.data !== prevState.data &&
      (state.data as Record<string, unknown>).version &&
      !isRestoring
    ) {
      isRestoring = true;
      try {
        restoreFromBackup(state.data as Record<string, unknown>, getDatabase());
        lastSyncTimestamp = new Date().toISOString();
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
 * Saves to localStorage immediately (web persistence).
 * Debounces the Starfish push to avoid feedback loops during rapid typing.
 */
export function notifySync(): void {
  saveToLocalStorage();
  if (!store || isRestoring) return;
  // Debounce the remote push — only push after typing settles
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushTimer = null;
    if (!store || isRestoring) return;
    isRestoring = true; // prevent subscription from restoring our own push
    try {
      store.getState().set(() => createBackupDocument());
    } finally {
      isRestoring = false;
    }
    lastSyncTimestamp = new Date().toISOString();
  }, PUSH_DEBOUNCE_MS);
}

export function getLastSyncTimestamp(): string | null {
  return lastSyncTimestamp;
}

export function teardownStarfish(): void {
  if (pushTimer) {
    clearTimeout(pushTimer);
    pushTimer = null;
  }
  store = null;
  lastSyncTimestamp = null;
}
