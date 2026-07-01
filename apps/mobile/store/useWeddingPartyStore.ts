import { create } from "zustand";
import type { WeddingRoleAssignment } from "@/db/schema";
import {
  addRoleAssignment as sdkAdd,
  updateRoleAssignment as sdkUpdate,
  removeRoleAssignment as sdkRemove,
  detachGuestFromRoles as sdkDetachGuest,
} from "@fiance/sdk";
import { getStorage } from "@/lib/kv-storage";
import { persistWeddingRoleAssignments } from "@/lib/persistence";
import { notifySync } from "@/lib/starfish";

interface WeddingPartyState {
  weddingRoleAssignments: WeddingRoleAssignment[];
  setWeddingRoleAssignments: (assignments: WeddingRoleAssignment[]) => void;
  addRoleAssignment: (assignment: WeddingRoleAssignment) => void;
  updateRoleAssignment: (id: string, updates: Partial<WeddingRoleAssignment>) => void;
  removeRoleAssignment: (id: string) => void;
  detachGuestFromRoles: (guestId: string, displayName: string) => void;
}

export const useWeddingPartyStore = create<WeddingPartyState>((set) => ({
  weddingRoleAssignments: [],
  setWeddingRoleAssignments: (weddingRoleAssignments) => set({ weddingRoleAssignments }),
  addRoleAssignment: (assignment) => {
    set((s) => ({ weddingRoleAssignments: sdkAdd(s.weddingRoleAssignments, assignment) }));
    const storage = getStorage();
    if (storage) persistWeddingRoleAssignments(storage);
    notifySync();
  },
  updateRoleAssignment: (id, updates) => {
    set((s) => ({ weddingRoleAssignments: sdkUpdate(s.weddingRoleAssignments, id, updates) }));
    const storage = getStorage();
    if (storage) persistWeddingRoleAssignments(storage);
    notifySync();
  },
  removeRoleAssignment: (id) => {
    set((s) => ({ weddingRoleAssignments: sdkRemove(s.weddingRoleAssignments, id) }));
    const storage = getStorage();
    if (storage) persistWeddingRoleAssignments(storage);
    notifySync();
  },
  detachGuestFromRoles: (guestId, displayName) => {
    set((s) => ({ weddingRoleAssignments: sdkDetachGuest(s.weddingRoleAssignments, guestId, displayName) }));
    const storage = getStorage();
    if (storage) persistWeddingRoleAssignments(storage);
    notifySync();
  },
}));
