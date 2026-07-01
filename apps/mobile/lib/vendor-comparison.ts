import type { Vendor } from "@/db/schema";

/** Deterministic comparison-group id for all vendors of a given type. */
export function comparisonGroupIdForType(type: string): string {
  return `cmp-${type.toLowerCase()}`;
}

/** Vendors sharing a type are comparable once there are 2 or more of them. */
export function getComparableVendors(vendors: Vendor[], type: string): Vendor[] {
  return vendors.filter((v) => v.type === type);
}

/**
 * Marks `vendorId` as the selected/retained vendor within its type's comparison
 * group, and every other same-type vendor as not selected. Only committed
 * (isSelected !== false) vendors count toward budget roll-up.
 */
export function selectVendorInGroup(
  vendors: Vendor[],
  updateVendor: (id: string, updates: Partial<Vendor>) => void,
  vendorId: string,
): void {
  const target = vendors.find((v) => v.id === vendorId);
  if (!target) return;
  const groupId = comparisonGroupIdForType(target.type);
  for (const v of getComparableVendors(vendors, target.type)) {
    updateVendor(v.id, { comparisonGroupId: groupId, isSelected: v.id === vendorId });
  }
}
