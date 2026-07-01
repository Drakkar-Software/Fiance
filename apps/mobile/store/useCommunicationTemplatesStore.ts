import { create } from "zustand";
import type { CommunicationTemplate } from "@/db/schema";
import {
  addCommunicationTemplate as sdkAdd,
  updateCommunicationTemplate as sdkUpdate,
  removeCommunicationTemplate as sdkRemove,
} from "@fiance/sdk";
import { getStorage } from "@/lib/kv-storage";
import { persistCommunicationTemplates } from "@/lib/persistence";
import { notifySync } from "@/lib/starfish";

interface CommunicationTemplatesState {
  communicationTemplates: CommunicationTemplate[];
  setCommunicationTemplates: (templates: CommunicationTemplate[]) => void;
  addCommunicationTemplate: (template: CommunicationTemplate) => void;
  updateCommunicationTemplate: (id: string, updates: Partial<CommunicationTemplate>) => void;
  removeCommunicationTemplate: (id: string) => void;
}

export const useCommunicationTemplatesStore = create<CommunicationTemplatesState>((set) => ({
  communicationTemplates: [],
  setCommunicationTemplates: (communicationTemplates) => set({ communicationTemplates }),
  addCommunicationTemplate: (template) => {
    set((s) => ({ communicationTemplates: sdkAdd(s.communicationTemplates, template) }));
    const storage = getStorage();
    if (storage) persistCommunicationTemplates(storage);
    notifySync();
  },
  updateCommunicationTemplate: (id, updates) => {
    set((s) => ({ communicationTemplates: sdkUpdate(s.communicationTemplates, id, updates) }));
    const storage = getStorage();
    if (storage) persistCommunicationTemplates(storage);
    notifySync();
  },
  removeCommunicationTemplate: (id) => {
    set((s) => ({ communicationTemplates: sdkRemove(s.communicationTemplates, id) }));
    const storage = getStorage();
    if (storage) persistCommunicationTemplates(storage);
    notifySync();
  },
}));
