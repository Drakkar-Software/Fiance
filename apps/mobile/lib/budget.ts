import type { Vendor, QuotePricing } from "@fiance/sdk";
import type { GuestCounts } from "@/store/useGuestsStore";
import type { PppSource } from "@fiance/sdk";
import { PRICING_KEY_GUEST_SOURCE } from "@fiance/sdk";

/**
 * Whether a vendor's total is computed dynamically from per-invitation-type guest lines.
 * Explicit flag wins; otherwise legacy default: any quote-pricing rows imply dynamic.
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
    const countAll = vendor.countAllGuests !== false; // default: count all invited guests
    return calculateCatererTotal(pricings, counts, countAll) + (vendor.fixedFee || 0);
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

/**
 * Calculate caterer total from quote_pricing rows.
 * `countAll` (default true) picks the all-invited count pool; false = confirmed (ACCEPTED) only.
 */
export function calculateCatererTotal(
  pricings: QuotePricing[],
  counts: GuestCounts,
  countAll: boolean = true
): number {
  let total = 0;
  for (const p of pricings) {
    const guestCount = getGuestCountForPricingKey(
      p.pricingKey,
      p.guestCountOverride,
      counts,
      countAll
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
  counts: GuestCounts,
  countAll: boolean
): number {
  if (override != null && override > 0) return override;

  // Legacy lowercase caterer pricing keys (dinner/cocktail/…) keep the whole-list estimate.
  const sourceKey = PRICING_KEY_GUEST_SOURCE[key as keyof typeof PRICING_KEY_GUEST_SOURCE];
  if (sourceKey && sourceKey !== "manual") {
    const useEstimate = counts.accepted === 0 && counts.total > 0;
    const value = counts[sourceKey as keyof GuestCounts];
    if (typeof value === "number") {
      return value || (useEstimate ? counts.total : 0);
    }
    return 0;
  }

  // Otherwise the key is an invitation-type id (the dynamic useInvitationTypesStore id,
  // including custom types). Resolve against the all-invited or confirmed-only count map.
  const byType = countAll ? counts.inv_by_type_all : counts.inv_by_type;
  return byType[key] ?? 0;
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
