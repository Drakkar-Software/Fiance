import React, { useEffect } from "react";
import { AppState, Platform } from "react-native";

import { configureFiance, recoverSpaceAccess, readSpaces } from "@fiance/sdk";
import { configureStarfishPlatform, kvGet, kvSet, kvRemove } from "@drakkar.software/dk-spaces-platform-sdk";
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
import { hydrateFromSpace, scheduleSyncPush, pushSpaceSnapshot, refreshRsvpInbox, refreshFromSpaceIfIdle, discoverOwnerWeddingRoot, hydrateSawLegacyNodes, resetDirtyPushBaseline } from "@/lib/space-sync";
import { ensureSpaceProvisioned } from "@/lib/space-provision";
import { resolveServerUrl, resolveSessionConfig, normalizeSyncBase } from "@/lib/server";
import { ensurePublicPageNode, pushPublicPageContent, publicPageNodeId } from "@/lib/public-page";
import { useEntitlementsStore } from "@/store/useEntitlementsStore";
import { isPremium } from "@/lib/premium";
import { requestPermissions, rescheduleAllNotifications } from "@/lib/notifications";
import { setupPurchaseListeners } from "@/lib/iap";
import { handleReturnFromCheckout } from "@/lib/stripe";
import { useSettingsStore } from "@/store/useSettingsStore";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useWeddingStore } from "@/store/useWeddingStore";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";
import type { WeddingRegistryEntry } from "@/lib/wedding-registry";

/** Call once at app boot (before any store access) to configure the fiance SDK. */
export function configureOnBoot(): void {
  // Platform crypto: dk-spaces-platform-sdk is platform-split (index.js /
  // index.native.js), so Metro/Node each resolve the right implementation —
  // native installs react-native-quick-crypto (including globalThis.crypto,
  // needed by starfish-spaces' account-seal.ts for joinSpaceByLink) and web
  // is a no-op (globalThis.crypto is always available there).
  configureStarfishPlatform();

  const syncBase = normalizeSyncBase(resolveServerUrl() ?? "");
  configureFiance({ syncBase }, { get: kvGet, set: kvSet, remove: kvRemove });
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
 * Drop any in-flight activation for a wedding id so a subsequent activateSync()
 * call can't return a stale promise built from a since-changed registry entry
 * (e.g. a resync that cleared spaceId while a boot activation with the old
 * entry was still in flight — see resyncWeddingToCurrentNamespace).
 */
export function clearActivation(weddingId: string): void {
  _activating.delete(weddingId);
}

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

    // For member entries: restore the link credential first (member cap needed for
    // readObjectTree), then discover and adopt the owner's wedding root node id so
    // both devices converge on the same sync tree.
    // Moving recoverSpaceAccess here (from SyncInitializer) also covers the
    // settings sync-toggle path, which previously never restored member credentials.
    let weddingNodeId = wedding.weddingNodeId ?? wedding.id;
    if (wedding.role === "member") {
      await readSpaces(session.spacesRegistryClient, session)
        .then(({ caps, pubAccess }) => recoverSpaceAccess(session, { caps, pubAccess }))
        .catch((err) => console.warn("[providers] recoverSpaceAccess failed:", err));

      if (!wedding.weddingNodeId) {
        const adopted = await discoverOwnerWeddingRoot(session, spaceId, wedding.id)
          .catch((err) => { console.warn("[providers] discoverOwnerWeddingRoot failed:", err); return null; });
        if (adopted && adopted !== wedding.id) {
          weddingNodeId = adopted;
          // Persist so subsequent boots skip the discovery round-trip.
          await useWeddingRegistryStore.getState().updateWedding(wedding.id, { weddingNodeId: adopted })
            .catch((err) => console.warn("[providers] persist weddingNodeId failed:", err));
        }
      }
    }

    await initSync({ session, spaceId, serverUrl, weddingNodeId });
    return { userId };
  })();

  _activating.set(wedding.id, p);
  void p.finally(() => { _activating.delete(wedding.id); });
  return p;
}

/** Initializes starfish-spaces sync inside DatabaseProvider. */
export function SyncInitializer({ wedding }: { wedding: WeddingRegistryEntry }) {
  useEffect(() => {
    if (isSyncActive()) {
      teardownSync();
      // Dirty-push baselines are keyed by weddingNodeId — clear them on every
      // space switch so a stale baseline from the previous wedding/space can
      // never make a later pushSpaceSnapshot() see fresh content as already-pushed.
      resetDirtyPushBaseline();
    }

    if (!wedding.seedPhrase || wedding.syncDisabled || !isPremium()) return;

    let cancelled = false;
    let resolvedUserId: string | null = null;
    let unregisterPush: (() => void) | null = null;

    (async () => {
      const activated = await activateSync(wedding);
      if (cancelled || !activated) return;
      resolvedUserId = activated.userId;

      const session = getActiveSession();
      const spaceId = getActiveSpaceId();
      const weddingNodeId = getActiveWeddingNodeId();
      if (!session || !spaceId || !weddingNodeId) return;

      // B3: hydrate stores from ObjectNode server data (boot pull).
      // recoverSpaceAccess + discoverOwnerWeddingRoot run inside activateSync (above),
      // so the adopted weddingNodeId is already in effect via getActiveWeddingNodeId().
      if (!cancelled) {
        const nodeCount = await hydrateFromSpace(session, spaceId, weddingNodeId).catch((err) => {
          console.warn("[providers] hydrateFromSpace failed:", err);
          return -1;
        });
        // Owner-only one-shot push. Two triggers:
        //  - nodeCount === 0: empty space + local data (first launch after upgrading from
        //    Starfish 2.x) → seed the space.
        //  - hydrateSawLegacyNodes(): the space still has per-entity nodes from the old
        //    one-doc-per-entity model → migrate them into per-collection docs and prune the
        //    legacy nodes from the index (see space-sync pushSpaceSnapshot). This is the
        //    direct dev-phase cutover; it runs once (next boot sees no legacy nodes).
        // Guard: never let a member-role entry mutate the owner's shared space/index.
        if (
          !cancelled &&
          wedding.role !== "member" &&
          useWeddingStore.getState().wedding &&
          (nodeCount === 0 || hydrateSawLegacyNodes())
        ) {
          await pushSpaceSnapshot(session, spaceId, weddingNodeId).catch((err) => {
            console.warn("[providers] migration push failed:", err);
          });
        }
      }

      // B3: wire dispatchDocChange('*') → debounced server push.
      unregisterPush = registerPull("*", () => { scheduleSyncPush(); });

      // B5: ensure the publicPage node exists in the space.
      // Retried with backoff: pull errors and transient 409s are common on first
      // boot (Garage consistency lag, CDN cache). Each outer attempt runs runCas
      // internally; delays give the server time to settle between attempts.
      let publicPageNodeReady = false;
      if (!cancelled) {
        for (let attempt = 0; attempt < 5 && !cancelled; attempt++) {
          try {
            await ensurePublicPageNode(session, spaceId, weddingNodeId);
            publicPageNodeReady = true;
            break;
          } catch {
            if (attempt < 4 && !cancelled) {
              await new Promise<void>((r) => setTimeout(r, 2000 * (attempt + 1)));
            }
          }
        }
      }

      // ensurePublicPageNode only creates the index entry — it never pushes content,
      // so a brand-new wedding's public link 404s ("not published") until the owner's
      // first edit triggers the debounced push below. Push once now so the link is
      // live immediately after creation. Owner-only: a member's first sync must never
      // push its local (possibly stale/empty) snapshot over the owner's real content
      // (mirrors the wedding.role !== "member" guard on pushSpaceSnapshot above).
      if (!cancelled && publicPageNodeReady && wedding.role !== "member") {
        await pushPublicPageContent(session, spaceId, publicPageNodeId(weddingNodeId)).catch(
          (err) => console.warn("[providers] initial public page push failed:", err),
        );
      }

      // Pull entitlements using cap-cert.
      if (!cancelled) {
        const features = await pullEntitlements(null, activated.userId).catch(() => null);
        if (!cancelled && features !== null) {
          useEntitlementsStore.getState().setFeatures(features);
        }
      }
    })().catch((err) => console.warn("[providers] sync init failed:", err));

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
      // Pull peers' content changes on foreground (tab refocus / app resume) — content
      // sync otherwise only re-hydrates on cold boot/wedding switch (see space-sync.ts).
      refreshFromSpaceIfIdle().catch(() => {});
    });

    return () => {
      cancelled = true;
      foregroundSub.remove();
      unregisterPush?.();
    };
  }, [wedding.id]);

  // Re-push public page when day-of items or wedding info change (B5).
  // Debounced: collapses rapid per-keystroke changes into one network push.
  useEffect(() => {
    function pushPublicPageContentIfActive() {
      const session = getActiveSession();
      const spaceId = getActiveSpaceId();
      const weddingNodeId = getActiveWeddingNodeId();
      if (!session || !spaceId || !weddingNodeId) return;
      const pageId = `pub-${weddingNodeId}`;
      pushPublicPageContent(session, spaceId, pageId).catch(() => {});
    }

    let pushTimer: ReturnType<typeof setTimeout> | null = null;
    function schedulePublicPagePush() {
      if (pushTimer) clearTimeout(pushTimer);
      pushTimer = setTimeout(() => { pushTimer = null; pushPublicPageContentIfActive(); }, 2000);
    }

    let prevDayOfItems = usePlanningStore.getState().dayOfItems;
    let prevWedding = useWeddingStore.getState().wedding;

    const unsubPlanning = usePlanningStore.subscribe((state) => {
      if (state.dayOfItems !== prevDayOfItems) {
        prevDayOfItems = state.dayOfItems;
        schedulePublicPagePush();
      }
    });
    const unsubWedding = useWeddingStore.subscribe((state) => {
      if (state.wedding !== prevWedding) {
        prevWedding = state.wedding;
        schedulePublicPagePush();
      }
    });
    return () => { unsubPlanning(); unsubWedding(); if (pushTimer) clearTimeout(pushTimer); };
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
