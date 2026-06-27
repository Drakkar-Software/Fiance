import * as Updates from "expo-updates";
import { useUpdates } from "expo-updates";

/**
 * Wraps expo-updates to expose a stable update-banner API.
 *
 * `updateReady` is true when expo-updates has downloaded a new bundle
 * (`isUpdatePending`). `applyUpdate` reloads the JS bundle via
 * `Updates.reloadAsync()`.
 *
 * On web (expo-updates no-op) and in dev mode, `updateReady` is always false
 * and `applyUpdate` is a no-op.
 */
export function useAppUpdate(): { updateReady: boolean; applyUpdate: () => void } {
  const { isUpdatePending } = useUpdates();
  return {
    updateReady: isUpdatePending,
    applyUpdate: () => void Updates.reloadAsync(),
  };
}
