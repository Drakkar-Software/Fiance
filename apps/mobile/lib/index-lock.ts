/**
 * Per-space `_index` write serializer.
 *
 * The `objects/_index` doc is a single CAS-keyed document: every writer must
 * pull the current hash, mutate, and push with that hash as `baseHash`. When
 * multiple in-process writers race (seedSpaceObjectIndex, updateObjectIndex from
 * pushSpaceSnapshot, updateObjectIndex from ensurePublicPageNode) they all see
 * the same stale hash and all but the first get a 409 hash_mismatch ConflictError.
 *
 * `withIndexLock` serializes all `_index` writes for a given spaceId into a
 * single promise chain so they execute one after the other. A rejection in one
 * link breaks only that caller — the chain continues for subsequent callers.
 * Cross-device conflicts are still handled by the library's CAS retry (runCas /
 * MAX_ATTEMPTS=3 inside updateObjectIndex).
 */

const _chains = new Map<string, Promise<unknown>>();

/**
 * Serialize `_index` writes for `spaceId` to avoid CAS hash_mismatch races.
 *
 * Usage:
 *   await withIndexLock(spaceId, () => seedSpaceObjectIndex(session, spaceId));
 *   await withIndexLock(spaceId, () => updateObjectIndex(session, spaceId, mutator));
 */
export function withIndexLock<T>(spaceId: string, fn: () => Promise<T>): Promise<T> {
  const prev = _chains.get(spaceId) ?? Promise.resolve();
  // Swallow any error from the previous link so the chain never gets stuck.
  const next = prev.catch(() => {}).then(fn);
  // Store the settled (error-swallowed) tail so errors don't propagate to the next caller.
  _chains.set(spaceId, next.catch(() => {}));
  return next;
}
