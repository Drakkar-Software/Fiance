// ─── Fiancé domain ────────────────────────────────────────────────────────────
export * from './domain/types.js';
export * from './domain/schema.js';
export * from './domain/guests.js';
export * from './domain/communications.js';
export * from './domain/budget.js';
export * from './domain/planning.js';
export * from './domain/vendor-config.js';
export * from './domain/registry.js';

// ─── Fiancé object model ──────────────────────────────────────────────────────
export * from './objects/object-types.js';
export * from './objects/mappers.js';

// ─── Fiancé sync ──────────────────────────────────────────────────────────────
export * from './sync/backup.js';
export * from './sync/public-page.js';
export * from './sync/rsvp.js';
export * from './sync/export-import-core.js';
export * from './sync/import-legacy.js';
export * from './analytics.js';

// ─── Fiancé config ────────────────────────────────────────────────────────────
export { configureFiance } from './core/config.js';
export type { KvAdapter } from './core/config.js';

// ─── Vendored: per-node content-doc path builders ────────────────────────────
// starfish-spaces' SpaceLayout does not expose per-node objdoc/objinv paths;
// these are app-specific and must mirror drakkar_sync/apps/fiance/collections.py.
export { objDocPush, objDocPull, objInvPush, objInvPull } from './sync/object-paths.js';

// ─── Vendored: in-process live-sync bus ──────────────────────────────────────
// starfish-spaces is lean and ships no built-in event bus.
export {
  registerPull, dispatchDocChange,
  onSseStatus, emitSseStatus, clearLiveSyncBus,
} from './sync/live-bus.js';

// ─── Re-export from starfish-spaces (all public API) ─────────────────────────
export * from '@drakkar.software/starfish-spaces';

// ─── Re-export from starfish-protocol (re-homed symbols) ─────────────────────
export { randomId, encodeLinkFragment, decodeLinkFragment, configurePlatform } from '@drakkar.software/starfish-protocol';
