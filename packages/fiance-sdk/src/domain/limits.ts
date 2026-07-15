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

export interface QuotaStatus {
  count: number;
  limit: number;
  atCap: boolean;
}

/**
 * Whether a usage badge ("12 / 30") should render for a count-limited entity.
 * Free users only — premium is unlimited, nothing to show. Also hidden at zero
 * so it doesn't compete with the empty-state CTA, which already carries the
 * free-tier message on first use.
 */
export function shouldShowQuotaBadge(count: number, premium: boolean): boolean {
  return !premium && count > 0;
}

/** Current count vs. the free cap for `key`, and whether it's been reached. */
export function getQuotaStatus(key: FreeLimitKey, count: number): QuotaStatus {
  const limit = FREE_LIMITS[key];
  return { count, limit, atCap: count >= limit };
}

/**
 * Would adding `addingCount` more `key` items (e.g. a bulk guest import) push
 * the total past the free cap? Unlike `isWithinFreeLimit` (single add), this
 * covers multi-item adds where the count crossing the cap matters, not just
 * whether it's already at the cap.
 */
export function wouldExceedFreeLimit(
  key: FreeLimitKey,
  currentCount: number,
  addingCount: number,
  premium: boolean,
): boolean {
  return !premium && currentCount + addingCount > FREE_LIMITS[key];
}

/**
 * Maps a `FreeLimitKey` to its `common:premiumLimits.*` i18n key. Not 1:1 —
 * every call site historically hardcoded its own literal key, and
 * `weddingEvents` uses the shorter `events` — so callers building a key from a
 * `FreeLimitKey` dynamically must go through this instead of interpolating
 * the FreeLimitKey directly into a translation key.
 */
export const PREMIUM_LIMIT_MESSAGE_KEY: Record<FreeLimitKey, string> = {
  members: 'members',
  guests: 'guests',
  vendors: 'vendors',
  weddingEvents: 'events',
  tasks: 'tasks',
};

/** Boolean feature gates (no count) — locked on free, unlocked on premium. */
export type PremiumFeature =
  | 'publicPhotos'
  | 'publicGifts'
  | 'publicFaq'
  | 'publicMultiDay'
  | 'budgetCategories'
  | 'budgetContributors'
  | 'budgetMultiCurrency'
  | 'quoteComparison';
