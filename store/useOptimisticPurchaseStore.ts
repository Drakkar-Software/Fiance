import { create } from "zustand";
import { getStorage, writeCollection, readCollection } from "@/lib/kv-storage";

const OPTIMISTIC_GRACE_MS = 24 * 60 * 60 * 1000; // 24h
const KV_KEY = "optimisticPurchase";

export interface OptimisticPurchaseRecord {
  purchasedAt: number;
  transactionId: string;
  platform: "ios" | "android" | "stripe";
}

interface OptimisticPurchaseState {
  record: OptimisticPurchaseRecord | null;
  setRecord: (record: OptimisticPurchaseRecord) => void;
  clearRecord: () => void;
  isWithinGrace: () => boolean;
}

export const useOptimisticPurchaseStore = create<OptimisticPurchaseState>((set, get) => ({
  record: null,
  setRecord: (record) => {
    set({ record });
    const storage = getStorage();
    if (storage) writeCollection(KV_KEY, record);
  },
  clearRecord: () => {
    set({ record: null });
    const storage = getStorage();
    if (storage) writeCollection(KV_KEY, null);
  },
  isWithinGrace: () => {
    const { record } = get();
    if (!record) return false;
    return Date.now() - record.purchasedAt < OPTIMISTIC_GRACE_MS;
  },
}));

export function hydrateOptimisticPurchase(): void {
  const record = readCollection<OptimisticPurchaseRecord>(KV_KEY);
  if (record) useOptimisticPurchaseStore.getState().setRecord(record);
}
