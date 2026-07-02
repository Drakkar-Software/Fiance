/**
 * One-shot buffer for initial wedding fields captured during onboarding.
 *
 * `createWedding` only writes the registry entry; the wedding's DB mounts and
 * hydrates afterward (db/provider.tsx → hydrateAllStores). We stash the couple
 * names + date here at create time and apply them once, inside hydrateAllStores,
 * where getStorage() points at the freshly-initialized DB.
 */
type WeddingSeed = {
  partner1Name: string | null;
  partner2Name: string | null;
  weddingDate: string | null;
};

let pending: WeddingSeed | null = null;

export function setPendingWeddingSeed(seed: WeddingSeed): void {
  pending = seed;
}

export function consumePendingWeddingSeed(): WeddingSeed | null {
  const seed = pending;
  pending = null;
  return seed;
}
