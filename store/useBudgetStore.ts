import { useWeddingStore } from "./useWeddingStore";
import { useVendorsStore } from "./useVendorsStore";
import { useGuestsStore, type GuestCounts } from "./useGuestsStore";
import type { Vendor, QuotePricing } from "@/db/schema";
import type { VendorType, PppSource } from "@/db/types";
import { BUDGET_CATEGORIES, PRICING_KEY_GUEST_SOURCE } from "@/db/types";

// ─── Helper: get guest count by ppp_source ──────────────────────────────────

function getGuestCountForSource(
  source: PppSource,
  counts: GuestCounts
): number {
  const useEstimate = counts.accepted === 0 && counts.total > 0;
  const fallback = useEstimate ? counts.total : 0;

  switch (source) {
    case "COCKTAIL":
      return counts.nb_cocktail || fallback;
    case "DINNER":
      return counts.nb_dinner || fallback;
    case "FULL":
      return counts.nb_full || fallback;
    case "NEXT_DAY":
      return counts.nb_next_day || fallback;
    case "CHILD":
      return counts.nb_children || fallback;
    case "VEGETARIAN":
      return counts.nb_vegetarian || fallback;
    case "TOTAL":
      return counts.accepted || counts.total;
    case "SLEEPING":
      return counts.nb_sleeping || fallback;
    default:
      return 0;
  }
}

// ─── Vendor total calculation ───────────────────────────────────────────────

export function calculateVendorTotal(
  vendor: Vendor,
  counts: GuestCounts,
  quotePricings?: QuotePricing[]
): number {
  // Special caterer calculation
  if (vendor.type === "CATERER" && quotePricings && quotePricings.length > 0) {
    return calculateCatererTotal(quotePricings, counts);
  }

  // Standard vendor: base_price + (price_per_person * guest_count)
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

// ─── Caterer total calculation ──────────────────────────────────────────────

function getGuestCountForPricingKey(
  key: string,
  override: number | null,
  counts: GuestCounts
): number {
  if (override != null && override > 0) return override;

  const sourceKey = PRICING_KEY_GUEST_SOURCE[
    key as keyof typeof PRICING_KEY_GUEST_SOURCE
  ] as keyof GuestCounts | undefined;

  if (!sourceKey || sourceKey === ("manual" as any)) return 0;

  const useEstimate = counts.accepted === 0 && counts.total > 0;
  const value = counts[sourceKey];
  if (typeof value === "number") {
    return value || (useEstimate ? counts.total : 0);
  }
  return 0;
}

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
    total += p.forfaitPersonnel || 0;
    total += p.forfaitDeplacement || 0;
  }
  return total;
}

// ─── Budget summary ─────────────────────────────────────────────────────────

export interface BudgetCategoryItem {
  categoryName: string;
  vendorTypes: VendorType[];
  vendors: Array<{
    vendor: Vendor;
    calculatedTotal: number;
    isBooked: boolean;
  }>;
  totalEngaged: number;
  totalConfirmed: number;
}

export interface BudgetSummary {
  budgetTarget: number;
  totalEngaged: number;
  totalConfirmed: number;
  remaining: number;
  categories: BudgetCategoryItem[];
  isEstimate: boolean;
  depositsTotal: number;
  depositsPaid: number;
}

export function computeBudgetSummary(
  budgetTarget: number,
  vendors: Vendor[],
  quotePricings: QuotePricing[],
  counts: GuestCounts
): BudgetSummary {
  const isEstimate = counts.accepted === 0 && counts.total > 0;
  let totalEngaged = 0;
  let totalConfirmed = 0;
  let depositsTotal = 0;
  let depositsPaid = 0;

  const categories: BudgetCategoryItem[] = Object.entries(BUDGET_CATEGORIES).map(
    ([name, types]) => {
      const categoryVendors = vendors
        .filter((v) => types.includes(v.type as VendorType))
        .map((vendor) => {
          const vendorPricings = quotePricings.filter(
            (p) => p.vendorId === vendor.id
          );
          const calculatedTotal = calculateVendorTotal(
            vendor,
            counts,
            vendorPricings
          );
          const isBooked = vendor.status === "BOOKED";

          if (vendor.status !== "CANCELLED") {
            totalEngaged += calculatedTotal;
            if (isBooked) totalConfirmed += calculatedTotal;
          }

          if (vendor.depositAmount) {
            depositsTotal += vendor.depositAmount;
            if (vendor.depositPaid) depositsPaid += vendor.depositAmount;
          }

          return { vendor, calculatedTotal, isBooked };
        });

      return {
        categoryName: name,
        vendorTypes: types,
        vendors: categoryVendors,
        totalEngaged: categoryVendors.reduce(
          (sum, v) =>
            sum + (v.vendor.status !== "CANCELLED" ? v.calculatedTotal : 0),
          0
        ),
        totalConfirmed: categoryVendors.reduce(
          (sum, v) => sum + (v.isBooked ? v.calculatedTotal : 0),
          0
        ),
      };
    }
  );

  return {
    budgetTarget,
    totalEngaged,
    totalConfirmed,
    remaining: budgetTarget - totalEngaged,
    categories,
    isEstimate,
    depositsTotal,
    depositsPaid,
  };
}

/** React hook to get computed budget summary */
export function useBudgetSummary(): BudgetSummary {
  const budgetTarget = useWeddingStore(
    (s) => s.wedding?.budgetTarget ?? 0
  );
  const vendors = useVendorsStore((s) => s.vendors);
  const quotePricings = useVendorsStore((s) => s.quotePricings);
  const counts = useGuestsStore((s) => {
    const guests = s.guests;
    const accepted = guests.filter((g) => g.rsvpStatus === "ACCEPTED");
    const total = guests.length;
    const declinedCount = guests.filter(
      (g) => g.rsvpStatus === "DECLINED"
    ).length;
    const acceptedCount = accepted.length;
    return {
      total,
      accepted: acceptedCount,
      declined: declinedCount,
      pending: guests.filter((g) => g.rsvpStatus === "PENDING").length,
      maybe: guests.filter((g) => g.rsvpStatus === "MAYBE").length,
      nb_cocktail: accepted.filter((g) =>
        ["COCKTAIL", "DINNER", "FULL"].includes(g.invitationType)
      ).length,
      nb_dinner: accepted.filter((g) =>
        ["DINNER", "FULL"].includes(g.invitationType)
      ).length,
      nb_full: accepted.filter((g) => g.invitationType === "FULL").length,
      nb_next_day: accepted.filter((g) => g.invitationType === "NEXT_DAY")
        .length,
      nb_children: accepted.filter((g) => g.isChild).length,
      nb_vegetarian: accepted.filter((g) =>
        ["VEGETARIAN", "VEGAN"].includes(g.diet || "")
      ).length,
      nb_sleeping: accepted.filter((g) => g.isSleeping).length,
      response_rate:
        total > 0
          ? Math.round(((acceptedCount + declinedCount) / total) * 100)
          : 0,
      nb_no_table: accepted.filter((g) => !g.tableId).length,
    } satisfies GuestCounts;
  });

  return computeBudgetSummary(budgetTarget, vendors, quotePricings, counts);
}
