import { create } from "zustand";
import type { Accommodation } from "@/db/schema";
import { getDatabase } from "@/db/provider";
import {
  persistAccommodation,
  updateAccommodationDb,
  deleteAccommodationDb,
} from "@/lib/persistence";
import { notifySync } from "@/lib/starfish";

interface AccommodationsState {
  accommodations: Accommodation[];
  setAccommodations: (accommodations: Accommodation[]) => void;
  addAccommodation: (accommodation: Accommodation) => void;
  updateAccommodation: (id: string, updates: Partial<Accommodation>) => void;
  removeAccommodation: (id: string) => void;
}

export const useAccommodationsStore = create<AccommodationsState>((set) => ({
  accommodations: [],
  setAccommodations: (accommodations) => set({ accommodations }),
  addAccommodation: (accommodation) => {
    set((state) => ({
      accommodations: [...state.accommodations, accommodation],
    }));
    const db = getDatabase();
    if (db) persistAccommodation(db, accommodation);
    notifySync();
  },
  updateAccommodation: (id, updates) => {
    set((state) => ({
      accommodations: state.accommodations.map((a) =>
        a.id === id
          ? { ...a, ...updates, updatedAt: new Date().toISOString() }
          : a
      ),
    }));
    const db = getDatabase();
    if (db)
      updateAccommodationDb(db, id, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    notifySync();
  },
  removeAccommodation: (id) => {
    set((state) => ({
      accommodations: state.accommodations.filter((a) => a.id !== id),
    }));
    const db = getDatabase();
    if (db) deleteAccommodationDb(db, id);
    notifySync();
  },
}));
