import { create } from "zustand";
import type { LegalMilestone } from "@/db/schema";
import {
  addLegalMilestone as sdkAdd,
  updateLegalMilestone as sdkUpdate,
  removeLegalMilestone as sdkRemove,
  completeLegalMilestone as sdkComplete,
} from "@fiance/sdk";
import { getStorage } from "@/lib/kv-storage";
import { persistLegalMilestones } from "@/lib/persistence";
import { notifySync } from "@/lib/starfish";

interface LegalState {
  legalMilestones: LegalMilestone[];
  setLegalMilestones: (milestones: LegalMilestone[]) => void;
  addLegalMilestone: (milestone: LegalMilestone) => void;
  updateLegalMilestone: (id: string, updates: Partial<LegalMilestone>) => void;
  removeLegalMilestone: (id: string) => void;
  completeLegalMilestone: (id: string, completedDate: string) => void;
}

export const useLegalStore = create<LegalState>((set) => ({
  legalMilestones: [],
  setLegalMilestones: (legalMilestones) => set({ legalMilestones }),
  addLegalMilestone: (milestone) => {
    set((s) => ({ legalMilestones: sdkAdd(s.legalMilestones, milestone) }));
    const storage = getStorage();
    if (storage) persistLegalMilestones(storage);
    notifySync();
  },
  updateLegalMilestone: (id, updates) => {
    set((s) => ({ legalMilestones: sdkUpdate(s.legalMilestones, id, updates) }));
    const storage = getStorage();
    if (storage) persistLegalMilestones(storage);
    notifySync();
  },
  removeLegalMilestone: (id) => {
    set((s) => ({ legalMilestones: sdkRemove(s.legalMilestones, id) }));
    const storage = getStorage();
    if (storage) persistLegalMilestones(storage);
    notifySync();
  },
  completeLegalMilestone: (id, completedDate) => {
    set((s) => ({ legalMilestones: sdkComplete(s.legalMilestones, id, completedDate) }));
    const storage = getStorage();
    if (storage) persistLegalMilestones(storage);
    notifySync();
  },
}));
