/**
 * Fiancé SDK configuration.
 *
 * Call `configureFiance(kv)` once at app boot (before any SDK call) to
 * register the KV adapter used for account-scoped state (caps, profile
 * cache, pull cache).
 *
 * Transport (baseUrl / namespace) is no longer global — it is injected
 * per-call via the `clientOpts` argument to `deriveSession` / `buildSession`.
 * See `apps/mobile/lib/server.ts` for how `clientOpts` is assembled.
 */

import { configureSpaces, configureSpaceAccessStore, type KvAdapter } from '@drakkar.software/starfish-spaces';

export type { KvAdapter };

/**
 * Initialise the Fiancé SDK.
 *
 * @param kv - KV adapter with `{ getItem, setItem, removeItem }` methods.
 *
 * IMPORTANT: this adapter MUST be a flat, tenant-independent (global) store —
 * never prefixed by active wedding or gated on a wedding being open.
 * All SDK KvAdapter state is account-scoped per-user:
 *   "starfish.spaceaccess.{userId}" — join-link credential (ephemeral KEM keys)
 *   caps / pull-cache keys — also per-user, not per-wedding
 * Routing through a per-wedding-prefixed adapter silently drops the join
 * credential when no wedding is active (the /join flow), breaking sync for all
 * joiners on web after reload.
 *
 * Reference pattern: octospaces-platform-sdk/src/kv.ts (web, raw localStorage)
 * and kv.native.ts (native, raw AsyncStorage) — both flat, global, no prefix.
 * App wiring: apps/mobile/lib/global-kv.web.ts and global-kv.ts.
 */
export function configureFiance(kv: KvAdapter): void {
  configureSpaces({ kvAdapter: kv });
  // Wire the space-access-store KV so link credentials survive app restarts.
  // Without this, persist() is a no-op and joinSpaceByLink credentials are
  // memory-only — wiped on the next identity switch / cold boot.
  configureSpaceAccessStore({ kvAdapter: kv });
}
