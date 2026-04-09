/**
 * Web stub for kv-storage — uses AsyncStorage + in-memory cache.
 * No expo-sqlite imports (no SQLite/WASM on web).
 *
 * initStorage pre-loads all keys so reads stay synchronous everywhere.
 * Writes update the cache immediately and flush to AsyncStorage in background.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const webCache = new Map<string, string>();
let webInitialized = false;

// Opaque sentinel so `if (storage) persist(storage)` guards in stores work.
const WEB_STORAGE_READY = {} as any;

export async function initStorage(_databaseName: string): Promise<any> {
  const keys = await AsyncStorage.getAllKeys();
  if (keys.length > 0) {
    const pairs = await AsyncStorage.multiGet(keys as string[]);
    for (const [key, value] of pairs) {
      if (value != null) webCache.set(key, value);
    }
  }
  webInitialized = true;
  return WEB_STORAGE_READY;
}

export function getStorage(): any {
  return webInitialized ? WEB_STORAGE_READY : null;
}

export function closeStorage(): void {
  webCache.clear();
  webInitialized = false;
}

export function readCollection<T>(key: string): T | null {
  const raw = webCache.get(key) ?? null;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeCollection<T>(key: string, data: T): void {
  const value = JSON.stringify(data);
  webCache.set(key, value);
  AsyncStorage.setItem(key, value); // fire-and-forget
}
