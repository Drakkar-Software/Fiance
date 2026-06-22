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

import { configureSpaces, type KvAdapter } from '@drakkar.software/starfish-spaces';

export type { KvAdapter };

/**
 * Initialise the Fiancé SDK.
 *
 * @param kv - KV adapter with `{ getItem, setItem, removeItem }` methods.
 *             On native this wraps MMKV; on web it wraps AsyncStorage.
 */
export function configureFiance(kv: KvAdapter): void {
  configureSpaces({ kvAdapter: kv });
}
