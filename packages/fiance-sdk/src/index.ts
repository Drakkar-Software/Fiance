// ─── Fiancé domain ────────────────────────────────────────────────────────────
export * from './domain/types.js';
export * from './domain/schema.js';
export * from './domain/guests.js';
export * from './domain/communications.js';
export * from './domain/budget.js';
export * from './domain/planning.js';
export * from './domain/vendor-config.js';
export * from './domain/registry.js';
export * from './domain/wedding-party.js';
export * from './domain/permissions.js';
export * from './domain/seating.js';
export * from './domain/wedding-events.js';
export * from './domain/meal-selections.js';
export * from './domain/communication-templates.js';
export * from './domain/documents.js';
export * from './domain/legal-milestones.js';
export * from './domain/honeymoon.js';
export * from './domain/ceremony.js';
export * from './domain/speeches.js';
export * from './domain/playlist.js';

// ─── Fiancé object model ──────────────────────────────────────────────────────
export * from './objects/object-types.js';
export * from './objects/mappers.js';

// ─── Fiancé sync ──────────────────────────────────────────────────────────────
export * from './sync/backup.js';
export * from './sync/public-page.js';
export * from './sync/rsvp.js';
export * from './sync/export-import-core.js';
export * from './sync/import-legacy.js';
export * from './sync/deep-merge.js';
export * from './sync/collection-doc.js';
export * from './analytics.js';

// Named (not `export *`): starfish-spaces also exports a `buildAuthHeaders` (the
// host:"" version this one replaces — see events.ts's doc comment). A named
// export here wins over the ambiguous `export *` collision with the
// `@drakkar.software/starfish-spaces` re-export below.
export {
  parseSpaceChange, buildAuthHeaders, subscribeSpaceChanges,
} from './sync/events.js';
export type { SpaceChange, SubscribeSpaceChangesOptions } from './sync/events.js';

// ─── Fiancé config ────────────────────────────────────────────────────────────
export { configureFiance, DEFAULT_SYNC_NAMESPACE } from './core/config.js';
export type { FianceConfig, KvAdapter } from './core/config.js';

// ─── Re-export from dk-spaces-sdk: transport config + getters ───────────────
// Source of truth for the sync namespace ('dk') — apps/mobile/lib/server.ts
// and identity.ts read getSyncNamespace() instead of hardcoding the string.
export {
  configureDKSpaces, getSyncBase, getSyncNamespace, getSharedSpacesNamespace,
} from '@drakkar.software/dk-spaces-sdk';

// ─── Re-export from dk-spaces-sdk: per-node content-doc path builders ────────
// starfish-spaces' SpaceLayout does not expose per-node objdoc/objinv paths;
// these mirror the server's registered collections (drakkar_sync/apps/dk_spaces).
export { objDocPush, objDocPull, objInvPush, objInvPull } from '@drakkar.software/dk-spaces-sdk';

// ─── Re-export from dk-spaces-sdk: in-process live-sync bus ─────────────────
export {
  registerPull, dispatchDocChange,
  onSseStatus, emitSseStatus, clearLiveSyncBus,
} from '@drakkar.software/dk-spaces-sdk';

// ─── Re-export from starfish-spaces (all public API) ─────────────────────────
export * from '@drakkar.software/starfish-spaces';

// ─── Re-export from starfish-protocol (re-homed symbols) ─────────────────────
// configurePlatform is NOT re-exported here — platform crypto setup now goes
// through @drakkar.software/dk-spaces-platform-sdk's configureStarfishPlatform().
export { randomId, encodeLinkFragment, decodeLinkFragment } from '@drakkar.software/starfish-protocol';
