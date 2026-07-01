import type { WeddingRole, WeddingRoleAssignment } from './schema.js';
import { LEGACY_GUEST_ROLE_NAMES } from './types.js';

// ─── Role catalog ───────────────────────────────────────────────────────────

export function addWeddingRole(roles: WeddingRole[], role: WeddingRole): WeddingRole[] {
  return [...roles, role];
}

export function updateWeddingRole(
  roles: WeddingRole[],
  id: string,
  updates: Partial<WeddingRole>,
): WeddingRole[] {
  const now = new Date().toISOString();
  return roles.map((r) => (r.id === id ? { ...r, ...updates, updatedAt: now } : r));
}

export function removeWeddingRole(roles: WeddingRole[], id: string): WeddingRole[] {
  return roles.filter((r) => r.id !== id);
}

// ─── Role assignments (guest ↔ role) ────────────────────────────────────────

export function addRoleAssignment(
  assignments: WeddingRoleAssignment[],
  assignment: WeddingRoleAssignment,
): WeddingRoleAssignment[] {
  return [...assignments, assignment];
}

export function updateRoleAssignment(
  assignments: WeddingRoleAssignment[],
  id: string,
  updates: Partial<WeddingRoleAssignment>,
): WeddingRoleAssignment[] {
  const now = new Date().toISOString();
  return assignments.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: now } : a));
}

export function removeRoleAssignment(assignments: WeddingRoleAssignment[], id: string): WeddingRoleAssignment[] {
  return assignments.filter((a) => a.id !== id);
}

/** Guest deleted: their role assignments no longer make sense, so drop them. */
export function removeRoleAssignmentsForGuest(
  assignments: WeddingRoleAssignment[],
  guestId: string,
): WeddingRoleAssignment[] {
  return assignments.filter((a) => a.guestId !== guestId);
}

/** Role deleted: cascade-remove any assignment pointing at it. */
export function removeRoleAssignmentsForRole(
  assignments: WeddingRoleAssignment[],
  roleId: string,
): WeddingRoleAssignment[] {
  return assignments.filter((a) => a.roleId !== roleId);
}

// ─── Legacy migration ───────────────────────────────────────────────────────

/**
 * Migrates pre-existing role assignments (fixed `GuestRole` enum + optional
 * external person) to the user-created role catalog. No-op if `assignments`
 * are already in the new shape (have `roleId`). External (non-guest) entries
 * are dropped — only guests can hold roles now.
 */
export function migrateRoleAssignments(
  rawAssignments: unknown[],
): { roles: WeddingRole[]; assignments: WeddingRoleAssignment[] } {
  const legacy = rawAssignments as Array<Record<string, unknown>>;
  if (legacy.length === 0 || legacy.every((a) => typeof a.roleId === 'string')) {
    return { roles: [], assignments: legacy as unknown as WeddingRoleAssignment[] };
  }

  const now = new Date().toISOString();
  const roleIdByName = new Map<string, string>();
  const roles: WeddingRole[] = [];

  const roleIdFor = (roleKey: string): string => {
    const name = LEGACY_GUEST_ROLE_NAMES[roleKey] ?? roleKey;
    let id = roleIdByName.get(name);
    if (!id) {
      id = `migrated-role-${roles.length + 1}`;
      roleIdByName.set(name, id);
      roles.push({ id, name, sortOrder: roles.length + 1, createdAt: now, updatedAt: now });
    }
    return id;
  };

  const assignments: WeddingRoleAssignment[] = legacy
    .filter((a) => !!a.guestId) // drop former external (non-guest) entries
    .map((a) => ({
      id: a.id as string,
      roleId: roleIdFor(a.role as string),
      guestId: a.guestId as string,
      notes: (a.notes as string | null) ?? null,
      sortOrder: (a.sortOrder as number | null) ?? null,
      createdAt: (a.createdAt as string | null) ?? now,
      updatedAt: (a.updatedAt as string | null) ?? now,
    }));

  return { roles, assignments };
}
