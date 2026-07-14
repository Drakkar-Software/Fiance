import { create } from "zustand";
import { secureGet, secureSet } from "@/lib/secure-store";

// Tracks which feature areas the user has already visited, so a one-time
// welcome screen shows only on the *first* visit to each feature.
//
// This is intentionally DEVICE-LOCAL, app-wide UI state — persisted with
// secureGet/secureSet (mirrors useSettingsStore), NOT through the per-wedding
// KV/persistence.ts layer and NOT synced via notifySync(). It must survive
// wedding switches (familiarity is per-device, not per-wedding).

const STORAGE_KEY = "wos_seen_features";

interface FeatureTrialsState {
  /** Feature key → whether its welcome has been seen/dismissed. */
  seen: Record<string, boolean>;
  /** False until the persisted set has hydrated — gate UI on this to avoid a flash. */
  isLoaded: boolean;
  load: () => Promise<void>;
  hasSeen: (key: string) => boolean;
  markSeen: (key: string) => void;
}

export const useFeatureTrialsStore = create<FeatureTrialsState>((set, get) => ({
  seen: {},
  isLoaded: false,
  load: async () => {
    try {
      const raw = await secureGet(STORAGE_KEY);
      const keys: string[] = raw ? JSON.parse(raw) : [];
      const seen: Record<string, boolean> = {};
      for (const k of keys) seen[k] = true;
      set({ seen, isLoaded: true });
    } catch {
      // Corrupt/unavailable storage — treat everything as unseen but mark
      // loaded so the app never blocks on this non-critical flag.
      set({ isLoaded: true });
    }
  },
  hasSeen: (key) => !!get().seen[key],
  markSeen: (key) => {
    if (get().seen[key]) return;
    const seen = { ...get().seen, [key]: true };
    set({ seen });
    secureSet(STORAGE_KEY, JSON.stringify(Object.keys(seen))).catch(() => {});
  },
}));
