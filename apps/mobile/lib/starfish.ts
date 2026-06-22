/**
 * Starfish v3 / octospaces sync integration for Fiancé.
 *
 * Provides the same public surface as the old v2 file so call-sites in
 * stores and screens don't need mass updates in one commit:
 *
 *   notifySync()            → dispatchDocChange('*') (triggers all registerPull listeners)
 *   getStarfishStore()      → returns a truthy object while sync is active (not a Zustand store)
 *   getStarfishClient()     → returns the active makeClient() StarfishClient
 *   onSyncStatusChange(fn)  → wraps onSseStatus for on/off subscription
 *   getSyncStatus()         → reads the last SSE connection state
 *   getLastSyncTimestamp()  → last successful push timestamp
 *   pullEntitlements()      → v3 cap-cert pull from the fiance namespace
 *   initSync()              → initialise with a v3 Session + spaceId
 *   teardownSync()          → clearLiveSyncBus() + reset state
 *
 * The legacy names initStarfish / teardownStarfish are kept as aliases.
 *
 * B3 note: stores still call notifySync() on every mutation but no registerPull
 * listeners exist yet — dispatchDocChange is a broadcast, not an error. Stores
 * will be wired to readObjectTree in B3.
 */

import {
  makeClient,
  dispatchDocChange,
  onSseStatus,
  emitSseStatus,
  clearLiveSyncBus,
  type Session,
} from '@fiance/sdk';

// ---------------------------------------------------------------------------
// Module state
// ---------------------------------------------------------------------------

let _session: Session | null = null;
let _spaceId: string | null = null;
let _active = false;
let _lastSyncTs: string | null = null;
let _lastUp: boolean | null = null;

// ---------------------------------------------------------------------------
// Compat shim — SyncStatusValue mirrors the v2 API surface
// ---------------------------------------------------------------------------

export type SyncStatusValue = "synced" | "pending" | "syncing" | "error" | "offline";

// ---------------------------------------------------------------------------
// Public API — backward-compatible
// ---------------------------------------------------------------------------

/**
 * Called by domain stores after every mutation.
 * In v3, this signals all registerPull listeners to refresh their collection.
 */
export function notifySync(): void {
  dispatchDocChange('*');
}

/**
 * Returns a truthy sentinel while sync is active. The v2 `StoreApi<StarfishStore>`
 * is gone — callers that only check `!!getStarfishStore()` continue to work.
 *
 * @deprecated Migrate callers to `isSyncActive()`.
 */
export function getStarfishStore(): object | null {
  return _active ? { _v3sentinel: true } : null;
}

export function isSyncActive(): boolean {
  return _active;
}

/**
 * Returns a v3 StarfishClient scoped to the fiance namespace.
 * Returns null before initSync() is called.
 *
 * @deprecated Callers that use pullEntitlements(sfClient, userId) have been
 * updated to use pullEntitlements(null, userId) from this module directly.
 */
export function getStarfishClient(): object | null {
  if (!_session) return null;
  return makeClient(_session.contentCap, _session.keys.edPriv);
}

/**
 * Subscribe to sync active/inactive changes.
 * Returns an unsubscribe function.
 */
export function onSyncStatusChange(listener: (enabled: boolean) => void): () => void {
  listener(_active);
  return onSseStatus((up: boolean) => {
    if (up) _lastSyncTs = new Date().toISOString();
    _lastUp = up;
    listener(up);
  });
}

export function getSyncStatus(): { status: SyncStatusValue; message: string } | null {
  if (!_active) return null;
  if (_lastUp === null) return { status: 'pending', message: 'pending' };
  return _lastUp
    ? { status: 'synced', message: 'synced' }
    : { status: 'offline', message: 'offline' };
}

export function getLastSyncTimestamp(): string | null {
  return _lastSyncTs;
}

// ---------------------------------------------------------------------------
// Pull entitlements — v3 cap-cert (replaces pullEntitlements from starfish-client)
// ---------------------------------------------------------------------------

/**
 * Pull the user's entitlements (premium feature flags) from the fiance namespace
 * using cap-cert auth. Replaces the v2 `pullEntitlements(sfClient, userId)` API.
 *
 * The entitlements collection is read-only via cap-cert; Doubloon writes it via
 * the legacy Bearer path (both share the same R2 key).
 */
export async function pullEntitlements(
  _sfClientOrSession: unknown,
  userId: string,
): Promise<string[]> {
  if (!_session) return [];
  try {
    const client = makeClient(_session.contentCap, _session.keys.edPriv);
    const result = await (client as unknown as { pull: (path: string, hash: number | null) => Promise<{ data: unknown }> })
      .pull(`users/${userId}/entitlements`, null);
    const data = result?.data as Record<string, unknown> | null;
    const features = data?.features;
    if (Array.isArray(features)) return features.filter((f): f is string => typeof f === 'string');
    return [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Init / teardown
// ---------------------------------------------------------------------------

export interface SyncInitConfig {
  session: Session;
  spaceId: string;
  serverUrl: string;
}

/**
 * Initialise the v3 sync layer.
 * Call this once the user's session and space are known.
 * Emits an SSE 'connected' status immediately so UI shows sync as active.
 */
export async function initSync(cfg: SyncInitConfig): Promise<void> {
  _session = cfg.session;
  _spaceId = cfg.spaceId;
  _active = true;
  _lastUp = true;

  // Signal connected so onSyncStatusChange listeners fire.
  emitSseStatus(true);

  // Dispatch so any early registerPull() listeners hydrate immediately.
  dispatchDocChange('*');
}

/** Legacy alias kept for call-sites that import initStarfish. */
export async function initStarfish(
  _legacyConfig: unknown,
  _encryptor?: unknown,
): Promise<object> {
  // v2 callers pass an old ServerConfig; in v3 initSync() is the right entry point.
  // SyncInitializer in providers.tsx is being updated to call initSync() directly.
  // Until all callers are migrated, this is a safe no-op returning a sentinel.
  console.warn('[starfish] initStarfish() is deprecated — use initSync() from lib/starfish');
  return { _v3stub: true };
}

/**
 * Tear down the sync layer — stops SSE, clears all listeners.
 */
export function teardownSync(): void {
  clearLiveSyncBus();
  _session = null;
  _spaceId = null;
  _active = false;
  _lastUp = null;
  emitSseStatus(false);
}

/** Legacy alias. */
export const teardownStarfish = teardownSync;

// ---------------------------------------------------------------------------
// v2 compat shim: subscribeSyncStatus (was in starfish-client/zustand)
// ---------------------------------------------------------------------------

/** @deprecated v2 zustand store listener — use onSseStatus() from @fiance/sdk. */
export function subscribeSyncStatus(
  _store: unknown,
  callback: (status: SyncStatusValue) => void,
): () => void {
  // Fire immediately with current state.
  const current = getSyncStatus();
  if (current) setTimeout(() => callback(current.status), 0);
  return onSseStatus((up: boolean) => {
    callback(up ? 'synced' : 'offline');
  });
}

/** @deprecated Use SyncStatusValue directly. */
export type SyncStatus = SyncStatusValue;

// ---------------------------------------------------------------------------
// Accessors for session / spaceId (used by stores in B3)
// ---------------------------------------------------------------------------

export function getActiveSession(): Session | null {
  return _session;
}

export function getActiveSpaceId(): string | null {
  return _spaceId;
}
