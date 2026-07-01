import { create } from "zustand";
import type { GuestMealSelection } from "@/db/schema";
import {
  addMealSelection as sdkAdd,
  updateMealSelection as sdkUpdate,
  removeMealSelection as sdkRemove,
  removeMealSelectionsForGuest as sdkRemoveForGuest,
  detachEventFromMealSelections as sdkDetachEvent,
} from "@fiance/sdk";
import { getStorage } from "@/lib/kv-storage";
import { persistMealSelections } from "@/lib/persistence";
import { notifySync } from "@/lib/starfish";

interface MealSelectionsState {
  mealSelections: GuestMealSelection[];
  setMealSelections: (selections: GuestMealSelection[]) => void;
  addMealSelection: (selection: GuestMealSelection) => void;
  updateMealSelection: (id: string, updates: Partial<GuestMealSelection>) => void;
  removeMealSelection: (id: string) => void;
  removeMealSelectionsForGuest: (guestId: string) => void;
  detachEventFromMealSelections: (eventId: string) => void;
}

export const useMealSelectionsStore = create<MealSelectionsState>((set) => ({
  mealSelections: [],
  setMealSelections: (mealSelections) => set({ mealSelections }),
  addMealSelection: (selection) => {
    set((s) => ({ mealSelections: sdkAdd(s.mealSelections, selection) }));
    const storage = getStorage();
    if (storage) persistMealSelections(storage);
    notifySync();
  },
  updateMealSelection: (id, updates) => {
    set((s) => ({ mealSelections: sdkUpdate(s.mealSelections, id, updates) }));
    const storage = getStorage();
    if (storage) persistMealSelections(storage);
    notifySync();
  },
  removeMealSelection: (id) => {
    set((s) => ({ mealSelections: sdkRemove(s.mealSelections, id) }));
    const storage = getStorage();
    if (storage) persistMealSelections(storage);
    notifySync();
  },
  removeMealSelectionsForGuest: (guestId) => {
    set((s) => ({ mealSelections: sdkRemoveForGuest(s.mealSelections, guestId) }));
    const storage = getStorage();
    if (storage) persistMealSelections(storage);
    notifySync();
  },
  detachEventFromMealSelections: (eventId) => {
    set((s) => ({ mealSelections: sdkDetachEvent(s.mealSelections, eventId) }));
    const storage = getStorage();
    if (storage) persistMealSelections(storage);
    notifySync();
  },
}));
