/**
 * Wedding registry — manages multiple weddings via SecureStore.
 * Each wedding gets its own SQLite database file.
 */

import * as Crypto from "expo-crypto";
import { deleteDatabaseAsync } from "expo-sqlite";
import type { PermissionMatrix } from "@fiance/sdk";
import { secureGet, secureSet } from "./secure-store";
import { resolveServerUrl } from "./server";

const REGISTRY_KEY = "wedding_registry";

export interface WeddingRegistryEntry {
  id: string;
  label: string;
  dbFileName: string;
  createdAt: string;
  seedPhrase?: string;
  serverUrl?: string;
  syncDisabled?: boolean;
  /** Provisioned starfish-spaces space ID (sp-{id}) for this wedding's object tree. */
  spaceId?: string;
  /**
   * "owner" = this device created the space (default).
   * "member" = this device joined via a space-invite link and must not
   * run owner-only provisioning steps (writeSpaceAccess / ownerEnsureSpaceKeyring).
   */
  role?: "owner" | "member";
  /**
   * The adopted wedding root ObjectNode id in the shared space.
   * For owners: undefined (wedding.id is used directly as the root node id).
   * For members: the owner's root node id, discovered via readObjectTree at first
   *   boot and persisted here so subsequent boots skip the network round-trip.
   * Effective node id = weddingNodeId ?? id.
   */
  weddingNodeId?: string;
  /**
   * The sync namespace `spaceId` was provisioned under (set alongside `spaceId`
   * in space-provision.ts). Missing/mismatched vs the currently configured
   * namespace (`getSyncNamespace()`) means this space is stale — provisioned
   * under a retired namespace — and needs `resyncWeddingToCurrentNamespace()`
   * (see lib/space-resync.ts) before sync will work again.
   */
  syncNamespace?: string;
  /**
   * Collaborator permissions cached for THIS device (members only). Resolved at
   * join time from the owner-authored permission assignment matching this device's
   * invite subject, and refreshed when the synced permissions collection updates.
   * `roleId`/`permissions` undefined ⇒ unrestricted (owners, or legacy members).
   */
  roleId?: string;
  permissions?: PermissionMatrix;
  /**
   * The invite token's ephemeral subject id this device joined as. Kept so the
   * member can re-resolve its role once the owner's permission assignments finish
   * syncing in (they may arrive after the join completes).
   */
  inviteSubjectId?: string;
  /**
   * Owner-side revocation bookkeeping for `revokeSpaceAccess`. `revocationGeneration`
   * is a monotonic per-owner counter; `revokedEntries` is the cumulative RevocationList
   * entry set (the server's acceptList REPLACES, so the full set must be re-sent each time).
   */
  revocationGeneration?: number;
  revokedEntries?: unknown[];
  /**
   * The wedding owner's userId (session.userId of the device with role "owner"),
   * resolved from the space's `_access.owner` field via `readSpaceAccess` and cached
   * here so a member device only needs the network round-trip once. Undefined for
   * owner entries — the owner's own `session.userId` already IS this value. Used to
   * key RevenueCat's appUserID so every collaborator on a wedding reads the same
   * (owner's) premium entitlement — see `resolveOwnerUserId` in lib/server.ts.
   */
  ownerId?: string;
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
  serverUrl?: string,
  spaceId?: string,
  role?: "owner" | "member",
): Promise<WeddingRegistryEntry> {
  const id = Crypto.randomUUID();
  const entry: WeddingRegistryEntry = {
    id,
    label: label || "Mon mariage",
    dbFileName: `wedding_${id}.db`,
    createdAt: new Date().toISOString(),
    seedPhrase,
    serverUrl: resolveServerUrl(serverUrl),
    spaceId,
    role,
  };

  const registry = await loadRegistry();
  registry.weddings.push(entry);
  registry.activeWeddingId = id;
  await saveRegistry(registry);

  return entry;
}

export async function deleteWeddingEntry(id: string): Promise<void> {
  const registry = await loadRegistry();
  const entry = registry.weddings.find((w) => w.id === id);
  const wasActive = registry.activeWeddingId === id;
  registry.weddings = registry.weddings.filter((w) => w.id !== id);
  if (wasActive) {
    registry.activeWeddingId = registry.weddings[0]?.id ?? null;
  }
  await saveRegistry(registry);

  if (entry) {
    await deleteDatabaseAsync(entry.dbFileName);
  }
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
  updates: Partial<Pick<WeddingRegistryEntry, "label" | "seedPhrase" | "serverUrl" | "syncDisabled" | "spaceId" | "role" | "weddingNodeId" | "syncNamespace" | "roleId" | "permissions" | "inviteSubjectId" | "revocationGeneration" | "revokedEntries" | "ownerId">>
): Promise<void> {
  const registry = await loadRegistry();
  const entry = registry.weddings.find((w) => w.id === id);
  if (entry) {
    Object.assign(entry, updates);
    await saveRegistry(registry);
  }
}
