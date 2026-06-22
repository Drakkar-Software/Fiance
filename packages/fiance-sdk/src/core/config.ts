/**
 * Fiancé SDK configuration.
 *
 * Call `configureFiance(cfg, kv)` once at app boot (before any SDK call) to
 * set the sync server URL, namespace, and the KV adapter used for account-
 * scoped state (caps, profile cache, pull cache).
 */

import {
  configureOctoSpaces,
  configureKv,
  type OctoSpacesConfig,
  type KvAdapter,
} from '@drakkar.software/octospaces-sdk';

export interface FianceConfig extends OctoSpacesConfig {
  /** Fallback max bytes for a single document when /config is unreachable. */
  weddingMaxBytes?: number;
}

/**
 * Initialise the Fiancé SDK.
 *
 * Namespaces:
 * - `syncNamespace: 'fiance'`       — content collections (spaces, objects, blobs…)
 * - `sharedSpacesNamespace: 'octospaces'` — shared registry (_spaces, _access, keyring…)
 */
export function configureFiance(cfg: FianceConfig, kv: KvAdapter): void {
  configureOctoSpaces({
    syncBase: cfg.syncBase,
    syncNamespace: cfg.syncNamespace ?? 'fiance',
    sharedSpacesNamespace: cfg.sharedSpacesNamespace ?? 'octospaces',
    eventsUrl: cfg.eventsUrl,
    onServerReachable: cfg.onServerReachable,
  });
  configureKv(kv);
}
