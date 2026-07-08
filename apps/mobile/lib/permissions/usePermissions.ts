/**
 * Collaborator permission gating hook (Phase 1 — client-side UX enforcement).
 *
 * The owner (or any member with no cached matrix) is unrestricted. A member that
 * joined via a role-scoped invite has a resolved `permissions` matrix cached on its
 * registry entry (see lib/permissions/resolve.ts + join-space.ts); this hook reads it
 * reactively so tabs/controls update as soon as the matrix hydrates from sync.
 *
 * NOTE: for a member invited with edit rights this gating is cosmetic — that member
 * holds the space keyring + a write cap. Read-only ("app-readonly") roles are the only
 * ones with a server-side boundary (Phase 2, via the invite `write=false` cap).
 */

import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";
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
  const active = registry?.weddings.find((w) => w.id === registry.activeWeddingId) ?? null;
  const isOwner = !active || active.role !== "member";
  const matrix: PermissionMatrix = active?.permissions ?? {};
  const unrestricted = isOwner || !active?.permissions;

  const can = (surface: FeatureSurface, action: PermissionAction = "edit"): boolean =>
    unrestricted ? true : matrixAllows(matrix, surface, action);

  const visibleSurfaces = unrestricted
    ? FEATURE_SURFACES
    : FEATURE_SURFACES.filter((s) => matrixAllows(matrix, s, "view"));

  return { isOwner, unrestricted, matrix, can, visibleSurfaces };
}

export function useCan(surface: FeatureSurface, action: PermissionAction = "edit"): boolean {
  return usePermissions().can(surface, action);
}
