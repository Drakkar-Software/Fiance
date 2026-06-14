/**
 * Tests for sync migration helpers — v1→v2 pricing key renames,
 * idea category renames, invitation type migrations, task status normalization.
 * Tests the migration logic directly without importing the full sync module.
 */
import { describe, it, expect } from "vitest";

// Replicate the migration logic from lib/sync.ts to test in isolation

const PRICING_KEY_MAP: Record<string, string> = {
  repas: "dinner",
  boisson: "drinks",
  lendemain: "next-day",
  vaisselle: "tableware",
  nappe: "linen",
  vegetarien: "vegetarian",
  enfant: "child",
  presta: "service",
};

const IDEA_CATEGORY_MAP: Record<string, string> = {
  DECO_TABLE: "TABLE_DECOR",
  DECO_SALLE: "VENUE_DECOR",
  DECO_CEREMONIE: "CEREMONY_DECOR",
  TENUE: "ATTIRE",
  GATEAU: "CAKE",
  LIEU: "VENUE",
};

function migrateQuotePricing(p: any): any {
  const needsFieldRename =
    (p.forfaitPersonnel != null && p.staffFee == null) ||
    (p.forfaitDeplacement != null && p.travelFee == null);
  const needsKeyRename = p.pricingKey && PRICING_KEY_MAP[p.pricingKey];
  if (!needsFieldRename && !needsKeyRename) return p;

  const migrated = { ...p };
  if (p.forfaitPersonnel != null && p.staffFee == null) {
    migrated.staffFee = p.forfaitPersonnel;
    delete migrated.forfaitPersonnel;
  }
  if (p.forfaitDeplacement != null && p.travelFee == null) {
    migrated.travelFee = p.forfaitDeplacement;
    delete migrated.forfaitDeplacement;
  }
  if (needsKeyRename) {
    migrated.pricingKey = PRICING_KEY_MAP[p.pricingKey];
  }
  return migrated;
}

function migrateIdea(idea: any): any {
  if (idea.category && IDEA_CATEGORY_MAP[idea.category]) {
    return { ...idea, category: IDEA_CATEGORY_MAP[idea.category] };
  }
  return idea;
}

function migrateInvitationType(type: string): string {
  return type === "DINNER" ? "FULL" : type === "NEXT_DAY" ? "BOTH_DAYS" : type;
}

function normalizeTaskStatus(status: string): string {
  return status === "IN_PROGRESS" || status === "CANCELLED" ? "TODO" : status;
}

describe("Quote pricing migration (v1 → v2)", () => {
  it("renames repas to dinner", () => {
    const result = migrateQuotePricing({ pricingKey: "repas", pricePerPerson: 50 });
    expect(result.pricingKey).toBe("dinner");
  });

  it("renames boisson to drinks", () => {
    const result = migrateQuotePricing({ pricingKey: "boisson", pricePerPerson: 20 });
    expect(result.pricingKey).toBe("drinks");
  });

  it("renames lendemain to next-day", () => {
    const result = migrateQuotePricing({ pricingKey: "lendemain", pricePerPerson: 30 });
    expect(result.pricingKey).toBe("next-day");
  });

  it("renames forfaitPersonnel to staffFee", () => {
    const result = migrateQuotePricing({ pricingKey: "dinner", forfaitPersonnel: 200 });
    expect(result.staffFee).toBe(200);
    expect(result.forfaitPersonnel).toBeUndefined();
  });

  it("renames forfaitDeplacement to travelFee", () => {
    const result = migrateQuotePricing({ pricingKey: "dinner", forfaitDeplacement: 150 });
    expect(result.travelFee).toBe(150);
    expect(result.forfaitDeplacement).toBeUndefined();
  });

  it("does not touch already-migrated data", () => {
    const input = { pricingKey: "dinner", staffFee: 200, travelFee: 150 };
    const result = migrateQuotePricing(input);
    expect(result).toBe(input); // Same reference = no migration needed
  });

  it("handles combined key + field renames", () => {
    const result = migrateQuotePricing({
      pricingKey: "repas",
      forfaitPersonnel: 200,
      forfaitDeplacement: 100,
    });
    expect(result.pricingKey).toBe("dinner");
    expect(result.staffFee).toBe(200);
    expect(result.travelFee).toBe(100);
  });
});

describe("Idea category migration (v1 → v2)", () => {
  it("renames DECO_TABLE to TABLE_DECOR", () => {
    expect(migrateIdea({ category: "DECO_TABLE" }).category).toBe("TABLE_DECOR");
  });

  it("renames TENUE to ATTIRE", () => {
    expect(migrateIdea({ category: "TENUE" }).category).toBe("ATTIRE");
  });

  it("renames GATEAU to CAKE", () => {
    expect(migrateIdea({ category: "GATEAU" }).category).toBe("CAKE");
  });

  it("leaves unknown categories unchanged", () => {
    const input = { category: "PHOTO_STYLE" };
    expect(migrateIdea(input)).toBe(input);
  });

  it("leaves ideas without category unchanged", () => {
    const input = { title: "Test" };
    expect(migrateIdea(input)).toBe(input);
  });
});

describe("Invitation type migration (v2 → v3)", () => {
  it("migrates DINNER to FULL", () => {
    expect(migrateInvitationType("DINNER")).toBe("FULL");
  });

  it("migrates NEXT_DAY to BOTH_DAYS", () => {
    expect(migrateInvitationType("NEXT_DAY")).toBe("BOTH_DAYS");
  });

  it("leaves COCKTAIL unchanged", () => {
    expect(migrateInvitationType("COCKTAIL")).toBe("COCKTAIL");
  });

  it("leaves CEREMONY unchanged", () => {
    expect(migrateInvitationType("CEREMONY")).toBe("CEREMONY");
  });
});

describe("Task status normalization", () => {
  it("normalizes IN_PROGRESS to TODO", () => {
    expect(normalizeTaskStatus("IN_PROGRESS")).toBe("TODO");
  });

  it("normalizes CANCELLED to TODO", () => {
    expect(normalizeTaskStatus("CANCELLED")).toBe("TODO");
  });

  it("leaves TODO unchanged", () => {
    expect(normalizeTaskStatus("TODO")).toBe("TODO");
  });

  it("leaves DONE unchanged", () => {
    expect(normalizeTaskStatus("DONE")).toBe("DONE");
  });
});
