/**
 * Global (account-scoped) KV store for the Fiancé SDK — web.
 *
 * Backed by raw localStorage — no per-wedding prefix, no active-wedding gate.
 * The SDK's KvAdapter state (caps, pull cache, space-access credentials) is keyed
 * by userId ("starfish.spaceaccess.{userId}"), not by wedding. Routing it through
 * the per-wedding-prefixed/gated web adapter (kv-storage.web.ts) was the root
 * cause of "same space, neither device sees the other's content" on web: at join
 * time there is no active wedding, so getStorage() returns null and the write is
 * silently dropped; the credential lives in memory only and is lost on reload.
 *
 * IMPORTANT: keep this a flat, unprefixed, never-gated passthrough.
 * Reference: octospaces-platform-sdk/src/kv.ts (same pattern).
 * Native counterpart: global-kv.ts (AsyncStorage).
 */

function ls(): Storage | undefined {
  return (globalThis as { localStorage?: Storage }).localStorage;
}

export function makeGlobalKvAdapter() {
  return {
    getItem: async (key: string): Promise<string | null> => {
      try {
        return ls()?.getItem(key) ?? null;
      } catch {
        return null;
      }
    },
    setItem: async (key: string, value: string): Promise<void> => {
      // Let QuotaExceededError propagate (same policy as octospaces kv.ts).
      ls()?.setItem(key, value);
    },
    removeItem: async (key: string): Promise<void> => {
      try {
        ls()?.removeItem(key);
      } catch {
        /* ignore */
      }
    },
  };
}
