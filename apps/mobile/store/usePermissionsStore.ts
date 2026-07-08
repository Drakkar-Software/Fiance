import { create } from "zustand";
import type { RoleDefinition, PermissionAssignment } from "@/db/schema";
import {
  addPermissionRole as sdkAddRole,
  updatePermissionRole as sdkUpdateRole,
  removePermissionRole as sdkRemoveRole,
  upsertPermissionAssignment as sdkUpsertAssignment,
  removePermissionAssignment as sdkRemoveAssignment,
  removeAssignmentsForRole as sdkRemoveAssignmentsForRole,
} from "@fiance/sdk";
import { getStorage } from "@/lib/kv-storage";
import { persistPermissionRoles, persistPermissionAssignments } from "@/lib/persistence";
import { notifySync } from "@/lib/starfish";

interface PermissionsState {
  roles: RoleDefinition[];
  setRoles: (roles: RoleDefinition[]) => void;
  addRole: (role: RoleDefinition) => void;
  updateRole: (id: string, updates: Partial<RoleDefinition>) => void;
  removeRole: (id: string) => void;

  assignments: PermissionAssignment[];
  setAssignments: (assignments: PermissionAssignment[]) => void;
  upsertAssignment: (assignment: PermissionAssignment) => void;
  removeAssignment: (id: string) => void;
}

export const usePermissionsStore = create<PermissionsState>((set) => ({
  roles: [],
  setRoles: (roles) => set({ roles }),
  addRole: (role) => {
    set((s) => ({ roles: sdkAddRole(s.roles, role) }));
    const storage = getStorage();
    if (storage) persistPermissionRoles(storage);
    notifySync();
  },
  updateRole: (id, updates) => {
    set((s) => ({ roles: sdkUpdateRole(s.roles, id, updates, new Date().toISOString()) }));
    const storage = getStorage();
    if (storage) persistPermissionRoles(storage);
    notifySync();
  },
  removeRole: (id) => {
    set((s) => ({
      roles: sdkRemoveRole(s.roles, id),
      assignments: sdkRemoveAssignmentsForRole(s.assignments, id),
    }));
    const storage = getStorage();
    if (storage) {
      persistPermissionRoles(storage);
      persistPermissionAssignments(storage);
    }
    notifySync();
  },

  assignments: [],
  setAssignments: (assignments) => set({ assignments }),
  upsertAssignment: (assignment) => {
    set((s) => ({ assignments: sdkUpsertAssignment(s.assignments, assignment) }));
    const storage = getStorage();
    if (storage) persistPermissionAssignments(storage);
    notifySync();
  },
  removeAssignment: (id) => {
    set((s) => ({ assignments: sdkRemoveAssignment(s.assignments, id) }));
    const storage = getStorage();
    if (storage) persistPermissionAssignments(storage);
    notifySync();
  },
}));
