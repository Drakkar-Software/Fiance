import { describe, it, expect, vi } from "vitest";
import type { Vendor } from "@/db/schema";
import type { GuestCounts } from "@/store/useGuestsStore";

// computeBudgetSummary is a pure function, but this module also exports a React
// hook that pulls in other Zustand stores (and transitively react-native) —
// mock those out so importing the module doesn't require an RN environment.
vi.mock("@/store/useWeddingStore", () => ({ useWeddingStore: { getState: () => ({ wedding: null }) } }));
vi.mock("@/store/useVendorsStore", () => ({ useVendorsStore: { getState: () => ({ vendors: [], quotePricings: [], vendorPayments: [] }) } }));
vi.mock("@/store/useGuestsStore", () => ({
  useGuestsStore: { getState: () => ({ guests: [] }) },
  computeCounts: () => ({}),
}));

const { computeBudgetSummary } = await import("@/store/useBudgetStore");

const counts: GuestCounts = {
  total: 100,
  accepted: 100,
  declined: 0,
  pending: 0,
  maybe: 0,
  response_rate: 100,
  cocktail_count: 0,
  dinner_count: 100,
  full_count: 100,
  both_days_count: 0,
  inv_by_type: { FULL: 100 },
  inv_by_type_all: { FULL: 100 },
  children_count: 0,
  vegetarian_count: 0,
  sleeping_count: 0,
  no_table_count: 0,
  no_accommodation_count: 0,
  thank_you_pending_count: 0,
};

function makeVendor(overrides: Partial<Vendor> = {}): Vendor {
  return {
    id: "v1",
    type: "CATERER",
    name: "Traiteur",
    contactName: null,
    phone: null,
    email: null,
    website: null,
    status: "BOOKED",
    quoteDate: null,
    eventDate: null,
    basePrice: 1000,
    pricePerPerson: null,
    pppSource: null,
    dynamicPricing: null,
    fixedFee: null,
    countAllGuests: null,
    depositAmount: null,
    depositPaid: null,
    depositDueDate: null,
    balanceDueDate: null,
    validityDate: null,
    customFields: null,
    notes: null,
    rating: null,
    eventId: null,
    comparisonGroupId: null,
    isSelected: null,
    sortOrder: null,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  };
}

describe("computeBudgetSummary — vendor comparison exclusion", () => {
  it("counts a vendor with no comparison group normally", () => {
    const summary = computeBudgetSummary(10_000, [makeVendor({ basePrice: 1000 })], [], counts);
    expect(summary.totalEngaged).toBe(1000);
    expect(summary.totalConfirmed).toBe(1000);
  });

  it("excludes a losing comparison-group vendor (isSelected: false) from engaged/confirmed spend", () => {
    const vendors = [
      makeVendor({ id: "v1", comparisonGroupId: "cmp-caterer", isSelected: true, status: "BOOKED", basePrice: 1000 }),
      makeVendor({ id: "v2", comparisonGroupId: "cmp-caterer", isSelected: false, status: "QUOTE_RECEIVED", basePrice: 1500 }),
    ];
    const summary = computeBudgetSummary(10_000, vendors, [], counts);
    expect(summary.totalEngaged).toBe(1000);
    expect(summary.totalConfirmed).toBe(1000);
  });

  it("still lists the losing vendor for display, just excluded from totals", () => {
    const vendors = [
      makeVendor({ id: "v1", comparisonGroupId: "cmp-caterer", isSelected: true, status: "BOOKED", basePrice: 1000 }),
      makeVendor({ id: "v2", comparisonGroupId: "cmp-caterer", isSelected: false, status: "QUOTE_RECEIVED", basePrice: 1500 }),
    ];
    const summary = computeBudgetSummary(10_000, vendors, [], counts);
    const catererCategory = summary.categories.find((c) => c.categoryName === "catering");
    expect(catererCategory?.vendors).toHaveLength(2);
    expect(catererCategory?.vendors.find((v) => v.vendor.id === "v2")?.countsTowardBudget).toBe(false);
  });
});

describe("computeBudgetSummary — deposits already paid (additive)", () => {
  const pmt = (vendorId: string, amount: number) => ({ vendorId, amount }) as any;

  it("counts the legacy deposit as paid when 'déjà payé' is on", () => {
    const vendors = [makeVendor({ depositAmount: 500, depositPaid: true })];
    const summary = computeBudgetSummary(10_000, vendors, [], counts, null, []);
    expect(summary.depositsPaid).toBe(500);
    expect(summary.depositsTotal).toBe(500);
  });

  it("does not count the deposit as paid when the toggle is off, but expects it", () => {
    const vendors = [makeVendor({ depositAmount: 500, depositPaid: false })];
    const summary = computeBudgetSummary(10_000, vendors, [], counts, null, []);
    expect(summary.depositsPaid).toBe(0);
    expect(summary.depositsTotal).toBe(500);
  });

  it("adds Payments-tab entries ON TOP of the deposit toggle (no longer suppressed)", () => {
    const vendors = [makeVendor({ id: "v1", depositAmount: 500, depositPaid: true })];
    const summary = computeBudgetSummary(10_000, vendors, [], counts, null, [pmt("v1", 300)]);
    // Regression: was 300 (payment suppressed the toggle); now 500 + 300.
    expect(summary.depositsPaid).toBe(800);
    expect(summary.depositsTotal).toBe(800);
  });

  it("counts payments alone when there is no legacy deposit", () => {
    const vendors = [makeVendor({ id: "v1", depositAmount: null, depositPaid: null })];
    const summary = computeBudgetSummary(10_000, vendors, [], counts, null, [pmt("v1", 300)]);
    expect(summary.depositsPaid).toBe(300);
    expect(summary.depositsTotal).toBe(300);
  });
});
