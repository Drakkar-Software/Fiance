import { SQLiteStorage } from "expo-sqlite/kv-store";

let storage: SQLiteStorage | null = null;

export function initStorage(databaseName: string): SQLiteStorage {
  storage = new SQLiteStorage(databaseName);
  return storage;
}

export function getStorage(): SQLiteStorage | null {
  return storage;
}

export function closeStorage(): void {
  storage?.closeSync();
  storage = null;
}

export function readCollection<T>(key: string): T | null {
  const raw = storage?.getItemSync(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeCollection<T>(key: string, data: T): void {
  if (!storage) return;
  storage.setItemSync(key, JSON.stringify(data));
}
