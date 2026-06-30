/**
 * Deep-merge + stable-stringify — pure helpers for collaborative node-content sync.
 * No React hooks, no store references, no Expo imports.
 *
 * deepMerge: used as the conflict-retry mutator when a node push hits a CAS conflict —
 * the remote (server) doc is `base`, the local edit is `overlay`. Overlay wins on leaves,
 * so a field this device didn't touch is reconciled from the remote instead of clobbered.
 *
 * stableStringify: deterministic (key-sorted) JSON used to detect whether a node's content
 * actually changed since it was last pushed, so unchanged nodes are skipped on push.
 */

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Deep-merge two values. `overlay` wins on leaf/array/primitive conflicts; plain objects recurse. */
export function deepMerge<T>(base: unknown, overlay: T): T {
  if (!isPlainObject(base) || !isPlainObject(overlay)) return overlay;
  const result: Record<string, unknown> = { ...base };
  for (const key of Object.keys(overlay)) {
    result[key] = deepMerge(base[key], overlay[key]);
  }
  return result as T;
}

/** JSON.stringify with object keys sorted recursively, for stable equality/dirty checks. */
export function stableStringify(value: unknown): string {
  return JSON.stringify(value, (_key, val) => {
    if (isPlainObject(val)) {
      const sorted: Record<string, unknown> = {};
      for (const key of Object.keys(val).sort()) sorted[key] = val[key];
      return sorted;
    }
    return val;
  });
}
