import { useEffect, useRef } from "react";
import * as Updates from "expo-updates";
import { useUpdates } from "expo-updates";

/**
 * Silently applies a downloaded EAS update as soon as it's ready, instead of
 * waiting for the next natural cold start. No-op on web / dev (`Updates.isEnabled`
 * is false there, and `reloadAsync()` throws if called while disabled).
 */
export function useAutoApplyUpdate(): void {
  const { isUpdatePending } = useUpdates();
  const hasReloaded = useRef(false);

  useEffect(() => {
    if (!isUpdatePending || hasReloaded.current || !Updates.isEnabled) return;
    hasReloaded.current = true;
    void Updates.reloadAsync();
  }, [isUpdatePending]);
}
