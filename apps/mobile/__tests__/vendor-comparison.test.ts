import { describe, it, expect, vi } from "vitest";
import { comparisonGroupIdForType, getComparableVendors, selectVendorInGroup } from "@/lib/vendor-comparison";
import type { Vendor } from "@/db/schema";

function makeVendor(overrides: Partial<Vendor> = {}): Vendor {
  return {
    id: "v1",
    type: "CATERER",
    name: "Traiteur",
    contactName: null,
    phone: null,
    email: null,
    website: null,
    status: "PROSPECT",
    quoteDate: null,
    eventDate: null,
    basePrice: null,
    pricePerPerson: null,
    pppSource: null,
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

describe("comparisonGroupIdForType", () => {
  it("is deterministic and lowercased", () => {
    expect(comparisonGroupIdForType("CATERER")).toBe("cmp-caterer");
    expect(comparisonGroupIdForType("CATERER")).toBe(comparisonGroupIdForType("CATERER"));
  });
});

describe("getComparableVendors", () => {
  it("returns only vendors of the given type", () => {
    const vendors = [
      makeVendor({ id: "v1", type: "CATERER" }),
      makeVendor({ id: "v2", type: "PHOTOGRAPHER" }),
      makeVendor({ id: "v3", type: "CATERER" }),
    ];
    expect(getComparableVendors(vendors, "CATERER").map((v) => v.id)).toEqual(["v1", "v3"]);
  });
});

describe("selectVendorInGroup", () => {
  it("marks the chosen vendor selected and every sibling unselected", () => {
    const vendors = [
      makeVendor({ id: "v1", type: "CATERER" }),
      makeVendor({ id: "v2", type: "CATERER" }),
      makeVendor({ id: "v3", type: "CATERER" }),
    ];
    const updateVendor = vi.fn();
    selectVendorInGroup(vendors, updateVendor, "v2");

    expect(updateVendor).toHaveBeenCalledTimes(3);
    expect(updateVendor).toHaveBeenCalledWith("v1", { comparisonGroupId: "cmp-caterer", isSelected: false });
    expect(updateVendor).toHaveBeenCalledWith("v2", { comparisonGroupId: "cmp-caterer", isSelected: true });
    expect(updateVendor).toHaveBeenCalledWith("v3", { comparisonGroupId: "cmp-caterer", isSelected: false });
  });

  it("does not touch vendors of a different type", () => {
    const vendors = [
      makeVendor({ id: "v1", type: "CATERER" }),
      makeVendor({ id: "v2", type: "PHOTOGRAPHER" }),
    ];
    const updateVendor = vi.fn();
    selectVendorInGroup(vendors, updateVendor, "v1");
    expect(updateVendor).toHaveBeenCalledTimes(1);
    expect(updateVendor).toHaveBeenCalledWith("v1", { comparisonGroupId: "cmp-caterer", isSelected: true });
  });

  it("does nothing when the vendor id is unknown", () => {
    const updateVendor = vi.fn();
    selectVendorInGroup([makeVendor({ id: "v1" })], updateVendor, "missing");
    expect(updateVendor).not.toHaveBeenCalled();
  });
});
