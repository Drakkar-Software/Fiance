import { create } from "zustand";
import type { Wedding } from "@/db/schema";
import { getDatabase } from "@/db/provider";
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
  updateWedding: (updates) =>
    set((state) => {
      if (!state.wedding) return state;
      const updated = {
        ...state.wedding,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      // Write-through to SQLite
      const db = getDatabase();
      if (db) persistWedding(db, { ...updates, updatedAt: updated.updatedAt });
      // Notify Starfish sync
      notifySync();
      return { wedding: updated };
    }),
}));
