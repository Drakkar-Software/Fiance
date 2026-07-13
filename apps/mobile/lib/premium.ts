import { useRevenueCatStore } from "@/store/useRevenueCatStore";

/**
 * Non-reactive snapshot — use outside of components (e.g. guards, lib code).
 * Reflects the wedding OWNER's RevenueCat entitlement (see RevenueCatInitializer
 * in lib/providers.tsx), shared across every collaborator on the wedding.
 */
export function isPremium(): boolean {
  return useRevenueCatStore.getState().isPremium;
}

/** Reactive hook — use in components that need to re-render when entitlements change. */
export function useIsPremium(): boolean {
  return useRevenueCatStore((s) => s.isPremium);
}
