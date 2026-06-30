import { create } from "zustand";
import type { Communication } from "@/db/schema";
import {
  addCommunication as sdkAdd,
  updateCommunication as sdkUpdate,
  removeCommunication as sdkRemove,
  toggleRecipient as sdkToggle,
  setRecipientDate as sdkSetDate,
  bulkSetRecipients as sdkBulkSet,
} from "@fiance/sdk";
import { getStorage } from "@/lib/kv-storage";
import { persistCommunications } from "@/lib/persistence";
import { notifySync } from "@/lib/starfish";

interface CommunicationsState {
  communications: Communication[];
  setCommunications: (communications: Communication[]) => void;
  addCommunication: (communication: Communication) => void;
  updateCommunication: (id: string, updates: Partial<Communication>) => void;
  removeCommunication: (id: string) => void;
  toggleRecipient: (commId: string, guestId: string, today: string) => void;
  setRecipientDate: (commId: string, guestId: string, sentAt: string | null) => void;
  bulkSetRecipients: (commId: string, guestIds: string[], sentAt: string | null) => void;
}

export const useCommunicationsStore = create<CommunicationsState>((set) => ({
  communications: [],
  setCommunications: (communications) => set({ communications }),
  addCommunication: (communication) => {
    set((s) => ({ communications: sdkAdd(s.communications, communication) }));
    const storage = getStorage();
    if (storage) persistCommunications(storage);
    notifySync();
  },
  updateCommunication: (id, updates) => {
    set((s) => ({ communications: sdkUpdate(s.communications, id, updates) }));
    const storage = getStorage();
    if (storage) persistCommunications(storage);
    notifySync();
  },
  removeCommunication: (id) => {
    set((s) => ({ communications: sdkRemove(s.communications, id) }));
    const storage = getStorage();
    if (storage) persistCommunications(storage);
    notifySync();
  },
  toggleRecipient: (commId, guestId, today) => {
    set((s) => ({ communications: sdkToggle(s.communications, commId, guestId, today) }));
    const storage = getStorage();
    if (storage) persistCommunications(storage);
    notifySync();
  },
  setRecipientDate: (commId, guestId, sentAt) => {
    set((s) => ({ communications: sdkSetDate(s.communications, commId, guestId, sentAt) }));
    const storage = getStorage();
    if (storage) persistCommunications(storage);
    notifySync();
  },
  bulkSetRecipients: (commId, guestIds, sentAt) => {
    set((s) => ({ communications: sdkBulkSet(s.communications, commId, guestIds, sentAt) }));
    const storage = getStorage();
    if (storage) persistCommunications(storage);
    notifySync();
  },
}));
