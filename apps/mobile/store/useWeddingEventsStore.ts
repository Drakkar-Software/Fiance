import { create } from "zustand";
import type { WeddingEvent } from "@/db/schema";
import {
  addWeddingEvent as sdkAdd,
  updateWeddingEvent as sdkUpdate,
  removeWeddingEvent as sdkRemove,
  getPrimaryEvent as sdkGetPrimary,
  detachEventFromMealSelections,
} from "@fiance/sdk";
import { getStorage } from "@/lib/kv-storage";
import { persistWeddingEvents, persistMealSelections } from "@/lib/persistence";
import { notifySync } from "@/lib/starfish";
import { useMealSelectionsStore } from "@/store/useMealSelectionsStore";

interface WeddingEventsState {
  weddingEvents: WeddingEvent[];
  setWeddingEvents: (events: WeddingEvent[]) => void;
  addWeddingEvent: (event: WeddingEvent) => void;
  updateWeddingEvent: (id: string, updates: Partial<WeddingEvent>) => void;
  removeWeddingEvent: (id: string) => void;
  getPrimaryEvent: () => WeddingEvent | null;
}

export const useWeddingEventsStore = create<WeddingEventsState>((set, get) => ({
  weddingEvents: [],
  setWeddingEvents: (weddingEvents) => set({ weddingEvents }),
  addWeddingEvent: (event) => {
    set((s) => ({ weddingEvents: sdkAdd(s.weddingEvents, event) }));
    const storage = getStorage();
    if (storage) persistWeddingEvents(storage);
    notifySync();
  },
  updateWeddingEvent: (id, updates) => {
    set((s) => ({ weddingEvents: sdkUpdate(s.weddingEvents, id, updates) }));
    const storage = getStorage();
    if (storage) persistWeddingEvents(storage);
    notifySync();
  },
  removeWeddingEvent: (id) => {
    set((s) => ({ weddingEvents: sdkRemove(s.weddingEvents, id) }));
    // Cascade: null the eventId FK on meal selections instead of dropping them
    const mealStore = useMealSelectionsStore.getState();
    mealStore.setMealSelections(detachEventFromMealSelections(mealStore.mealSelections, id));
    const storage = getStorage();
    if (storage) {
      persistWeddingEvents(storage);
      persistMealSelections(storage);
    }
    notifySync();
  },
  getPrimaryEvent: () => sdkGetPrimary(get().weddingEvents),
}));
