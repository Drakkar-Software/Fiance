import { create } from "zustand";
import type { CeremonyItem } from "@/db/schema";
import { getStorage } from "@/lib/kv-storage";
import { persistCeremonyItems } from "@/lib/persistence";
import { notifySync } from "@/lib/starfish";

interface CeremonyState {
  ceremonyItems: CeremonyItem[];
  setCeremonyItems: (items: CeremonyItem[]) => void;
  addCeremonyItem: (item: CeremonyItem) => void;
  updateCeremonyItem: (id: string, updates: Partial<CeremonyItem>) => void;
  removeCeremonyItem: (id: string) => void;
}

export const useCeremonyStore = create<CeremonyState>((set) => ({
  ceremonyItems: [],
  setCeremonyItems: (ceremonyItems) => set({ ceremonyItems }),
  addCeremonyItem: (item) => {
    set((state) => ({ ceremonyItems: [...state.ceremonyItems, item] }));
    const storage = getStorage();
    if (storage) persistCeremonyItems(storage);
    notifySync();
  },
  updateCeremonyItem: (id, updates) => {
    set((state) => ({
      ceremonyItems: state.ceremonyItems.map((i) =>
        i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i
      ),
    }));
    const storage = getStorage();
    if (storage) persistCeremonyItems(storage);
    notifySync();
  },
  removeCeremonyItem: (id) => {
    set((state) => ({
      ceremonyItems: state.ceremonyItems.filter((i) => i.id !== id),
    }));
    const storage = getStorage();
    if (storage) persistCeremonyItems(storage);
    notifySync();
  },
}));
