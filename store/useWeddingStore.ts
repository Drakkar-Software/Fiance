import { create } from "zustand";
import type { Wedding } from "@/db/schema";
import { getStorage } from "@/lib/kv-storage";
import { persistWedding } from "@/lib/persistence";
import { notifySync } from "@/lib/starfish";

interface WeddingState {
  wedding: Wedding | null;
  setWedding: (wedding: Wedding) => void;
  updateWedding: (updates: Partial<Wedding>) => void;
}

export const useWeddingStore = create<WeddingState>((set) => ({
  wedding: null,
  setWedding: (wedding) => set({ wedding }),
  updateWedding: (updates) => {
    const now = new Date().toISOString();
    set((state) => {
      const base = state.wedding ?? {
        id: 1,
        partner1Name: null,
        partner2Name: null,
        weddingDate: null,
        venueName: null,
        description: null,
        faq: null,
        eventPhotos: null,
        budgetTarget: null,
        categoryBudgets: null,
        currency: "EUR",
        createdAt: now,
        updatedAt: now,
      };
      return { wedding: { ...base, ...updates, updatedAt: now } };
    });
    const storage = getStorage();
    if (storage) persistWedding(storage);
    notifySync();
  },
}));
