import { create } from "zustand";
import type { HoneymoonPlan } from "@/db/schema";
import {
  setHoneymoonPlan as sdkSet,
  updateHoneymoonPlan as sdkUpdate,
  removeHoneymoonPlan as sdkRemove,
  getHoneymoonPlan as sdkGet,
} from "@fiance/sdk";
import { getStorage } from "@/lib/kv-storage";
import { persistHoneymoonPlans } from "@/lib/persistence";
import { notifySync } from "@/lib/starfish";

interface HoneymoonState {
  honeymoonPlans: HoneymoonPlan[];
  setHoneymoonPlans: (plans: HoneymoonPlan[]) => void;
  setHoneymoonPlan: (plan: HoneymoonPlan) => void;
  updateHoneymoonPlan: (updates: Partial<HoneymoonPlan>) => void;
  removeHoneymoonPlan: () => void;
  getPlan: () => HoneymoonPlan | null;
}

export const useHoneymoonStore = create<HoneymoonState>((set, get) => ({
  honeymoonPlans: [],
  setHoneymoonPlans: (honeymoonPlans) => set({ honeymoonPlans }),
  setHoneymoonPlan: (plan) => {
    set((s) => ({ honeymoonPlans: sdkSet(s.honeymoonPlans, plan) }));
    const storage = getStorage();
    if (storage) persistHoneymoonPlans(storage);
    notifySync();
  },
  updateHoneymoonPlan: (updates) => {
    set((s) => ({ honeymoonPlans: sdkUpdate(s.honeymoonPlans, updates) }));
    const storage = getStorage();
    if (storage) persistHoneymoonPlans(storage);
    notifySync();
  },
  removeHoneymoonPlan: () => {
    set((s) => ({ honeymoonPlans: sdkRemove(s.honeymoonPlans) }));
    const storage = getStorage();
    if (storage) persistHoneymoonPlans(storage);
    notifySync();
  },
  getPlan: () => sdkGet(get().honeymoonPlans),
}));
