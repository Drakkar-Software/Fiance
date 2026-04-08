/**
 * Starfish cloud sync integration for WeddingOS
 * Uses createStarfishStore() Zustand binding for reactive sync state
 *
 * v1.5.0: Uses built-in resilient fetch, union merge, structured logging,
 *         cross-tab sync, and restore() method.
 */

import { Platform } from "react-native";
import { StarfishClient, SyncManager, consoleSyncLogger, createUnionMerge } from "@drakkar.software/starfish-client";
import { createResilientFetch } from "@drakkar.software/starfish-client/fetch";
import { setupCrossTabSync } from "@drakkar.software/starfish-client/broadcast";
import {
  createStarfishStore,
  type StarfishStore,
} from "@drakkar.software/starfish-client/zustand";
import type { StoreApi } from "zustand/vanilla";
import { useStore } from "zustand";
import { createBackupDocument, restoreFromBackup, saveToLocalStorage } from "./sync";
import { getDatabase } from "@/db/provider";

// Re-export Starfish React hooks for components
export { useSyncStatus, useLastSynced } from "@drakkar.software/starfish-client/zustand";

let store: StoreApi<StarfishStore> | null = null;
let crossTabCleanup: (() => void) | null = null;
let isRestoring = false;
let lastSyncTimestamp: string | null = null;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
const PUSH_DEBOUNCE_MS = 2000;

// Reactive listeners for sync status changes
type SyncStatusListener = (enabled: boolean) => void;
const syncStatusListeners = new Set<SyncStatusListener>();

function notifySyncStatus(enabled: boolean) {
  for (const listener of syncStatusListeners) listener(enabled);
}

export function onSyncStatusChange(listener: SyncStatusListener): () => void {
  syncStatusListeners.add(listener);
  return () => { syncStatusListeners.delete(listener); };
}

export interface StarfishConfig {
  serverUrl: string;
  authToken: string;
  userId: string;
  encryptionKey: string;
}

export function initStarfish(config: StarfishConfig): StoreApi<StarfishStore> {
  const { fetch: resilientFetch } = createResilientFetch(
    { maxRetries: 3, initialDelayMs: 500 },
    { threshold: 5, cooldownMs: 30_000 },
  );

  const client = new StarfishClient({
    baseUrl: config.serverUrl,
    auth: async () => ({ Authorization: `Bearer ${config.authToken}` }),
    fetch: resilientFetch,
  });

  const syncManager = new SyncManager({
    client,
    pullPath: `/pull/wedding/${config.userId}`,
    pushPath: `/push/wedding/${config.userId}`,
    encryptionSecret: config.encryptionKey,
    encryptionSalt: config.userId,
    onConflict: createUnionMerge({
      timestampField: "updatedAt",
      documentTimestampField: "timestamp",
    }),
    maxRetries: 3,
    loggerName: "wedding-sync",
    logger: consoleSyncLogger,
  });

  store = createStarfishStore({
    name: "wedding-sync",
    syncManager,
    storage: false,
    devtools: __DEV__,
  });

  notifySyncStatus(true);

  // Cross-tab sync for web — keeps multiple browser tabs in sync
  if (Platform.OS === "web") {
    crossTabCleanup = setupCrossTabSync(store, "wedding-sync");
  }

  // Only restore from explicit remote pulls (user-initiated or join flow).
  // The subscription watches for pull results; local pushes never trigger it
  // because notifySync uses restore() which doesn't mark dirty.
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
    // Track last successful sync (push or pull completed without error)
    if (prevState.syncing && !state.syncing && !state.error) {
      lastSyncTimestamp = new Date().toISOString();
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
    const doc = createBackupDocument();
    const size = JSON.stringify(doc).length;
    // Encryption adds ~33% overhead (base64); warn if approaching 1MB server limit
    const estimatedEncryptedSize = Math.ceil(size * 1.34);
    if (estimatedEncryptedSize > 900_000) {
      console.warn(`[sync] Document size ${(size / 1024).toFixed(0)}KB (~${(estimatedEncryptedSize / 1024).toFixed(0)}KB encrypted) approaching 1MB server limit`);
    }
    if (estimatedEncryptedSize > 1_048_576) {
      console.error("[sync] Document exceeds 1MB server limit, push may fail");
    }
    isRestoring = true; // prevent subscription from restoring our own push
    try {
      store!.getState().set(() => doc);
    } finally {
      isRestoring = false;
    }
  }, PUSH_DEBOUNCE_MS);
}

export function getLastSyncTimestamp(): string | null {
  return lastSyncTimestamp;
}

export type SyncStatusValue = "synced" | "pending" | "syncing" | "error" | "offline";

export function getSyncStatus(): { status: SyncStatusValue; message: string } | null {
  if (!store) return null;
  const state = store.getState();
  if (!state.online) return { status: "offline", message: "offline" };
  if (state.error) return { status: "error", message: state.error };
  if (state.syncing) return { status: "syncing", message: "syncing" };
  if (state.dirty) return { status: "pending", message: "pending" };
  return { status: "synced", message: "synced" };
}

export function teardownStarfish(): void {
  if (pushTimer) {
    clearTimeout(pushTimer);
    pushTimer = null;
  }
  if (crossTabCleanup) {
    crossTabCleanup();
    crossTabCleanup = null;
  }
  store = null;
  lastSyncTimestamp = null;
  notifySyncStatus(false);
}
