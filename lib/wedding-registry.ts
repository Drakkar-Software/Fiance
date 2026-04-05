/**
 * Wedding registry — manages multiple weddings via SecureStore.
 * Each wedding gets its own SQLite database file.
 */

import * as Crypto from "expo-crypto";
import { secureGet, secureSet } from "./secure-store";

const REGISTRY_KEY = "wedding_registry";

export interface WeddingRegistryEntry {
  id: string;
  label: string;
  dbFileName: string;
  createdAt: string;
  seedPhrase?: string;
  serverUrl?: string;
}

export interface WeddingRegistry {
  activeWeddingId: string | null;
  weddings: WeddingRegistryEntry[];
}

const EMPTY_REGISTRY: WeddingRegistry = {
  activeWeddingId: null,
  weddings: [],
};

export async function loadRegistry(): Promise<WeddingRegistry> {
  const raw = await secureGet(REGISTRY_KEY);
  if (!raw) return EMPTY_REGISTRY;
  try {
    return JSON.parse(raw) as WeddingRegistry;
  } catch {
    return EMPTY_REGISTRY;
  }
}

export async function saveRegistry(registry: WeddingRegistry): Promise<void> {
  await secureSet(REGISTRY_KEY, JSON.stringify(registry));
}

export async function createWeddingEntry(
  label: string,
  seedPhrase?: string,
  serverUrl?: string
): Promise<WeddingRegistryEntry> {
  const id = Crypto.randomUUID();
  const entry: WeddingRegistryEntry = {
    id,
    label: label || "Mon mariage",
    dbFileName: `wedding_${id}.db`,
    createdAt: new Date().toISOString(),
    seedPhrase,
    serverUrl: serverUrl || process.env.EXPO_PUBLIC_SYNC_URL,
  };

  const registry = await loadRegistry();
  registry.weddings.push(entry);
  registry.activeWeddingId = id;
  await saveRegistry(registry);

  return entry;
}

export async function deleteWeddingEntry(id: string): Promise<void> {
  const registry = await loadRegistry();
  registry.weddings = registry.weddings.filter((w) => w.id !== id);
  if (registry.activeWeddingId === id) {
    registry.activeWeddingId = registry.weddings[0]?.id ?? null;
  }
  await saveRegistry(registry);
}

export async function setActiveWeddingEntry(id: string): Promise<void> {
  const registry = await loadRegistry();
  if (registry.weddings.some((w) => w.id === id)) {
    registry.activeWeddingId = id;
    await saveRegistry(registry);
  }
}

export async function updateWeddingEntry(
  id: string,
  updates: Partial<Pick<WeddingRegistryEntry, "label" | "seedPhrase" | "serverUrl">>
): Promise<void> {
  const registry = await loadRegistry();
  const entry = registry.weddings.find((w) => w.id === id);
  if (entry) {
    Object.assign(entry, updates);
    await saveRegistry(registry);
  }
}
