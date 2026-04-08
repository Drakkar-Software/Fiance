import { create } from "zustand";
import type { Gift } from "@/db/schema";
import { getDatabase } from "@/db/provider";
import {
  persistGift,
  updateGiftDb,
  deleteGiftDb,
} from "@/lib/persistence";
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
    const db = getDatabase();
    if (db) persistGift(db, gift);
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
    const db = getDatabase();
    if (db) updateGiftDb(db, id, { ...updates, updatedAt: new Date().toISOString() });
    notifySync();
  },
  removeGift: (id) => {
    set((state) => ({ gifts: state.gifts.filter((g) => g.id !== id) }));
    const db = getDatabase();
    if (db) deleteGiftDb(db, id);
    notifySync();
  },
  markClaimed: (id, claimedByName) => {
    const now = new Date().toISOString();
    const updates = { claimed: true, claimedByName, claimedAt: now, updatedAt: now };
    set((state) => ({
      gifts: state.gifts.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }));
    const db = getDatabase();
    if (db) updateGiftDb(db, id, updates);
    notifySync();
  },
  getUnclaimed: () => get().gifts.filter((g) => !g.claimed),
  getClaimed: () => get().gifts.filter((g) => g.claimed),
}));
