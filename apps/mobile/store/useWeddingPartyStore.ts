import { create } from "zustand";
import type { WeddingRole, WeddingRoleAssignment } from "@/db/schema";
import {
  DEFAULT_WEDDING_ROLES,
  addWeddingRole as sdkAddRole,
  updateWeddingRole as sdkUpdateRole,
  removeWeddingRole as sdkRemoveRole,
  addRoleAssignment as sdkAdd,
  updateRoleAssignment as sdkUpdate,
  removeRoleAssignment as sdkRemove,
  removeRoleAssignmentsForGuest as sdkRemoveForGuest,
  removeRoleAssignmentsForRole as sdkRemoveForRole,
} from "@fiance/sdk";
import * as Crypto from "expo-crypto";
import { getStorage } from "@/lib/kv-storage";
import { persistWeddingRoles, persistWeddingRoleAssignments } from "@/lib/persistence";
import { notifySync } from "@/lib/starfish";

interface WeddingPartyState {
  weddingRoles: WeddingRole[];
  setWeddingRoles: (roles: WeddingRole[]) => void;
  addWeddingRole: (role: WeddingRole) => void;
  updateWeddingRole: (id: string, updates: Partial<WeddingRole>) => void;
  removeWeddingRole: (id: string) => void;
  seedDefaultRoles: () => void;

  weddingRoleAssignments: WeddingRoleAssignment[];
  setWeddingRoleAssignments: (assignments: WeddingRoleAssignment[]) => void;
  addRoleAssignment: (assignment: WeddingRoleAssignment) => void;
  updateRoleAssignment: (id: string, updates: Partial<WeddingRoleAssignment>) => void;
  removeRoleAssignment: (id: string) => void;
  removeRoleAssignmentsForGuest: (guestId: string) => void;
}

export const useWeddingPartyStore = create<WeddingPartyState>((set, get) => ({
  weddingRoles: [],
  setWeddingRoles: (weddingRoles) => set({ weddingRoles }),
  addWeddingRole: (role) => {
    set((s) => ({ weddingRoles: sdkAddRole(s.weddingRoles, role) }));
    const storage = getStorage();
    if (storage) persistWeddingRoles(storage);
    notifySync();
  },
  updateWeddingRole: (id, updates) => {
    set((s) => ({ weddingRoles: sdkUpdateRole(s.weddingRoles, id, updates) }));
    const storage = getStorage();
    if (storage) persistWeddingRoles(storage);
    notifySync();
  },
  removeWeddingRole: (id) => {
    set((s) => ({
      weddingRoles: sdkRemoveRole(s.weddingRoles, id),
      weddingRoleAssignments: sdkRemoveForRole(s.weddingRoleAssignments, id),
    }));
    const storage = getStorage();
    if (storage) {
      persistWeddingRoles(storage);
      persistWeddingRoleAssignments(storage);
    }
    notifySync();
  },
  seedDefaultRoles: () => {
    const existingNames = new Set(get().weddingRoles.map((r) => r.name));
    const now = new Date().toISOString();
    const toAdd = DEFAULT_WEDDING_ROLES.filter((name) => !existingNames.has(name)).map((name) => ({
      id: Crypto.randomUUID(),
      name,
      sortOrder: null,
      createdAt: now,
      updatedAt: now,
    }));
    if (toAdd.length === 0) return;
    set((s) => ({ weddingRoles: [...s.weddingRoles, ...toAdd] }));
    const storage = getStorage();
    if (storage) persistWeddingRoles(storage);
    notifySync();
  },

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
  removeRoleAssignmentsForGuest: (guestId) => {
    set((s) => ({ weddingRoleAssignments: sdkRemoveForGuest(s.weddingRoleAssignments, guestId) }));
    const storage = getStorage();
    if (storage) persistWeddingRoleAssignments(storage);
    notifySync();
  },
}));
