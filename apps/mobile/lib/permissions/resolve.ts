/**
 * Resolve the active member's role → permission matrix and cache it on the
 * registry entry, so `usePermissions()` can gate the UI synchronously/offline.
 *
 * Called after a join and whenever the synced permissions collection changes
 * (the owner's assignment may land after the join completes).
 */

import { resolvePermissionForSubject } from "@fiance/sdk";
import { usePermissionsStore } from "@/store/usePermissionsStore";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";

/** Re-resolve + cache the permission matrix for the active wedding, if it's a scoped member. */
export async function resolveActiveMemberPermissions(): Promise<void> {
  const regStore = useWeddingRegistryStore.getState();
  const registry = regStore.registry;
  const active = registry?.weddings.find((w) => w.id === registry.activeWeddingId);
  if (!active || active.role !== "member" || !active.inviteSubjectId) return;

  const { roles, assignments } = usePermissionsStore.getState();
  const resolved = resolvePermissionForSubject(roles, assignments, active.inviteSubjectId);

  if (!resolved) {
    // No assignment for this device. Two cases to distinguish:
    //  - the permissions collection hasn't synced yet (roles empty) → leave the cache, retry.
    //  - it HAS synced (roles present) AND this device previously had a resolved role
    //    (roleId set) → the owner removed/revoked the assignment. Lock the member out with an
    //    empty matrix (NOT undefined, which usePermissions treats as unrestricted).
    if (roles.length > 0 && active.roleId !== undefined) {
      await regStore.updateWedding(active.id, { roleId: undefined, permissions: {} });
    }
    return;
  }

  // No-op if unchanged to avoid a redundant registry write / re-render.
  if (active.roleId === resolved.role.id) return;
  await regStore.updateWedding(active.id, {
    roleId: resolved.role.id,
    permissions: resolved.matrix,
  });
}
