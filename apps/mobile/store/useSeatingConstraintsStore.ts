import { create } from "zustand";
import type { Guest, SeatingConstraint } from "@/db/schema";
import {
  addSeatingConstraint as sdkAdd,
  updateSeatingConstraint as sdkUpdate,
  removeSeatingConstraint as sdkRemove,
  detachGuestFromConstraints as sdkDetachGuest,
  validateSeatingPlan as sdkValidate,
  type SeatingViolation,
} from "@fiance/sdk";
import { getStorage } from "@/lib/kv-storage";
import { persistSeatingConstraints } from "@/lib/persistence";
import { notifySync } from "@/lib/starfish";

interface SeatingConstraintsState {
  seatingConstraints: SeatingConstraint[];
  setSeatingConstraints: (constraints: SeatingConstraint[]) => void;
  addSeatingConstraint: (constraint: SeatingConstraint) => void;
  updateSeatingConstraint: (id: string, updates: Partial<SeatingConstraint>) => void;
  removeSeatingConstraint: (id: string) => void;
  detachGuestFromConstraints: (guestId: string) => void;
  getViolations: (guests: Guest[]) => SeatingViolation[];
}

export const useSeatingConstraintsStore = create<SeatingConstraintsState>((set, get) => ({
  seatingConstraints: [],
  setSeatingConstraints: (seatingConstraints) => set({ seatingConstraints }),
  addSeatingConstraint: (constraint) => {
    set((s) => ({ seatingConstraints: sdkAdd(s.seatingConstraints, constraint) }));
    const storage = getStorage();
    if (storage) persistSeatingConstraints(storage);
    notifySync();
  },
  updateSeatingConstraint: (id, updates) => {
    set((s) => ({ seatingConstraints: sdkUpdate(s.seatingConstraints, id, updates) }));
    const storage = getStorage();
    if (storage) persistSeatingConstraints(storage);
    notifySync();
  },
  removeSeatingConstraint: (id) => {
    set((s) => ({ seatingConstraints: sdkRemove(s.seatingConstraints, id) }));
    const storage = getStorage();
    if (storage) persistSeatingConstraints(storage);
    notifySync();
  },
  detachGuestFromConstraints: (guestId) => {
    set((s) => ({ seatingConstraints: sdkDetachGuest(s.seatingConstraints, guestId) }));
    const storage = getStorage();
    if (storage) persistSeatingConstraints(storage);
    notifySync();
  },
  getViolations: (guests) => sdkValidate(guests, [], get().seatingConstraints).violations,
}));
