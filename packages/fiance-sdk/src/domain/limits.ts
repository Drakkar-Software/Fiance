/**
 * Free-tier quotas + boolean feature gates. Pure, RN-free, unit-tested (mirrors
 * the domain/premium.ts pattern). Numbers live here so tuning is a one-line edit.
 */
export const FREE_LIMITS = {
  members: 1,
  guests: 30,
  vendors: 3,
  weddingEvents: 1,
  tasks: 25,
} as const;

export type FreeLimitKey = keyof typeof FREE_LIMITS;

/**
 * Is adding one more `key` allowed right now? Premium bypasses every cap; free
 * blocks once `currentCount` has reached the cap. Existing over-cap data is
 * never affected — this only governs whether *adding another* is allowed.
 */
export function isWithinFreeLimit(
  key: FreeLimitKey,
  currentCount: number,
  premium: boolean,
): boolean {
  return premium || currentCount < FREE_LIMITS[key];
}

/** Boolean feature gates (no count) — locked on free, unlocked on premium. */
export type PremiumFeature =
  | 'publicPhotos'
  | 'publicGifts'
  | 'budgetCategories'
  | 'budgetContributors'
  | 'budgetMultiCurrency'
  | 'quoteComparison';
