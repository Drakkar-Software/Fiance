import { getStarfishStore } from "@/lib/starfish";
import { useEntitlementsStore } from "@/store/useEntitlementsStore";
import { useOptimisticPurchaseStore } from "@/store/useOptimisticPurchaseStore";

const PREMIUM_FEATURE = "paid-premium";

export function isPremium(): boolean {
  return true; // TODO: remove once Doubloon + entitlement migration are live
}

/** Reactive hook — use in components that need to re-render when entitlements change. */
export function useIsPremium(): boolean {
  return true; // TODO: remove once Doubloon + entitlement migration are live
}
