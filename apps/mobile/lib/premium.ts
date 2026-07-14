import { useRevenueCatStore } from "@/store/useRevenueCatStore";
import { useWeddingStore } from "@/store/useWeddingStore";

/**
 * Non-reactive snapshot — use outside of components (e.g. guards, lib code).
 * True if either the live RevenueCat entitlement resolved true (see
 * RevenueCatInitializer in lib/providers.tsx, owner-keyed and shared across
 * every collaborator), OR the wedding entity's persisted `premium` flag is set
 * (written once by the owner — see WeddingPremiumInitializer — and synced to
 * every collaborator's device). The persisted flag is what lets premium read
 * true offline/on cold boot, and lets a member never depend on RevenueCat.
 */
export function isPremium(): boolean {
  return (
    useRevenueCatStore.getState().isPremium ||
    useWeddingStore.getState().wedding?.premium === true
  );
}

/** Reactive hook — use in components that need to re-render when entitlements change. */
export function useIsPremium(): boolean {
  const rc = useRevenueCatStore((s) => s.isPremium);
  const flag = useWeddingStore((s) => s.wedding?.premium === true);
  return rc || flag;
}
