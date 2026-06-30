/**
 * Global (account-scoped) KV store for the Fiancé SDK — native.
 *
 * Backed by AsyncStorage — not tied to the active wedding's SQLite file.
 * The SDK's KvAdapter state (caps, pull cache, space-access credentials) is
 * keyed by userId, not by wedding, and must survive wedding switches.
 *
 * Reference: octospaces-platform-sdk/src/kv.native.ts (same pattern).
 * Web override: global-kv.web.ts (localStorage).
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

export function makeGlobalKvAdapter() {
  return {
    getItem: async (key: string): Promise<string | null> => {
      try {
        return await AsyncStorage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem: async (key: string, value: string): Promise<void> => {
      try {
        await AsyncStorage.setItem(key, value);
      } catch {
        /* ignore */
      }
    },
    removeItem: async (key: string): Promise<void> => {
      try {
        await AsyncStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    },
  };
}
