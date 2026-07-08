// NodeNext .js extension required
import type { Vendor, QuotePricing, Contributor, ContributorAllocation } from './schema.js';
import type { GuestCounts } from './guests.js';
import type { PppSource } from './types.js';
import { PRICING_KEY_GUEST_SOURCE, INVITATION_TYPE_GUEST_SOURCE } from './types.js';

/**
 * Whether a vendor's total is computed dynamically from per-invitation-type guest lines.
 * Explicit flag wins; otherwise legacy default: any quote-pricing rows imply dynamic
 * (so pre-existing caterer rows keep summing as before).
 */
export function isVendorDynamicPricing(
  vendor: Pick<Vendor, "dynamicPricing">,
  pricings?: QuotePricing[]
): boolean {
  if (vendor.dynamicPricing === true) return true;
  if (vendor.dynamicPricing === false) return false;
  return (pricings?.length ?? 0) > 0;
}

/** Get guest count for a given ppp_source */
export function getGuestCountForSource(
  source: PppSource,
  counts: GuestCounts
): number {
  const useEstimate = counts.accepted === 0 && counts.total > 0;
  const fallback = useEstimate ? counts.total : 0;

  switch (source) {
    case "COCKTAIL":
      return counts.cocktail_count || fallback;
    case "FULL":
      return counts.full_count || fallback;
    case "BOTH_DAYS":
      return counts.both_days_count || fallback;
    case "CHILD":
      return counts.children_count || fallback;
    case "VEGETARIAN":
      return counts.vegetarian_count || fallback;
    case "TOTAL":
      return counts.accepted || counts.total;
    case "SLEEPING":
      return counts.sleeping_count || fallback;
    default:
      return 0;
  }
}

/** Calculate standard vendor total */
export function calculateVendorTotal(
  vendor: Vendor,
  counts: GuestCounts,
  quotePricings?: QuotePricing[]
): number {
  const pricings = quotePricings ?? [];
  if (isVendorDynamicPricing(vendor, pricings)) {
    return calculateCatererTotal(pricings, counts) + (vendor.fixedFee || 0);
  }

  let total = vendor.basePrice || 0;
  if (vendor.pricePerPerson && vendor.pppSource) {
    const guestCount = getGuestCountForSource(
      vendor.pppSource as PppSource,
      counts
    );
    total += vendor.pricePerPerson * guestCount;
  }
  return total;
}

/** Calculate caterer total from quote_pricing rows */
export function calculateCatererTotal(
  pricings: QuotePricing[],
  counts: GuestCounts
): number {
  let total = 0;
  for (const p of pricings) {
    const guestCount = getGuestCountForPricingKey(
      p.pricingKey,
      p.guestCountOverride,
      counts
    );
    total += (p.pricePerPerson || 0) * guestCount;
    total += p.staffFee || 0;
    total += p.travelFee || 0;
  }
  return total;
}

function getGuestCountForPricingKey(
  key: string,
  override: number | null,
  counts: GuestCounts
): number {
  if (override != null && override > 0) return override;

  // Invitation-type keys (CEREMONY/COCKTAIL/FULL/BOTH_DAYS) map to exact per-type counts that
  // already bake in the pre-RSVP estimate — never fall through to the whole-guest-list total.
  const invKey = INVITATION_TYPE_GUEST_SOURCE[key as keyof typeof INVITATION_TYPE_GUEST_SOURCE];
  if (invKey) {
    const v = counts[invKey as keyof GuestCounts];
    return typeof v === "number" ? v : 0;
  }

  // Legacy lowercase caterer pricing keys (dinner/cocktail/…) keep the whole-list estimate.
  const sourceKey = PRICING_KEY_GUEST_SOURCE[key as keyof typeof PRICING_KEY_GUEST_SOURCE];
  if (!sourceKey || sourceKey === "manual") return 0;

  const useEstimate = counts.accepted === 0 && counts.total > 0;
  const value = counts[sourceKey as keyof GuestCounts];
  if (typeof value === "number") {
    return value || (useEstimate ? counts.total : 0);
  }
  return 0;
}

/** Parse a contributor's allocations JSON field. Returns [] on missing/invalid data. */
export function parseContributorAllocations(json: string | null): ContributorAllocation[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Resolve one allocation to a euro amount. `scope: "global"` uses budgetTarget, otherwise looks up categoryAmounts[scope]. */
export function resolveAllocationAmount(
  allocation: ContributorAllocation,
  budgetTarget: number,
  categoryAmounts: Record<string, number>
): number {
  const base =
    allocation.scope === "global" ? budgetTarget : categoryAmounts[allocation.scope] ?? 0;
  return (base * allocation.share) / 100;
}

/** Sum a contributor's allocations into a single euro amount. */
export function calculateContributorTotal(
  contributor: Contributor,
  budgetTarget: number,
  categoryAmounts: Record<string, number>
): number {
  return parseContributorAllocations(contributor.allocations).reduce(
    (sum, allocation) => sum + resolveAllocationAmount(allocation, budgetTarget, categoryAmounts),
    0
  );
}

/** Calculate caterer score /100 */
export function calculateCatererScore(
  vendor: Vendor,
  pricings: QuotePricing[],
  counts: GuestCounts,
  allCaterers: { vendor: Vendor; pricings: QuotePricing[] }[]
): number {
  let score = 0;

  // 1. Prix rapport (30pts) — lower is better
  const repasPrice =
    pricings.find((p) => p.pricingKey === "dinner")?.pricePerPerson || 0;
  if (allCaterers.length > 1) {
    const allPrices = allCaterers
      .map(
        (c) =>
          c.pricings.find((p) => p.pricingKey === "dinner")?.pricePerPerson || 0
      )
      .filter((p) => p > 0);
    if (allPrices.length > 0) {
      const max = Math.max(...allPrices);
      const min = Math.min(...allPrices);
      if (max !== min) {
        score += Math.round(((max - repasPrice) / (max - min)) * 30);
      } else {
        score += 15;
      }
    }
  } else {
    score += 15;
  }

  // 2. Services inclus (25pts)
  const customFields = vendor.customFields
    ? JSON.parse(vendor.customFields)
    : {};
  const services = customFields.services || [];
  score += Math.round((services.length / 13) * 25);

  // 3. Note personnelle (25pts)
  score += Math.round(((vendor.rating || 0) / 5) * 25);

  // 4. Richesse du menu (20pts)
  const menuSections = customFields.menuSections || 0;
  score += Math.round((Math.min(menuSections, 4) / 4) * 20);

  return Math.min(score, 100);
}
