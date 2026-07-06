/**
 * Fiancé SDK configuration.
 *
 * Call `configureFiance({ syncBase }, kv)` once at app boot (before any SDK
 * call) to:
 *   1. Seed the global sync transport (`syncBase` + the `dk` namespace) via
 *      dk-spaces-sdk's `configureDKSpaces` — the single source of truth for
 *      `getSyncBase()`/`getSyncNamespace()`, which `apps/mobile/lib/server.ts`
 *      reads when assembling per-call `ClientOpts`.
 *   2. Register the KV adapter (dk-spaces-sdk's `configureKv`, which also
 *      wires starfish-spaces' `configureSpaces`/`configureSpaceAccessStore`
 *      internally, under the fixed `dk.spaceaccess.` key prefix).
 *   3. Install the custom `SpaceLayout` (see `./layout.ts`) that fixes the
 *      wildcard-cap 403 against the `dk` namespace's `spaces`/`devices`
 *      collections.
 */

import { configureSpaces } from '@drakkar.software/starfish-spaces';
import { configureDKSpaces, configureKv, type KvAdapter } from '@drakkar.software/dk-spaces-sdk';
import { fianceLayout } from './layout.js';

export type { KvAdapter };

export interface FianceConfig {
  /** Starfish sync server base URL (no trailing `/v1`). */
  syncBase: string;
}

/**
 * Initialise the Fiancé SDK.
 *
 * @param cfg - `{ syncBase }`, the normalized sync server URL.
 * @param kv - KV adapter with `{ get, set, remove }` methods (dk-spaces-sdk
 *   shape — e.g. `@drakkar.software/dk-spaces-platform-sdk`'s `kvGet/kvSet/kvRemove`).
 *
 * IMPORTANT: this adapter MUST be a flat, tenant-independent (global) store —
 * never prefixed by active wedding or gated on a wedding being open.
 * All SDK KvAdapter state is account-scoped per-user:
 *   "dk.spaceaccess.{userId}" — join-link credential (ephemeral KEM keys)
 *   caps / pull-cache keys — also per-user, not per-wedding
 * Routing through a per-wedding-prefixed adapter silently drops the join
 * credential when no wedding is active (the /join flow), breaking sync for all
 * joiners on web after reload.
 */
export function configureFiance(cfg: FianceConfig, kv: KvAdapter): void {
  configureDKSpaces({
    syncBase: cfg.syncBase,
    syncNamespace: 'dk',
  });
  // Also wires configureSpaces({ kvAdapter }) + configureSpaceAccessStore
  // (kvKeyPrefix: 'dk.spaceaccess.') internally.
  configureKv(kv);
  // Layered on top of configureKv's configureSpaces call (configureSpaces
  // merges, so the kvAdapter set above is preserved).
  configureSpaces({ layout: fianceLayout() });
}
