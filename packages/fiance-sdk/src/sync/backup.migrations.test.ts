/**
 * Sync migration tests — v1→v2 pricing key and field renames, idea category
 * renames, invitation type migrations, task status normalization.
 * Every case runs through the real restoreFromBackup() in backup.ts, so a
 * regression in the production migration chain fails these tests.
 */
import { describe, it, expect } from "vitest";
import { BACKUP_VERSION, restoreFromBackup, type BackupData } from "./backup.js";

function backupWith(collections: Record<string, unknown[]> = {}, extra: Record<string, unknown> = {}): BackupData {
  return {
    version: BACKUP_VERSION,
    timestamp: "2026-10-13T00:00:00.000Z",
    wedding: null,
    ...collections,
    ...extra,
  } as unknown as BackupData;
}

function restoreQuotePricing(pricing: Record<string, unknown>) {
  return restoreFromBackup(backupWith({ quotePricings: [pricing] })).quotePricings[0] as unknown as Record<string, unknown>;
}

function restoreIdea(idea: Record<string, unknown>) {
  return restoreFromBackup(backupWith({ ideas: [idea] })).ideas[0] as unknown as Record<string, unknown>;
}

function restoreGuestInvitationType(invitationType: string) {
  return restoreFromBackup(backupWith({ guests: [{ id: "g1", invitationType }] })).guests[0] as unknown as Record<string, unknown>;
}

function restoreTaskStatus(status: string) {
  return restoreFromBackup(backupWith({ tasks: [{ id: "t1", status }] })).tasks[0] as unknown as Record<string, unknown>;
}

describe("Quote pricing migration (v1 → v2)", () => {
  it("renames repas to dinner", () => {
    const result = restoreQuotePricing({ pricingKey: "repas", pricePerPerson: 50 });
    expect(result.pricingKey).toBe("dinner");
  });

  it("renames boisson to drinks", () => {
    const result = restoreQuotePricing({ pricingKey: "boisson", pricePerPerson: 20 });
    expect(result.pricingKey).toBe("drinks");
  });

  it("renames lendemain to next-day", () => {
    const result = restoreQuotePricing({ pricingKey: "lendemain", pricePerPerson: 30 });
    expect(result.pricingKey).toBe("next-day");
  });

  it("renames forfaitPersonnel to staffFee", () => {
    const result = restoreQuotePricing({ pricingKey: "dinner", forfaitPersonnel: 200 });
    expect(result.staffFee).toBe(200);
    expect(result.forfaitPersonnel).toBeUndefined();
  });

  it("renames forfaitDeplacement to travelFee", () => {
    const result = restoreQuotePricing({ pricingKey: "dinner", forfaitDeplacement: 150 });
    expect(result.travelFee).toBe(150);
    expect(result.forfaitDeplacement).toBeUndefined();
  });

  it("does not touch already-migrated data", () => {
    const input = { pricingKey: "dinner", staffFee: 200, travelFee: 150 };
    const result = restoreQuotePricing(input);
    expect(result).toBe(input);
  });

  it("handles combined key + field renames", () => {
    const result = restoreQuotePricing({
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
    expect(restoreIdea({ category: "DECO_TABLE" }).category).toBe("TABLE_DECOR");
  });

  it("renames TENUE to ATTIRE", () => {
    expect(restoreIdea({ category: "TENUE" }).category).toBe("ATTIRE");
  });

  it("renames GATEAU to CAKE", () => {
    expect(restoreIdea({ category: "GATEAU" }).category).toBe("CAKE");
  });

  it("leaves unknown categories unchanged", () => {
    const input = { category: "PHOTO_STYLE" };
    expect(restoreIdea(input)).toBe(input);
  });

  it("leaves ideas without category unchanged", () => {
    const input = { title: "Test" };
    expect(restoreIdea(input)).toBe(input);
  });
});

describe("Invitation type migration (v2 → v3)", () => {
  it("migrates DINNER to FULL", () => {
    expect(restoreGuestInvitationType("DINNER").invitationType).toBe("FULL");
  });

  it("migrates NEXT_DAY to BOTH_DAYS", () => {
    expect(restoreGuestInvitationType("NEXT_DAY").invitationType).toBe("BOTH_DAYS");
  });

  it("leaves COCKTAIL unchanged", () => {
    expect(restoreGuestInvitationType("COCKTAIL").invitationType).toBe("COCKTAIL");
  });

  it("leaves CEREMONY unchanged", () => {
    expect(restoreGuestInvitationType("CEREMONY").invitationType).toBe("CEREMONY");
  });
});

describe("Task status normalization", () => {
  it("normalizes IN_PROGRESS to TODO", () => {
    expect(restoreTaskStatus("IN_PROGRESS").status).toBe("TODO");
  });

  it("normalizes CANCELLED to TODO", () => {
    expect(restoreTaskStatus("CANCELLED").status).toBe("TODO");
  });

  it("leaves TODO unchanged", () => {
    expect(restoreTaskStatus("TODO").status).toBe("TODO");
  });

  it("leaves DONE unchanged", () => {
    expect(restoreTaskStatus("DONE").status).toBe("DONE");
  });
});
