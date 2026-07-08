/**
 * Route-aware edit gating. Infers the current feature surface from the active
 * route segments and returns whether the current collaborator may edit it.
 *
 * Used by the shared mutating wrappers (SaveHeaderButton, DeleteButton, FAB,
 * HeaderAddButton, FormActions) so a view-only role sees no edit affordances —
 * not just hidden tabs. Outside a feature surface (settings, onboarding, roles)
 * there is nothing to gate, so it returns editable.
 */

import { useSegments } from "expo-router";
import { type FeatureSurface } from "@fiance/sdk";
import { useCan } from "@/lib/permissions/usePermissions";
import { surfaceFromSegments } from "@/lib/permissions/surface";

export function useCurrentSurface(): FeatureSurface | null {
  return surfaceFromSegments(useSegments() as string[]);
}

/** True when the current route's surface is editable — or when there's no surface to gate. */
export function useCanEditHere(): boolean {
  const surface = useCurrentSurface();
  // Hooks must run unconditionally; when there is no surface we ignore the result.
  const canEditSurface = useCan((surface ?? "guests") as FeatureSurface, "edit");
  return surface === null ? true : canEditSurface;
}
