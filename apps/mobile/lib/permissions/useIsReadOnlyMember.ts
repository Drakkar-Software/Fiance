import { useSyncAccessStore } from "@/store/useSyncAccessStore";
import { usePermissions } from "@/lib/permissions/usePermissions";

/**
 * True when this device can't edit anything — either the space cap has been
 * proven read-only (`useSyncAccessStore`'s `writeDenied`, the authoritative
 * server-truth signal), or the locally-cached role matrix grants only "view"
 * on every visible surface (`usePermissions`). The two mostly agree (the
 * system Viewer/Planner roles are both "app-readonly" tier and always mint a
 * write-denied cap), but a custom mixed-edit role can be locally view-only on
 * some surfaces while still holding a writable cap overall — the matrix check
 * catches that case the cap-based signal alone would miss.
 *
 * Shared by ReadOnlyBanner (desktop web) and the /home warning banner (native
 * + narrow web) so both surfaces agree on when to show and what it means.
 */
export function useIsReadOnlyMember(): boolean {
  const writeDenied = useSyncAccessStore((s) => s.writeDenied);
  const { isOwner, unrestricted, visibleSurfaces } = usePermissions();
  const isReadOnlyCollaborator = !isOwner && !unrestricted && visibleSurfaces.length > 0;
  return writeDenied || isReadOnlyCollaborator;
}
