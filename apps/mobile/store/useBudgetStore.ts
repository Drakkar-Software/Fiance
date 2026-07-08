import React from "react";
import { useWeddingStore } from "./useWeddingStore";
import { useVendorsStore } from "./useVendorsStore";
import { useGuestsStore, computeCounts, type GuestCounts } from "./useGuestsStore";
import type { Vendor, QuotePricing, VendorPayment } from "@/db/schema";
import type { VendorType, PppSource } from "@/db/types";
import { BUDGET_CATEGORIES, PRICING_KEY_GUEST_SOURCE, INVITATION_TYPE_GUEST_SOURCE } from "@/db/types";

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

// ─── Helper: get guest count by ppp_source ──────────────────────────────────

function getGuestCountForSource(
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

// ─── Vendor total calculation ───────────────────────────────────────────────

export function calculateVendorTotal(
  vendor: Vendor,
  counts: GuestCounts,
  quotePricings?: QuotePricing[]
): number {
  // Dynamic per-invitation-type pricing (any vendor); legacy caterer rows fall in here too.
  const pricings = quotePricings ?? [];
  if (isVendorDynamicPricing(vendor, pricings)) {
    return calculateCatererTotal(pricings, counts);
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

  // Invitation-type keys (CEREMONY/COCKTAIL/FULL/BOTH_DAYS) resolve first; fall back to the
  // lowercase caterer pricing keys (dinner/cocktail/…). The two namespaces are disjoint.
  const sourceKey = (INVITATION_TYPE_GUEST_SOURCE[
    key as keyof typeof INVITATION_TYPE_GUEST_SOURCE
  ] ?? PRICING_KEY_GUEST_SOURCE[
    key as keyof typeof PRICING_KEY_GUEST_SOURCE
  ]) as keyof GuestCounts | undefined;

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
    total += p.staffFee || 0;
    total += p.travelFee || 0;
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
    countsTowardBudget: boolean;
  }>;
  totalEngaged: number;
  totalConfirmed: number;
  targetAmount: number | null;
  overage: number;
}

export interface BudgetSummary {
  budgetTarget: number;
  totalEngaged: number;
  totalConfirmed: number;
  remaining: number;
  remainingToPay: number;
  categories: BudgetCategoryItem[];
  isEstimate: boolean;
  depositsTotal: number;
  depositsPaid: number;
}

export function computeBudgetSummary(
  budgetTarget: number,
  vendors: Vendor[],
  quotePricings: QuotePricing[],
  counts: GuestCounts,
  categoryBudgets?: Record<string, number> | null,
  vendorPayments?: VendorPayment[],
): BudgetSummary {
  const isEstimate = counts.accepted === 0 && counts.total > 0;
  let totalEngaged = 0;
  let totalConfirmed = 0;
  let depositsTotal = 0;
  let depositsPaid = 0;
  const payments = vendorPayments ?? [];

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
          // Vendors in a comparison group that lost out (isSelected === false) are
          // quotes, not commitments — they never count toward engaged/confirmed spend.
          const countsTowardBudget = !(vendor.comparisonGroupId && vendor.isSelected === false);

          if (vendor.status !== "CANCELLED" && countsTowardBudget) {
            totalEngaged += calculatedTotal;
            if (isBooked) totalConfirmed += calculatedTotal;
          }

          // Use vendorPayments if available, else fall back to legacy deposit fields
          const vendorPmts = payments.filter((p) => p.vendorId === vendor.id);
          if (vendorPmts.length > 0) {
            const paid = vendorPmts.reduce((sum, p) => sum + p.amount, 0);
            depositsPaid += paid;
            depositsTotal += paid;
          } else if (vendor.depositAmount) {
            depositsTotal += vendor.depositAmount;
            if (vendor.depositPaid) depositsPaid += vendor.depositAmount;
          }

          return { vendor, calculatedTotal, isBooked, countsTowardBudget };
        });

      const catEngaged = categoryVendors.reduce(
        (sum, v) =>
          sum + (v.vendor.status !== "CANCELLED" && v.countsTowardBudget ? v.calculatedTotal : 0),
        0
      );
      const target = categoryBudgets?.[name] ?? null;

      return {
        categoryName: name,
        vendorTypes: types,
        vendors: categoryVendors,
        totalEngaged: catEngaged,
        totalConfirmed: categoryVendors.reduce(
          (sum, v) => sum + (v.isBooked && v.countsTowardBudget ? v.calculatedTotal : 0),
          0
        ),
        targetAmount: target,
        overage: target != null ? Math.max(0, catEngaged - target) : 0,
      };
    }
  );

  return {
    budgetTarget,
    totalEngaged,
    totalConfirmed,
    remaining: budgetTarget - totalEngaged,
    remainingToPay: totalEngaged - depositsPaid,
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
  const categoryBudgetsRaw = useWeddingStore(
    (s) => s.wedding?.categoryBudgets
  );
  const vendors = useVendorsStore((s) => s.vendors);
  const quotePricings = useVendorsStore((s) => s.quotePricings);
  const vendorPayments = useVendorsStore((s) => s.vendorPayments);
  const guests = useGuestsStore((s) => s.guests);
  const counts = React.useMemo(() => computeCounts(guests), [guests]);
  const categoryBudgets = React.useMemo(() => {
    if (!categoryBudgetsRaw) return null;
    try { return JSON.parse(categoryBudgetsRaw) as Record<string, number>; }
    catch { return null; }
  }, [categoryBudgetsRaw]);

  return React.useMemo(
    () => computeBudgetSummary(budgetTarget, vendors, quotePricings, counts, categoryBudgets, vendorPayments),
    [budgetTarget, vendors, quotePricings, counts, categoryBudgets, vendorPayments]
  );
}
