import { create } from "zustand";
import type { Wedding } from "@/db/schema";

interface WeddingState {
  wedding: Wedding | null;
  setWedding: (wedding: Wedding) => void;
  updateWedding: (updates: Partial<Wedding>) => void;
}

export const useWeddingStore = create<WeddingState>((set) => ({
  wedding: null,
  setWedding: (wedding) => set({ wedding }),
  updateWedding: (updates) =>
    set((state) => ({
      wedding: state.wedding
        ? { ...state.wedding, ...updates, updatedAt: new Date().toISOString() }
        : null,
    })),
}));
