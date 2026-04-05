import { create } from "zustand";
import type { Vendor, QuotePricing } from "@/db/schema";
import type { VendorType, VendorStatus } from "@/db/types";

interface VendorsState {
  vendors: Vendor[];
  quotePricings: QuotePricing[];
  setVendors: (vendors: Vendor[]) => void;
  setQuotePricings: (pricings: QuotePricing[]) => void;
  addVendor: (vendor: Vendor) => void;
  updateVendor: (id: string, updates: Partial<Vendor>) => void;
  removeVendor: (id: string) => void;
  addQuotePricing: (pricing: QuotePricing) => void;
  updateQuotePricing: (id: string, updates: Partial<QuotePricing>) => void;
  removeQuotePricing: (id: string) => void;
  getVendorsByType: (type: VendorType) => Vendor[];
  getVendorsByStatus: (status: VendorStatus) => Vendor[];
  getBookedVendors: () => Vendor[];
  getQuotePricingsByVendor: (vendorId: string) => QuotePricing[];
}

export const useVendorsStore = create<VendorsState>((set, get) => ({
  vendors: [],
  quotePricings: [],
  setVendors: (vendors) => set({ vendors }),
  setQuotePricings: (pricings) => set({ quotePricings: pricings }),
  addVendor: (vendor) =>
    set((state) => ({ vendors: [...state.vendors, vendor] })),
  updateVendor: (id, updates) =>
    set((state) => ({
      vendors: state.vendors.map((v) =>
        v.id === id
          ? { ...v, ...updates, updatedAt: new Date().toISOString() }
          : v
      ),
    })),
  removeVendor: (id) =>
    set((state) => ({
      vendors: state.vendors.filter((v) => v.id !== id),
      quotePricings: state.quotePricings.filter((p) => p.vendorId !== id),
    })),
  addQuotePricing: (pricing) =>
    set((state) => ({
      quotePricings: [...state.quotePricings, pricing],
    })),
  updateQuotePricing: (id, updates) =>
    set((state) => ({
      quotePricings: state.quotePricings.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),
  removeQuotePricing: (id) =>
    set((state) => ({
      quotePricings: state.quotePricings.filter((p) => p.id !== id),
    })),
  getVendorsByType: (type) => get().vendors.filter((v) => v.type === type),
  getVendorsByStatus: (status) =>
    get().vendors.filter((v) => v.status === status),
  getBookedVendors: () => get().vendors.filter((v) => v.status === "BOOKED"),
  getQuotePricingsByVendor: (vendorId) =>
    get().quotePricings.filter((p) => p.vendorId === vendorId),
}));
