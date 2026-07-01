import type { WeddingRoleAssignment } from './schema.js';

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

/** Guest deleted: keep the role row, copy their name in, and detach the FK. */
export function detachGuestFromRoles(
  assignments: WeddingRoleAssignment[],
  guestId: string,
  displayName: string,
): WeddingRoleAssignment[] {
  const now = new Date().toISOString();
  return assignments.map((a) =>
    a.guestId === guestId ? { ...a, guestId: null, displayName, updatedAt: now } : a,
  );
}
