/**
 * Per-node content-doc path builders for the Fiancé content namespace.
 *
 * starfish-spaces' SpaceLayout exposes objIndexPull/Push, keyring, inbox,
 * profile, and objectDir helpers — but NOT per-node content-doc paths.
 * Those paths are app-specific and must mirror the server's registered
 * collections in `drakkar_sync/apps/fiance/collections.py`.
 *
 * Server storagePaths (fiance-config.ts):
 *   objdoc  → spaces/{spaceId}/objects/docs/{objectId}
 *   objinv  → spaces/{spaceId}/objects/n/{nodeId}/content
 *
 * Both pull and push verbs are prepended so the path can be passed directly
 * to `StarfishClient.pull()` / `.push()`.
 */

/** Push path for an encrypted space-member content doc (collection: objdoc). */
export function objDocPush(spaceId: string, nodeId: string): string {
  return `/push/spaces/${spaceId}/objects/docs/${nodeId}`;
}

/** Pull path for an encrypted space-member content doc (collection: objdoc). */
export function objDocPull(spaceId: string, nodeId: string): string {
  return `/pull/spaces/${spaceId}/objects/docs/${nodeId}`;
}

/** Push path for a cap-gated invite-node content doc (collection: objinv). */
export function objInvPush(spaceId: string, nodeId: string): string {
  return `/push/spaces/${spaceId}/objects/n/${nodeId}/content`;
}

/** Pull path for a cap-gated invite-node content doc (collection: objinv). */
export function objInvPull(spaceId: string, nodeId: string): string {
  return `/pull/spaces/${spaceId}/objects/n/${nodeId}/content`;
}
