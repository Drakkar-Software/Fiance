/**
 * Tests for lib/vendorTypeConfig.ts — vendor form configuration per type.
 */
import { describe, it, expect } from "vitest";

import { getVendorTypeConfig } from './vendor-config.js';

describe("getVendorTypeConfig", () => {
  it("returns caterer config with per-person pricing visible", () => {
    const config = getVendorTypeConfig("CATERER");
    expect(config.showPricePerPerson).toBe("visible");
  });

  it("returns caterer config with custom sections", () => {
    const config = getVendorTypeConfig("CATERER");
    const keys = config.customSections.map((s) => s.key);
    expect(keys).toContain("services");
    expect(keys).toContain("menuNotes");
  });

  it("returns venue config with capacity section", () => {
    const config = getVendorTypeConfig("VENUE");
    const keys = config.customSections.map((s) => s.key);
    expect(keys).toContain("capacity");
  });

  it("returns photographer config with style and hours", () => {
    const config = getVendorTypeConfig("PHOTOGRAPHER");
    const keys = config.customSections.map((s) => s.key);
    expect(keys).toContain("style");
    expect(keys).toContain("hours");
  });

  it("returns default config for OTHER type", () => {
    const config = getVendorTypeConfig("OTHER");
    expect(config.showPricePerPerson).toBe("hidden");
    expect(config.customSections).toEqual([]);
  });

  it("returns default config for unknown types", () => {
    const config = getVendorTypeConfig("SECURITY");
    expect(config.showPricePerPerson).toBe("hidden");
    expect(config.showDateFields).toBe("visible");
  });

  it("hotel config has per-person pricing for nightly rate", () => {
    const config = getVendorTypeConfig("HOTEL");
    expect(config.showPricePerPerson).toBe("visible");
  });

  it("DJ config has custom base price label", () => {
    const config = getVendorTypeConfig("DJ");
    expect(config.basePriceLabel).toContain("Forfait");
  });

  it("cake config has servings and tasting date sections", () => {
    const config = getVendorTypeConfig("CAKE");
    const keys = config.customSections.map((s) => s.key);
    expect(keys).toContain("servings");
    expect(keys).toContain("tastingDate");
  });

  it("clothing config has fitting date", () => {
    const config = getVendorTypeConfig("CLOTHING");
    const keys = config.customSections.map((s) => s.key);
    expect(keys).toContain("fittingDate");
    expect(keys).toContain("clothingType");
  });
});
