/**
 * Premium / in-app purchase gate
 * Reads entitlements from the server via pullEntitlements (Starfish 1.17.0).
 * Falls back to true when sync is not enabled or no entitlements are configured
 * (backward compatibility during rollout).
 */

import { getStarfishStore } from "@/lib/starfish";
import { useEntitlementsStore } from "@/store/useEntitlementsStore";

export function isPremium(): boolean {
  if (!getStarfishStore()) return true; // sync not enabled → no gate
  const { features } = useEntitlementsStore.getState();
  if (features.length === 0) return true; // entitlements not loaded → assume premium
  return features.includes("paid-cloud-sync");
}

/** Reactive hook — use in components that need to re-render when entitlements change. */
export function useIsPremium(): boolean {
  const features = useEntitlementsStore((s) => s.features);
  if (!getStarfishStore()) return true;
  if (features.length === 0) return true;
  return features.includes("paid-cloud-sync");
}
