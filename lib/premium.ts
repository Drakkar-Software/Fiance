import { getStarfishStore } from "@/lib/starfish";
import { useEntitlementsStore } from "@/store/useEntitlementsStore";
import { useOptimisticPurchaseStore } from "@/store/useOptimisticPurchaseStore";

const PREMIUM_FEATURE = "paid-premium";

export function isPremium(): boolean {
  if (!getStarfishStore()) return true; // sync not enabled → no gate
  if (useEntitlementsStore.getState().features.includes(PREMIUM_FEATURE)) return true;
  return useOptimisticPurchaseStore.getState().isWithinGrace();
}

/** Reactive hook — use in components that need to re-render when entitlements change. */
export function useIsPremium(): boolean {
  const features = useEntitlementsStore((s) => s.features);
  const record = useOptimisticPurchaseStore((s) => s.record);
  if (!getStarfishStore()) return true;
  if (features.includes(PREMIUM_FEATURE)) return true;
  if (!record) return false;
  return Date.now() - record.purchasedAt < 24 * 60 * 60 * 1000;
}
