import { create } from "zustand";

interface EntitlementsState {
  features: string[];
  setFeatures: (features: string[]) => void;
}

export const useEntitlementsStore = create<EntitlementsState>((set) => ({
  features: [],
  setFeatures: (features) => set({ features }),
}));

/** Hook: returns true if the feature is granted, or if no entitlements loaded (backward compat). */
export function useIsEntitled(feature: string): boolean {
  const features = useEntitlementsStore((s) => s.features);
  if (features.length === 0) return true;
  return features.includes(feature);
}
