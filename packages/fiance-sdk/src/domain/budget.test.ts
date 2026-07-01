/**
 * Tests for lib/budget.ts — vendor cost calculations, caterer totals,
 * guest count resolution, and caterer scoring.
 */
import { describe, it, expect } from "vitest";

import {
  getGuestCountForSource,
  calculateVendorTotal,
  calculateCatererTotal,
  calculateCatererScore,
  parseContributorAllocations,
  resolveAllocationAmount,
  calculateContributorTotal,
} from './budget.js';
import type { GuestCounts } from './guests.js';
import type { Contributor } from './schema.js';

const baseCounts: GuestCounts = {
  total: 100,
  accepted: 80,
  declined: 10,
  pending: 10,
  maybe: 0,
  cocktail_count: 70,
  dinner_count: 60,
  full_count: 60,
  both_days_count: 40,
  children_count: 5,
  vegetarian_count: 8,
  sleeping_count: 30,
  response_rate: 80,
  no_table_count: 0,
  no_accommodation_count: 0,
  thank_you_pending_count: 0,
};

describe("getGuestCountForSource", () => {
  it("returns cocktail count", () => {
    expect(getGuestCountForSource("COCKTAIL", baseCounts)).toBe(70);
  });

  it("returns full count", () => {
    expect(getGuestCountForSource("FULL", baseCounts)).toBe(60);
  });

  it("returns both_days count", () => {
    expect(getGuestCountForSource("BOTH_DAYS", baseCounts)).toBe(40);
  });

  it("returns child count", () => {
    expect(getGuestCountForSource("CHILD", baseCounts)).toBe(5);
  });

  it("returns vegetarian count", () => {
    expect(getGuestCountForSource("VEGETARIAN", baseCounts)).toBe(8);
  });

  it("returns total for TOTAL source (uses accepted)", () => {
    expect(getGuestCountForSource("TOTAL", baseCounts)).toBe(80);
  });

  it("returns sleeping count", () => {
    expect(getGuestCountForSource("SLEEPING", baseCounts)).toBe(30);
  });

  it("falls back to total when accepted is 0", () => {
    const noAccepted = { ...baseCounts, accepted: 0, cocktail_count: 0 };
    expect(getGuestCountForSource("COCKTAIL", noAccepted)).toBe(100);
  });

  it("returns 0 for unknown source", () => {
    expect(getGuestCountForSource("UNKNOWN" as any, baseCounts)).toBe(0);
  });
});

describe("calculateVendorTotal", () => {
  it("returns base price when no per-person pricing", () => {
    const vendor = { basePrice: 1000, pricePerPerson: null, pppSource: null, type: "PHOTOGRAPHER" } as any;
    expect(calculateVendorTotal(vendor, baseCounts)).toBe(1000);
  });

  it("adds per-person cost based on source", () => {
    const vendor = {
      basePrice: 500,
      pricePerPerson: 10,
      pppSource: "FULL",
      type: "DJ",
    } as any;
    // 500 + 10 * 60 = 1100
    expect(calculateVendorTotal(vendor, baseCounts)).toBe(1100);
  });

  it("returns 0 when no prices set", () => {
    const vendor = { basePrice: null, pricePerPerson: null, pppSource: null, type: "MISC" } as any;
    expect(calculateVendorTotal(vendor, baseCounts)).toBe(0);
  });
});

describe("calculateCatererTotal", () => {
  it("sums per-person costs across pricing keys", () => {
    const pricings = [
      { pricingKey: "dinner", pricePerPerson: 50, guestCountOverride: null, staffFee: 0, travelFee: 0 },
      { pricingKey: "drinks", pricePerPerson: 20, guestCountOverride: null, staffFee: 0, travelFee: 0 },
    ] as any[];
    // dinner: 50 * 60 = 3000, drinks: 20 * 60 = 1200
    expect(calculateCatererTotal(pricings, baseCounts)).toBe(4200);
  });

  it("uses guest count override when provided", () => {
    const pricings = [
      { pricingKey: "dinner", pricePerPerson: 50, guestCountOverride: 100, staffFee: 0, travelFee: 0 },
    ] as any[];
    expect(calculateCatererTotal(pricings, baseCounts)).toBe(5000);
  });

  it("adds staff and travel fees", () => {
    const pricings = [
      { pricingKey: "dinner", pricePerPerson: 50, guestCountOverride: null, staffFee: 200, travelFee: 150 },
    ] as any[];
    // 50 * 60 + 200 + 150 = 3350
    expect(calculateCatererTotal(pricings, baseCounts)).toBe(3350);
  });

  it("returns 0 for empty pricings", () => {
    expect(calculateCatererTotal([], baseCounts)).toBe(0);
  });
});

describe("calculateCatererScore", () => {
  it("returns a score between 0 and 100", () => {
    const vendor = { rating: 3, customFields: JSON.stringify({ services: ["a", "b"], menuSections: 2 }) } as any;
    const pricings = [{ pricingKey: "dinner", pricePerPerson: 50, guestCountOverride: null, staffFee: 0, travelFee: 0 }] as any[];
    const allCaterers = [{ vendor, pricings }];
    const score = calculateCatererScore(vendor, pricings, baseCounts, allCaterers);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("cheaper caterer scores higher on price", () => {
    const cheap = { rating: 3, customFields: "{}" } as any;
    const expensive = { rating: 3, customFields: "{}" } as any;
    const cheapP = [{ pricingKey: "dinner", pricePerPerson: 30, guestCountOverride: null, staffFee: 0, travelFee: 0 }] as any[];
    const expensiveP = [{ pricingKey: "dinner", pricePerPerson: 80, guestCountOverride: null, staffFee: 0, travelFee: 0 }] as any[];
    const all = [{ vendor: cheap, pricings: cheapP }, { vendor: expensive, pricings: expensiveP }];

    const cheapScore = calculateCatererScore(cheap, cheapP, baseCounts, all);
    const expensiveScore = calculateCatererScore(expensive, expensiveP, baseCounts, all);
    expect(cheapScore).toBeGreaterThan(expensiveScore);
  });
});

describe("parseContributorAllocations", () => {
  it("returns [] for null", () => {
    expect(parseContributorAllocations(null)).toEqual([]);
  });

  it("returns [] for invalid JSON", () => {
    expect(parseContributorAllocations("not json")).toEqual([]);
  });

  it("returns [] when JSON is not an array", () => {
    expect(parseContributorAllocations('{"scope":"global","share":50}')).toEqual([]);
  });

  it("parses a valid allocations array", () => {
    const json = JSON.stringify([{ scope: "global", share: 50 }]);
    expect(parseContributorAllocations(json)).toEqual([{ scope: "global", share: 50 }]);
  });
});

describe("resolveAllocationAmount", () => {
  it("resolves a global allocation against the budget target", () => {
    // Regression: 50% of a 30000 target must be 15000, not 0.
    expect(resolveAllocationAmount({ scope: "global", share: 50 }, 30_000, {})).toBe(15_000);
  });

  it("resolves a category allocation against categoryAmounts", () => {
    expect(
      resolveAllocationAmount({ scope: "catering", share: 50 }, 30_000, { catering: 12_000 })
    ).toBe(6_000);
  });

  it("treats an unknown category scope as 0", () => {
    expect(resolveAllocationAmount({ scope: "catering", share: 50 }, 30_000, {})).toBe(0);
  });
});

describe("calculateContributorTotal", () => {
  const baseContributor: Contributor = {
    id: "c1",
    name: "Famille Martin",
    allocations: null,
    createdAt: null,
    updatedAt: null,
  };

  it("returns 0 when allocations is null", () => {
    expect(calculateContributorTotal(baseContributor, 30_000, {})).toBe(0);
  });

  it("sums a single global allocation", () => {
    const contributor = {
      ...baseContributor,
      allocations: JSON.stringify([{ scope: "global", share: 50 }]),
    };
    expect(calculateContributorTotal(contributor, 30_000, {})).toBe(15_000);
  });

  it("sums mixed global and category allocations", () => {
    const contributor = {
      ...baseContributor,
      allocations: JSON.stringify([
        { scope: "global", share: 50 },
        { scope: "catering", share: 50 },
      ]),
    };
    // 50% of 30000 (global) + 50% of 12000 (catering) = 15000 + 6000
    expect(calculateContributorTotal(contributor, 30_000, { catering: 12_000 })).toBe(21_000);
  });
});
