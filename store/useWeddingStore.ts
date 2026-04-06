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
  updateWedding: (updates) => {
    const now = new Date().toISOString();
    set((state) => {
      const base = state.wedding ?? {
        id: 1,
        partner1Name: null,
        partner2Name: null,
        weddingDate: null,
        venueName: null,
        budgetTarget: null,
        currency: "EUR",
        createdAt: now,
        updatedAt: now,
      };
      return { wedding: { ...base, ...updates, updatedAt: now } };
    });
    // Write-through to SQLite (after state is committed)
    const db = getDatabase();
    if (db) persistWedding(db, { ...updates, updatedAt: now });
    // Notify Starfish sync (reads committed state)
    notifySync();
  },
}));
