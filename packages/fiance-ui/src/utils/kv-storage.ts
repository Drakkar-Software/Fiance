import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SQLiteStorage } from "expo-sqlite/kv-store";

// ─── Web: in-memory cache backed by AsyncStorage ─────────────────────────────
// initStorage pre-loads all keys so reads stay synchronous everywhere.
// Writes update the cache immediately and flush to AsyncStorage in the background.

const webCache = new Map<string, string>();

// Sentinel returned by getStorage() on web after init, so existing
// `if (storage) persist(storage)` guards in stores work without changes.
const WEB_STORAGE_READY = {} as SQLiteStorage;
let webInitialized = false;

// ─── Native: SQLiteStorage (synchronous KV) ───────────────────────────────────

let nativeStorage: SQLiteStorage | null = null;

// ─── Init ────────────────────────────────────────────────────────────────────

export async function initStorage(databaseName: string): Promise<SQLiteStorage | null> {
  if (Platform.OS === "web") {
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

  nativeStorage = new SQLiteStorage(databaseName);
  return nativeStorage;
}

export function getStorage(): SQLiteStorage | null {
  if (Platform.OS === "web") return webInitialized ? WEB_STORAGE_READY : null;
  return nativeStorage;
}

export function closeStorage(): void {
  if (Platform.OS === "web") {
    webCache.clear();
    webInitialized = false;
  } else {
    nativeStorage?.closeSync();
    nativeStorage = null;
  }
}

// ─── Read / write ─────────────────────────────────────────────────────────────

export function readCollection<T>(key: string): T | null {
  const raw =
    Platform.OS === "web"
      ? webCache.get(key) ?? null
      : nativeStorage?.getItemSync(key) ?? null;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeCollection<T>(key: string, data: T): void {
  const value = JSON.stringify(data);
  if (Platform.OS === "web") {
    webCache.set(key, value);
    AsyncStorage.setItem(key, value); // fire-and-forget
  } else {
    nativeStorage?.setItemSync(key, value);
  }
}
