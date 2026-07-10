/**
 * Collaborator permission gating hook (Phase 1 — client-side UX enforcement).
 *
 * The owner (or any member with no cached matrix) is unrestricted. A member that
 * joined via a role-scoped invite has a resolved `permissions` matrix cached on its
 * registry entry (see lib/permissions/resolve.ts + join-space.ts); this hook reads it
 * reactively so tabs/controls update as soon as the matrix hydrates from sync.
 *
 * NOTE: for a member invited with edit rights this gating was cosmetic in the sense that
 * the local role matrix and the server-enforced cap can disagree — a member can have an
 * "edit" matrix while actually holding a read-only cap (stale invite, cap re-minted
 * read-only, etc). That mismatch previously caused edits to 403 silently and then get
 * reverted by the next hydrate with zero feedback. `useSyncAccessStore`'s `writeDenied`
 * flag closes that gap: it's set from the real cap (providers.tsx) and from an actual
 * 403 (space-sync.ts), and forces edit/create/delete off here regardless of what the
 * matrix says — 'view' stays untouched so the member still sees data, just can't edit it.
 */

import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";
import { useSyncAccessStore } from "@/store/useSyncAccessStore";
import {
  matrixAllows,
  FEATURE_SURFACES,
  type FeatureSurface,
  type PermissionAction,
  type PermissionMatrix,
} from "@fiance/sdk";

export interface Permissions {
  isOwner: boolean;
  /** True when the current device has full access (owner, or a member with no scoped role). */
  unrestricted: boolean;
  matrix: PermissionMatrix;
  can: (surface: FeatureSurface, action?: PermissionAction) => boolean;
  visibleSurfaces: FeatureSurface[];
}

export function usePermissions(): Permissions {
  const registry = useWeddingRegistryStore((s) => s.registry);
  const writeDenied = useSyncAccessStore((s) => s.writeDenied);
  const active = registry?.weddings.find((w) => w.id === registry.activeWeddingId) ?? null;
  const isOwner = !active || active.role !== "member";
  const matrix: PermissionMatrix = active?.permissions ?? {};
  const unrestricted = isOwner || !active?.permissions;

  const can = (surface: FeatureSurface, action: PermissionAction = "edit"): boolean => {
    if (writeDenied && action !== "view") return false;
    return unrestricted ? true : matrixAllows(matrix, surface, action);
  };

  const visibleSurfaces = unrestricted
    ? FEATURE_SURFACES
    : FEATURE_SURFACES.filter((s) => matrixAllows(matrix, s, "view"));

  return { isOwner, unrestricted, matrix, can, visibleSurfaces };
}

export function useCan(surface: FeatureSurface, action: PermissionAction = "edit"): boolean {
  return usePermissions().can(surface, action);
}
