import { create } from "zustand";
import type { Vendor, QuotePricing, VendorPayment } from "@/db/schema";
import type { VendorType, VendorStatus } from "@/db/types";
import { getDatabase } from "@/db/provider";
import {
  persistVendor, updateVendorDb, deleteVendorDb,
  persistQuotePricing, updateQuotePricingDb, deleteQuotePricingDb,
  persistVendorPayment, updateVendorPaymentDb, deleteVendorPaymentDb,
} from "@/lib/persistence";
import { notifySync } from "@/lib/starfish";

interface VendorsState {
  vendors: Vendor[];
  quotePricings: QuotePricing[];
  vendorPayments: VendorPayment[];
  setVendors: (vendors: Vendor[]) => void;
  setQuotePricings: (pricings: QuotePricing[]) => void;
  setVendorPayments: (payments: VendorPayment[]) => void;
  addVendor: (vendor: Vendor) => void;
  updateVendor: (id: string, updates: Partial<Vendor>) => void;
  removeVendor: (id: string) => void;
  addQuotePricing: (pricing: QuotePricing) => void;
  updateQuotePricing: (id: string, updates: Partial<QuotePricing>) => void;
  removeQuotePricing: (id: string) => void;
  addPayment: (payment: VendorPayment) => void;
  updatePayment: (id: string, updates: Partial<VendorPayment>) => void;
  removePayment: (id: string) => void;
  getVendorsByType: (type: VendorType) => Vendor[];
  getVendorsByStatus: (status: VendorStatus) => Vendor[];
  getBookedVendors: () => Vendor[];
  getQuotePricingsByVendor: (vendorId: string) => QuotePricing[];
  getPaymentsByVendor: (vendorId: string) => VendorPayment[];
  getTotalPaidForVendor: (vendorId: string) => number;
}

export const useVendorsStore = create<VendorsState>((set, get) => ({
  vendors: [],
  quotePricings: [],
  vendorPayments: [],
  setVendors: (vendors) => set({ vendors }),
  setQuotePricings: (pricings) => set({ quotePricings: pricings }),
  setVendorPayments: (payments) => set({ vendorPayments: payments }),
  addVendor: (vendor) => {
    set((state) => ({ vendors: [...state.vendors, vendor] }));
    const db = getDatabase();
    if (db) persistVendor(db, vendor);
    notifySync();
  },
  updateVendor: (id, updates) => {
    const updatedFields = { ...updates, updatedAt: new Date().toISOString() };
    set((state) => ({
      vendors: state.vendors.map((v) =>
        v.id === id ? { ...v, ...updatedFields } : v
      ),
    }));
    const db = getDatabase();
    if (db) updateVendorDb(db, id, updatedFields);
    notifySync();
  },
  removeVendor: (id) => {
    set((state) => ({
      vendors: state.vendors.filter((v) => v.id !== id),
      quotePricings: state.quotePricings.filter((p) => p.vendorId !== id),
      vendorPayments: state.vendorPayments.filter((p) => p.vendorId !== id),
    }));
    const db = getDatabase();
    if (db) deleteVendorDb(db, id);
    notifySync();
  },
  addQuotePricing: (pricing) => {
    set((state) => ({ quotePricings: [...state.quotePricings, pricing] }));
    const db = getDatabase();
    if (db) persistQuotePricing(db, pricing);
    notifySync();
  },
  updateQuotePricing: (id, updates) => {
    set((state) => ({
      quotePricings: state.quotePricings.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }));
    const db = getDatabase();
    if (db) updateQuotePricingDb(db, id, updates);
    notifySync();
  },
  removeQuotePricing: (id) => {
    set((state) => ({
      quotePricings: state.quotePricings.filter((p) => p.id !== id),
    }));
    const db = getDatabase();
    if (db) deleteQuotePricingDb(db, id);
    notifySync();
  },
  addPayment: (payment) => {
    set((state) => ({ vendorPayments: [...state.vendorPayments, payment] }));
    const db = getDatabase();
    if (db) persistVendorPayment(db, payment);
    notifySync();
  },
  updatePayment: (id, updates) => {
    const updatedFields = { ...updates, updatedAt: new Date().toISOString() };
    set((state) => ({
      vendorPayments: state.vendorPayments.map((p) =>
        p.id === id ? { ...p, ...updatedFields } : p
      ),
    }));
    const db = getDatabase();
    if (db) updateVendorPaymentDb(db, id, updatedFields);
    notifySync();
  },
  removePayment: (id) => {
    set((state) => ({
      vendorPayments: state.vendorPayments.filter((p) => p.id !== id),
    }));
    const db = getDatabase();
    if (db) deleteVendorPaymentDb(db, id);
    notifySync();
  },
  getVendorsByType: (type) => get().vendors.filter((v) => v.type === type),
  getVendorsByStatus: (status) =>
    get().vendors.filter((v) => v.status === status),
  getBookedVendors: () => get().vendors.filter((v) => v.status === "BOOKED"),
  getQuotePricingsByVendor: (vendorId) =>
    get().quotePricings.filter((p) => p.vendorId === vendorId),
  getPaymentsByVendor: (vendorId) =>
    get().vendorPayments.filter((p) => p.vendorId === vendorId),
  getTotalPaidForVendor: (vendorId) =>
    get()
      .vendorPayments.filter((p) => p.vendorId === vendorId)
      .reduce((sum, p) => sum + p.amount, 0),
}));
