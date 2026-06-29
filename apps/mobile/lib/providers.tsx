import React, { useEffect } from "react";
import { AppState, Platform } from "react-native";

import { configureFiance } from "@fiance/sdk";
import { getStorage } from "@/lib/kv-storage";
import {
  initSync,
  teardownSync,
  pullEntitlements,
  isSyncActive,
  getActiveSession,
  getActiveSpaceId,
  getActiveWeddingNodeId,
} from "@/lib/starfish";
import { registerPull } from "@fiance/sdk";
import { hydrateFromSpace, scheduleSyncPush, pushSpaceSnapshot, refreshRsvpInbox } from "@/lib/space-sync";
import { ensureSpaceProvisioned } from "@/lib/space-provision";
import { resolveServerUrl, resolveSessionConfig } from "@/lib/server";
import { ensurePublicPageNode, pushPublicPageContent } from "@/lib/public-page";
import { useEntitlementsStore } from "@/store/useEntitlementsStore";
import { isPremium } from "@/lib/premium";
import { requestPermissions, rescheduleAllNotifications } from "@/lib/notifications";
import { setupPurchaseListeners } from "@/lib/iap";
import { handleReturnFromCheckout } from "@/lib/stripe";
import { useSettingsStore } from "@/store/useSettingsStore";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useWeddingStore } from "@/store/useWeddingStore";
import type { WeddingRegistryEntry } from "@/lib/wedding-registry";

// ---------------------------------------------------------------------------
// Boot: configure the Fiancé SDK once per process lifetime.
// The KV adapter bridges the seahorse MMKV/AsyncStorage store to the
// starfish-spaces KvAdapter interface { getItem, setItem, removeItem }.
// ---------------------------------------------------------------------------

function makeKvAdapter() {
  return {
    getItem: async (key: string): Promise<string | null> => {
      const storage = getStorage();
      if (!storage) return null;
      // Synchronous MMKV read (native) or web-cache read (web)
      return storage.getItemSync?.(key) ?? null;
    },
    setItem: async (key: string, value: string): Promise<void> => {
      const storage = getStorage();
      if (!storage) return;
      storage.setItemSync?.(key, value);
    },
    removeItem: async (key: string): Promise<void> => {
      const storage = getStorage();
      if (!storage) return;
      storage.removeItemSync?.(key);
    },
  };
}

/** Strip legacy `/v1` suffix — starfish-spaces client adds its own `/v1/{namespace}/` prefix. */
function normalizeSyncBase(url: string): string {
  return url.replace(/\/v1\/?$/, "");
}

/** Call once at app boot (before any store access) to configure the fiance SDK. */
export function configureOnBoot(): void {
  // Platform crypto: on native, install react-native-quick-crypto.
  // Web/Node uses globalThis.crypto which is always available — no setup needed.
  if (Platform.OS !== "web") {
    // Dynamic require so Metro doesn't bundle this on web where quick-crypto is absent.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { configurePlatform } = require("@fiance/sdk") as {
      configurePlatform: (cfg: { crypto: unknown }) => void;
    };
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const QuickCrypto = require("react-native-quick-crypto");
    // base64 intentionally omitted: starfish-protocol's getBase64() falls back to
    // Hermes btoa/atob (or a pure-JS codec), so no Buffer global is needed.
    configurePlatform({ crypto: QuickCrypto });
  }

  configureFiance(makeKvAdapter());
}

// ---------------------------------------------------------------------------
// SyncInitializer — replaces v2 initStarfish + createMobileLifecycle
// ---------------------------------------------------------------------------

/**
 * In-flight activations keyed by wedding.id. Dedupes concurrent calls from
 * SyncInitializer (boot) and the settings toggle so ensureSpaceProvisioned and
 * initSync run exactly once per wedding at a time. Cleared in .finally() so a
 * subsequent re-activation after teardownSync works normally.
 */
const _activating = new Map<string, Promise<{ userId: string } | null>>();

/**
 * Core sync activation: resolves session, provisions space, and calls initSync.
 * Returns { userId } on success, null if any step fails.
 * Used by both SyncInitializer (boot) and the settings toggle (runtime enable).
 * Single-flight: concurrent calls for the same wedding.id share one promise.
 */
export function activateSync(
  wedding: WeddingRegistryEntry,
): Promise<{ userId: string } | null> {
  const inflight = _activating.get(wedding.id);
  if (inflight) return inflight;

  const p = (async () => {
    const sessionConfig = await resolveSessionConfig(wedding);
    if (!sessionConfig) return null;
    const { session, userId, serverUrl } = sessionConfig;
    const spaceId = await ensureSpaceProvisioned(session, wedding);
    await initSync({ session, spaceId, serverUrl, weddingNodeId: wedding.id });
    return { userId };
  })();

  _activating.set(wedding.id, p);
  void p.finally(() => { _activating.delete(wedding.id); });
  return p;
}

/** Initializes starfish-spaces sync inside DatabaseProvider. */
export function SyncInitializer({ wedding }: { wedding: WeddingRegistryEntry }) {
  useEffect(() => {
    if (isSyncActive()) teardownSync();

    if (!wedding.seedPhrase || wedding.syncDisabled || !isPremium()) return;

    let cancelled = false;
    let resolvedUserId: string | null = null;
    let unregisterPush: (() => void) | null = null;

    (async () => {
      console.info("[fiance] sync build alpha.49");
      const activated = await activateSync(wedding);
      if (cancelled || !activated) return;
      resolvedUserId = activated.userId;

      const session = getActiveSession();
      const spaceId = getActiveSpaceId();
      const weddingNodeId = getActiveWeddingNodeId();
      if (!session || !spaceId || !weddingNodeId) return;

      // B3: hydrate stores from ObjectNode server data (boot pull).
      if (!cancelled) {
        const nodeCount = await hydrateFromSpace(session, spaceId, weddingNodeId).catch((err) => {
          console.warn("[providers] hydrateFromSpace failed:", err);
          return -1;
        });
        // Auto-migrate legacy users: space is empty but local stores have data.
        // This happens on first launch after upgrading from Starfish 2.x.
        if (!cancelled && nodeCount === 0 && useWeddingStore.getState().wedding) {
          await pushSpaceSnapshot(session, spaceId, weddingNodeId).catch((err) => {
            console.warn("[providers] auto-migrate push failed:", err);
          });
        }
      }

      // B3: wire dispatchDocChange('*') → debounced server push.
      unregisterPush = registerPull("*", () => { scheduleSyncPush(); });

      // B5: ensure the publicPage node exists in the space.
      // Retried with backoff: pull errors and transient 409s are common on first
      // boot (Garage consistency lag, CDN cache). Each outer attempt runs runCas
      // internally; delays give the server time to settle between attempts.
      if (!cancelled) {
        for (let attempt = 0; attempt < 5 && !cancelled; attempt++) {
          try {
            await ensurePublicPageNode(session, spaceId, weddingNodeId);
            break;
          } catch {
            if (attempt < 4 && !cancelled) {
              await new Promise<void>((r) => setTimeout(r, 2000 * (attempt + 1)));
            }
          }
        }
      }

      // Pull entitlements using cap-cert.
      if (!cancelled) {
        const features = await pullEntitlements(null, activated.userId).catch(() => null);
        if (!cancelled && features !== null) {
          useEntitlementsStore.getState().setFeatures(features);
        }
      }
    })();

    // Re-pull entitlements on foreground.
    const foregroundSub = AppState.addEventListener("change", (state) => {
      if (state !== "active" || !resolvedUserId) return;
      pullEntitlements(null, resolvedUserId)
        .then((features) => {
          if (features.length > 0) useEntitlementsStore.getState().setFeatures(features);
        })
        .catch(() => {});
      const fgSession = getActiveSession();
      const fgSpaceId = getActiveSpaceId();
      if (fgSession && fgSpaceId) {
        refreshRsvpInbox(fgSession, fgSpaceId).catch(() => {});
      }
    });

    return () => {
      cancelled = true;
      foregroundSub.remove();
      unregisterPush?.();
    };
  }, [wedding.id]);

  // Re-push public page when day-of items or wedding info change (B5).
  useEffect(() => {
    function pushPublicPageContentIfActive() {
      const session = getActiveSession();
      const spaceId = getActiveSpaceId();
      const weddingNodeId = getActiveWeddingNodeId();
      if (!session || !spaceId || !weddingNodeId) return;
      const pageId = `pub-${weddingNodeId}`;
      pushPublicPageContent(session, spaceId, pageId).catch(() => {});
    }

    let prevDayOfItems = usePlanningStore.getState().dayOfItems;
    let prevWedding = useWeddingStore.getState().wedding;

    const unsubPlanning = usePlanningStore.subscribe((state) => {
      if (state.dayOfItems !== prevDayOfItems) {
        prevDayOfItems = state.dayOfItems;
        pushPublicPageContentIfActive();
      }
    });
    const unsubWedding = useWeddingStore.subscribe((state) => {
      if (state.wedding !== prevWedding) {
        prevWedding = state.wedding;
        pushPublicPageContentIfActive();
      }
    });
    return () => { unsubPlanning(); unsubWedding(); };
  }, []);

  return null;
}

// ---------------------------------------------------------------------------
// IAPInitializer — IAP + Stripe (unchanged from v2, Doubloon not migrated yet)
// ---------------------------------------------------------------------------

/** Sets up IAP purchase listeners (mobile) or handles Stripe return (web). */
export function IAPInitializer({ wedding }: { wedding: WeddingRegistryEntry }) {
  const [starfishUserId, setStarfishUserId] = React.useState<string | null>(null);

  useEffect(() => {
    if (!wedding.seedPhrase) return;
    resolveSessionConfig(wedding)
      .then((cfg) => { if (cfg) setStarfishUserId(cfg.userId); })
      .catch(() => {});
  }, [wedding.id, wedding.seedPhrase]);

  useEffect(() => {
    if (!starfishUserId) return;
    if (Platform.OS === "web") {
      handleReturnFromCheckout(starfishUserId).catch(() => {});
      return;
    }
    const teardown = setupPurchaseListeners(starfishUserId);
    return () => { teardown?.(); };
  }, [starfishUserId]);

  return null;
}

// ---------------------------------------------------------------------------
// NotificationInitializer — unchanged
// ---------------------------------------------------------------------------

/** Request permissions on boot and reschedule all notifications. */
export function NotificationInitializer() {
  useEffect(() => {
    (async () => {
      try {
        const granted = await requestPermissions();
        if (!granted) return;
        if (useSettingsStore.getState().notificationsEnabled) {
          const { tasks, agendaEvents } = usePlanningStore.getState();
          await rescheduleAllNotifications(tasks, agendaEvents);
        }
      } catch (err) {
        console.warn("[notifications] Initialization failed:", err);
      }
    })();
  }, []);
  return null;
}
