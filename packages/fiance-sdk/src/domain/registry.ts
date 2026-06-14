/**
 * Wedding registry — pure CRUD logic with KvAdapter injection.
 * No Expo SecureStore, no expo-sqlite, no expo-crypto.
 * The app supplies a KvAdapter that maps to its platform storage.
 */

// NodeNext .js extension required

// ─── KV adapter interface ────────────────────────────────────────────────────

export interface KvAdapter {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface WeddingRegistryEntry {
  id: string;
  label: string;
  dbFileName: string;
  createdAt: string;
  seedPhrase?: string;
  serverUrl?: string;
  syncDisabled?: boolean;
  /** Partner's unique group-crypto identity (set on partner device during join) */
  memberId?: string;
  /** JSON-serialized GroupKeyring (set on admin device when first invite is created) */
  groupKeyring?: string;
}

export interface WeddingRegistry {
  activeWeddingId: string | null;
  weddings: WeddingRegistryEntry[];
}

const REGISTRY_KEY = "wedding_registry";

const EMPTY_REGISTRY: WeddingRegistry = {
  activeWeddingId: null,
  weddings: [],
};

// ─── CRUD ────────────────────────────────────────────────────────────────────

export async function loadRegistry(kv: KvAdapter): Promise<WeddingRegistry> {
  const raw = await kv.get(REGISTRY_KEY);
  if (!raw) return { ...EMPTY_REGISTRY };
  try {
    return JSON.parse(raw) as WeddingRegistry;
  } catch {
    return { ...EMPTY_REGISTRY };
  }
}

export async function saveRegistry(
  kv: KvAdapter,
  registry: WeddingRegistry
): Promise<void> {
  await kv.set(REGISTRY_KEY, JSON.stringify(registry));
}

export async function createWeddingEntry(
  kv: KvAdapter,
  generateId: () => string,
  label: string,
  seedPhrase?: string,
  serverUrl?: string,
  memberId?: string
): Promise<WeddingRegistryEntry> {
  const id = generateId();
  const entry: WeddingRegistryEntry = {
    id,
    label: label || "Mon mariage",
    dbFileName: `wedding_${id}.db`,
    createdAt: new Date().toISOString(),
    seedPhrase,
    serverUrl,
    memberId,
  };

  const registry = await loadRegistry(kv);
  registry.weddings.push(entry);
  registry.activeWeddingId = id;
  await saveRegistry(kv, registry);

  return entry;
}

export async function deleteWeddingEntry(
  kv: KvAdapter,
  id: string
): Promise<{ dbFileName: string | undefined }> {
  const registry = await loadRegistry(kv);
  const entry = registry.weddings.find((w) => w.id === id);
  const wasActive = registry.activeWeddingId === id;
  registry.weddings = registry.weddings.filter((w) => w.id !== id);
  if (wasActive) {
    registry.activeWeddingId = registry.weddings[0]?.id ?? null;
  }
  await saveRegistry(kv, registry);
  // Return dbFileName so the app can delete the SQLite file / purge KV storage
  return { dbFileName: entry?.dbFileName };
}

export async function setActiveWeddingEntry(
  kv: KvAdapter,
  id: string
): Promise<void> {
  const registry = await loadRegistry(kv);
  if (registry.weddings.some((w) => w.id === id)) {
    registry.activeWeddingId = id;
    await saveRegistry(kv, registry);
  }
}

export async function updateWeddingEntry(
  kv: KvAdapter,
  id: string,
  updates: Partial<
    Pick<
      WeddingRegistryEntry,
      "label" | "seedPhrase" | "serverUrl" | "syncDisabled" | "memberId" | "groupKeyring"
    >
  >
): Promise<void> {
  const registry = await loadRegistry(kv);
  const entry = registry.weddings.find((w) => w.id === id);
  if (entry) {
    Object.assign(entry, updates);
    await saveRegistry(kv, registry);
  }
}
