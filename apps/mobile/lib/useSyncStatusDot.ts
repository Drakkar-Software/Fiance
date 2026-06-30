import { useState, useEffect } from "react";
import { getStarfishStore, onSyncStatusChange, subscribeSyncStatus, type SyncStatus } from "@/lib/starfish";
import { theme as GP } from "@/lib/theme";

/** Returns the color of the sync-status dot, or null if sync is off/inactive. */
export function useSyncStatusDot(): string | null {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

  useEffect(() => {
    let unsubStore: (() => void) | null = null;

    const attach = (enabled: boolean) => {
      unsubStore?.();
      unsubStore = null;
      if (enabled) {
        const sf = getStarfishStore();
        if (sf) {
          unsubStore = subscribeSyncStatus(sf, setSyncStatus);
        }
      } else {
        setSyncStatus(null);
      }
    };

    attach(!!getStarfishStore());
    const unsubInit = onSyncStatusChange(attach);

    return () => {
      unsubInit();
      unsubStore?.();
    };
  }, []);

  if (syncStatus === "synced") return GP.olive;
  if (syncStatus === "error") return "#EF4444";
  if (syncStatus === "syncing" || syncStatus === "pending") return GP.mustard;
  return null;
}
