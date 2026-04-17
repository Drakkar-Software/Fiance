/**
 * Starfish cloud sync integration for Fiancé
 * Uses createStarfishStore() Zustand binding for reactive sync state
 *
 */

import { Platform } from "react-native";
import i18n from "i18next";
import {
  StarfishClient,
  SyncManager,
  consoleSyncLogger,
  createUnionMerge,
  createDebouncedSync,
  fetchServerConfig,
  type Encryptor,
} from "@drakkar.software/starfish-client";
import { toast } from "@/lib/toast/sonner";
import { createResilientFetch } from "@drakkar.software/starfish-client/fetch";
import { setupCrossTabSync } from "@drakkar.software/starfish-client/broadcast";
import {
  createStarfishStore,
  type StarfishStore,
} from "@drakkar.software/starfish-client/zustand";
import type { StoreApi } from "zustand/vanilla";
import { useStore } from "zustand";
import { createBackupDocument, restoreFromBackup } from "./sync";
import { getStorage } from "@/lib/kv-storage";

// Re-export Starfish React hooks for components
export { useSyncStatus, useLastSynced } from "@drakkar.software/starfish-client/zustand";

let store: StoreApi<StarfishStore> | null = null;
let activeClient: StarfishClient | null = null;
let crossTabCleanup: (() => void) | null = null;
let debouncedNotify: (() => void) | null = null;
let debouncedCancel: (() => void) | null = null;
let lastSyncTimestamp: string | null = null;

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

export async function initStarfish(config: StarfishConfig, encryptor?: Encryptor): Promise<StoreApi<StarfishStore>> {
  const { fetch: resilientFetch } = createResilientFetch(
    { maxRetries: 3, initialDelayMs: 500 },
    { threshold: 5, cooldownMs: 30_000 },
  );

  const authHeaders = { Authorization: `Bearer ${config.authToken}` };

  // Fetch server collection config to get live limits
  let weddingMaxBytes = 1_048_576;
  try {
    const serverConfig = await fetchServerConfig(config.serverUrl, { headers: authHeaders });
    const weddingCollection = serverConfig.collections.find((c) => c.name === "wedding");
    if (weddingCollection?.maxBodyBytes) weddingMaxBytes = weddingCollection.maxBodyBytes;
  } catch {
    // Fall back to hardcoded limit if config endpoint is unreachable
  }

  const client = new StarfishClient({
    baseUrl: config.serverUrl,
    auth: async () => authHeaders,
    fetch: resilientFetch,
  });
  activeClient = client;

  const syncManager = new SyncManager({
    client,
    pullPath: `/pull/wedding/${config.userId}`,
    pushPath: `/push/wedding/${config.userId}`,
    encryptionSecret: config.encryptionKey,
    encryptionSalt: config.userId,
    encryptor, // takes precedence over encryptionSecret/Salt when set (group-crypto mode)
    onConflict: createUnionMerge({
      timestampKey: "updatedAt",
      documentTimestampKey: "timestamp",
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
    onRemoteUpdate: (data) => {
      restoreFromBackup(data, getStorage());
      lastSyncTimestamp = new Date().toISOString();
    },
  });

  // Track last successful push
  store.subscribe((state, prevState) => {
    if (prevState.syncing && !state.syncing && !state.error) {
      lastSyncTimestamp = new Date().toISOString();
    }
  });

  const debounced = createDebouncedSync(store, {
    delayMs: 2000,
    serialize: () => createBackupDocument(),
    warnBytes: Math.floor(weddingMaxBytes * 0.9),
    maxBytes: weddingMaxBytes,
    onSizeWarning: (bytes) => {
      const kb = Math.round(bytes / 1024);
      const max = Math.round(weddingMaxBytes / 1024);
      console.warn(`[sync] Document ~${kb}KB approaching ${max}KB limit`);
      toast.warning(i18n.t("common:syncSizeWarning", { kb, max }));
    },
    onSizeExceeded: (bytes) => {
      const kb = Math.round(bytes / 1024);
      console.error(`[sync] Document ${kb}KB exceeds ${Math.round(weddingMaxBytes / 1024)}KB server limit, push blocked`);
      toast.error(i18n.t("common:syncSizeExceeded", { kb }));
    },
  });
  debouncedNotify = debounced.notify;
  debouncedCancel = debounced.cancel;

  notifySyncStatus(true);

  // Cross-tab sync for web — keeps multiple browser tabs in sync
  if (Platform.OS === "web") {
    crossTabCleanup = setupCrossTabSync(store, "wedding-sync");
  }

  return store;
}

export function getStarfishStore(): StoreApi<StarfishStore> | null {
  return store;
}

export function getStarfishClient(): StarfishClient | null {
  return activeClient;
}

/** React hook for reading Starfish sync state in components */
export function useStarfishSync<T>(selector: (s: StarfishStore) => T): T {
  if (!store) throw new Error("Starfish not initialized");
  return useStore(store, selector);
}

/**
 * Called by domain stores after every mutation.
 * Debounces the Starfish push to avoid flooding the server during rapid typing.
 */
export function notifySync(): void {
  debouncedNotify?.();
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
  debouncedCancel?.();
  debouncedNotify = null;
  debouncedCancel = null;
  if (crossTabCleanup) {
    crossTabCleanup();
    crossTabCleanup = null;
  }
  store = null;
  activeClient = null;
  lastSyncTimestamp = null;
  notifySyncStatus(false);
}
