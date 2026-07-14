import type { Wedding } from './schema.js';

/**
 * Owner-only, one-way decision: should the wedding entity's premium flag be
 * written true right now?
 *
 * - Owner-only: a member never writes (they inherit the flag via sync — see
 *   apps/mobile/lib/providers.tsx's WeddingPremiumInitializer).
 * - One-way: once premium is true it stays true (lifetime purchase, never
 *   revoked), so this returns false once the wedding is already flagged —
 *   avoids a redundant write + notifySync() on every boot.
 */
export function shouldFlagWeddingPremium(args: {
  isOwner: boolean;
  ownerIsPremium: boolean;
  wedding: Pick<Wedding, 'premium'> | null;
}): boolean {
  return (
    args.isOwner &&
    args.ownerIsPremium &&
    args.wedding != null &&
    args.wedding.premium !== true
  );
}
