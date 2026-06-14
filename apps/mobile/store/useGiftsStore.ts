import { create } from "zustand";
import type { Gift } from "@/db/schema";
import { getStorage } from "@/lib/kv-storage";
import { persistGifts } from "@/lib/persistence";
import { notifySync } from "@/lib/starfish";

interface GiftsState {
  gifts: Gift[];
  setGifts: (gifts: Gift[]) => void;
  addGift: (gift: Gift) => void;
  updateGift: (id: string, updates: Partial<Gift>) => void;
  removeGift: (id: string) => void;
  markClaimed: (id: string, claimedByName: string) => void;
  getUnclaimed: () => Gift[];
  getClaimed: () => Gift[];
}

export const useGiftsStore = create<GiftsState>((set, get) => ({
  gifts: [],
  setGifts: (gifts) => set({ gifts }),
  addGift: (gift) => {
    set((state) => ({ gifts: [...state.gifts, gift] }));
    const storage = getStorage();
    if (storage) persistGifts(storage);
    notifySync();
  },
  updateGift: (id, updates) => {
    set((state) => ({
      gifts: state.gifts.map((g) =>
        g.id === id
          ? { ...g, ...updates, updatedAt: new Date().toISOString() }
          : g
      ),
    }));
    const storage = getStorage();
    if (storage) persistGifts(storage);
    notifySync();
  },
  removeGift: (id) => {
    set((state) => ({ gifts: state.gifts.filter((g) => g.id !== id) }));
    const storage = getStorage();
    if (storage) persistGifts(storage);
    notifySync();
  },
  markClaimed: (id, claimedByName) => {
    const now = new Date().toISOString();
    set((state) => ({
      gifts: state.gifts.map((g) =>
        g.id === id
          ? { ...g, claimed: true, claimedByName, claimedAt: now, updatedAt: now }
          : g
      ),
    }));
    const storage = getStorage();
    if (storage) persistGifts(storage);
    notifySync();
  },
  getUnclaimed: () => get().gifts.filter((g) => !g.claimed),
  getClaimed: () => get().gifts.filter((g) => g.claimed),
}));
