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
import { hydrateFromSpace, scheduleSyncPush, pushSpaceSnapshot } from "@/lib/space-sync";
import { resolveServerUrl, resolveSessionConfig } from "@/lib/server";
import { ensurePublicPageNode, pushPublicPageContent } from "@/lib/public-page";
import { useEntitlementsStore } from "@/store/useEntitlementsStore";
import { starfishAnalyticsAdapter, getAnalyticsCore } from "@/lib/analytics";
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
// The KV adapter bridges the seahorse MMKV/AsyncStorage store to the octospaces
// KvAdapter interface { get, set, remove }.
// ---------------------------------------------------------------------------

function makeKvAdapter() {
  return {
    get: async (key: string): Promise<string | null> => {
      const storage = getStorage();
      if (!storage) return null;
      // Synchronous MMKV read (native) or web-cache read (web)
      const raw = storage.getItemSync?.(key) ?? null;
      return raw;
    },
    set: async (key: string, value: string): Promise<void> => {
      const storage = getStorage();
      if (!storage) return;
      storage.setItemSync?.(key, value);
    },
    remove: async (key: string): Promise<void> => {
      const storage = getStorage();
      if (!storage) return;
      storage.removeItemSync?.(key);
    },
  };
}

/** Call once at app boot (before any store access) to configure the fiance SDK. */
export function configureOnBoot(): void {
  const serverUrl = resolveServerUrl();
  if (!serverUrl) return;
  configureFiance(
    {
      syncBase: serverUrl,
      syncNamespace: 'fiance',
      sharedSpacesNamespace: 'octospaces',
    },
    makeKvAdapter(),
  );
}

// ---------------------------------------------------------------------------
// SyncInitializer — replaces v2 initStarfish + createMobileLifecycle
// ---------------------------------------------------------------------------

/** Initializes octospaces sync inside DatabaseProvider. */
export function SyncInitializer({ wedding }: { wedding: WeddingRegistryEntry }) {
  useEffect(() => {
    if (isSyncActive()) teardownSync();
    starfishAnalyticsAdapter.deactivate();

    if (!wedding.seedPhrase || wedding.syncDisabled || !isPremium()) return;

    let cancelled = false;
    let resolvedUserId: string | null = null;
    let unregisterPush: (() => void) | null = null;

    (async () => {
      // Configure the SDK before calling resolveSessionConfig — deriveSession
      // requires configureOctoSpaces to have been called first.
      const earlyUrl = resolveServerUrl(wedding) ?? resolveServerUrl();
      if (earlyUrl) {
        configureFiance(
          { syncBase: earlyUrl, syncNamespace: 'fiance', sharedSpacesNamespace: 'octospaces' },
          makeKvAdapter(),
        );
      }

      const sessionConfig = await resolveSessionConfig(wedding);
      if (cancelled || !sessionConfig) return;

      const { session, userId, serverUrl } = sessionConfig;
      resolvedUserId = userId;

      // Re-configure with confirmed server URL (no-op when same as earlyUrl).
      configureFiance(
        { syncBase: serverUrl, syncNamespace: 'fiance', sharedSpacesNamespace: 'octospaces' },
        makeKvAdapter(),
      );

      // TODO(B3): load/create the space for this wedding.
      // For now, use a placeholder spaceId from the registry entry.
      const spaceId = (wedding as unknown as Record<string, unknown>).spaceId as string ?? userId;
      // The registry entry id is stable UUID — used as the root wedding ObjectNode id.
      const weddingNodeId = wedding.id;

      if (cancelled) return;
      await initSync({ session, spaceId, serverUrl, weddingNodeId });

      // B3: hydrate stores from ObjectNode server data (boot pull).
      if (!cancelled) {
        const nodeCount = await hydrateFromSpace(session, spaceId, weddingNodeId).catch((err) => {
          console.warn('[providers] hydrateFromSpace failed:', err);
          return -1;
        });
        // Auto-migrate legacy users: space is empty but local stores have data.
        // This happens on first launch after upgrading from Starfish 2.x.
        if (!cancelled && nodeCount === 0 && useWeddingStore.getState().wedding) {
          await pushSpaceSnapshot(session, spaceId, weddingNodeId).catch((err) => {
            console.warn('[providers] auto-migrate push failed:', err);
          });
        }
      }

      // B3: wire dispatchDocChange('*') → debounced server push.
      unregisterPush = registerPull('*', () => { scheduleSyncPush(); });

      // B5: ensure the publicPage node exists in the space.
      if (!cancelled) {
        await ensurePublicPageNode(session, spaceId, weddingNodeId).catch(() => {});
      }

      const userData = await getAnalyticsCore()?.exportUserData();
      starfishAnalyticsAdapter.activate(serverUrl, userData?.anonymousId ?? "anonymous");

      // Pull entitlements using cap-cert.
      if (!cancelled) {
        const features = await pullEntitlements(null, userId).catch(() => null);
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
    });

    return () => {
      cancelled = true;
      foregroundSub.remove();
      unregisterPush?.();
      starfishAnalyticsAdapter.deactivate();
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
