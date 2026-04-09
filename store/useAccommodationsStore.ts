import { create } from "zustand";
import type { Accommodation } from "@/db/schema";
import { getStorage } from "@/lib/kv-storage";
import { persistAccommodations, persistGuests } from "@/lib/persistence";
import { notifySync } from "@/lib/starfish";
import { useGuestsStore } from "@/store/useGuestsStore";

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
    const storage = getStorage();
    if (storage) persistAccommodations(storage);
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
    const storage = getStorage();
    if (storage) persistAccommodations(storage);
    notifySync();
  },
  removeAccommodation: (id) => {
    set((state) => ({
      accommodations: state.accommodations.filter((a) => a.id !== id),
    }));
    // Nullify accommodation reference on guests (cascade)
    useGuestsStore.getState().setGuests(
      useGuestsStore.getState().guests.map((g) =>
        g.accommodationId === id
          ? { ...g, accommodationId: null, roomNumber: null }
          : g
      )
    );
    const storage = getStorage();
    if (storage) {
      persistAccommodations(storage);
      persistGuests(storage);
    }
    notifySync();
  },
}));
