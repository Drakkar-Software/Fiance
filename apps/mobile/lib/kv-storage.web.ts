/**
 * Web stub for kv-storage — uses localStorage + in-memory cache.
 * No expo-sqlite imports (no SQLite/WASM on web).
 *
 * Mirror of @drakkar.software/seahorse kv-storage.web.ts — duplicated here
 * because seahorse's package.json exports don't expose the web build via a
 * 'browser' condition, so Metro always resolves to the native (sqlite) build.
 *
 * Each wedding is namespaced in localStorage as `<dbFileName>::<key>` to
 * prevent data leaking across weddings when switching or after deletion.
 */

const webCache = new Map<string, string>();
let webInitialized = false;
let activePrefix = "";

// Opaque sentinel so `if (storage) persist(storage)` guards in stores work.
// Also exposes getItemSync/setItemSync/removeItemSync so makeKvAdapter (providers.tsx)
// can cache SDK caps/keyring on web via localStorage.
const WEB_STORAGE_READY = {
  getItemSync: (k: string) => localStorage.getItem(activePrefix + k),
  setItemSync: (k: string, v: string) => localStorage.setItem(activePrefix + k, v),
  removeItemSync: (k: string) => localStorage.removeItem(activePrefix + k),
} as any;

// All collection keys written by persistence.ts — used for one-shot migration.
const KNOWN_COLLECTION_KEYS = [
  "wedding",
  "guests",
  "guestGroups",
  "tables",
  "vendors",
  "quotePricings",
  "vendorPayments",
  "taskCategories",
  "tasks",
  "agendaEvents",
  "dayOfItems",
  "ideaCollections",
  "ideas",
  "accommodations",
  "gifts",
  "invitationTypes",
  "entitlements",
  "optimisticPurchase",
];

export async function initStorage(databaseName: string): Promise<any> {
  activePrefix = `${databaseName}::`;
  webCache.clear();

  // Load all prefixed keys for this wedding into the cache (unprefixed).
  let hasPrefixedKeys = false;
  for (let i = 0; i < localStorage.length; i++) {
    const lsKey = localStorage.key(i);
    if (lsKey && lsKey.startsWith(activePrefix)) {
      hasPrefixedKeys = true;
      const logicalKey = lsKey.slice(activePrefix.length);
      const value = localStorage.getItem(lsKey);
      if (value != null) webCache.set(logicalKey, value);
    }
  }

  // One-shot migration: if no prefixed keys exist yet but bare keys do,
  // migrate bare keys to the current wedding's namespace and remove the originals.
  if (!hasPrefixedKeys && localStorage.getItem("wedding") != null) {
    for (const key of KNOWN_COLLECTION_KEYS) {
      const bare = localStorage.getItem(key);
      if (bare != null) {
        localStorage.setItem(activePrefix + key, bare);
        webCache.set(key, bare);
        localStorage.removeItem(key);
      }
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
  activePrefix = "";
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
  if (activePrefix) {
    localStorage.setItem(activePrefix + key, value);
  }
}

/** Remove all localStorage keys belonging to a given wedding database file. */
export function purgeStorage(dbFileName: string): void {
  const prefix = `${dbFileName}::`;
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) toRemove.push(key);
  }
  for (const key of toRemove) {
    localStorage.removeItem(key);
  }
}
