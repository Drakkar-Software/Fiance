import { create } from "zustand";
import { getStorage, writeCollection } from "@/lib/kv-storage";

interface EntitlementsState {
  features: string[];
  setFeatures: (features: string[]) => void;
}

export const useEntitlementsStore = create<EntitlementsState>((set) => ({
  features: [],
  setFeatures: (features) => {
    set({ features });
    const storage = getStorage();
    if (storage) writeCollection("entitlements", features);
  },
}));

/** Hook: returns true if the feature is granted. */
export function useIsEntitled(feature: string): boolean {
  const features = useEntitlementsStore((s) => s.features);
  return features.includes(feature);
}
