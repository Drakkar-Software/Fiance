import { isWithinFreeLimit, FREE_LIMITS, type FreeLimitKey, type PremiumFeature } from "@fiance/sdk";
import { useIsPremium } from "@/lib/premium";

export { FREE_LIMITS };
export type { FreeLimitKey, PremiumFeature };

/** Reactive: is adding one more `key` (current count `count`) allowed right now? */
export function useCanAddMore(key: FreeLimitKey, count: number): boolean {
  const premium = useIsPremium();
  return isWithinFreeLimit(key, count, premium);
}

/** Reactive: is this boolean feature unlocked? (all gated features are premium-only today) */
export function useHasFeature(_feature: PremiumFeature): boolean {
  return useIsPremium();
}
