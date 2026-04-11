import { useEffect } from "react";
import { usePathname } from "expo-router";
import { getStarfishStore, initStarfish, teardownStarfish } from "@/lib/starfish";
import { initPublicPageSync, teardownPublicPageSync, pullPublicPageSync, notifyPublicPageSync } from "@/lib/public-page";
import { resolveServerConfig } from "@/lib/server";
import { isPremium } from "@/lib/premium";
import { requestPermissions, rescheduleAllNotifications } from "@/lib/notifications";
import { useSettingsStore } from "@/store/useSettingsStore";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useWeddingStore } from "@/store/useWeddingStore";
import type { WeddingRegistryEntry } from "@/lib/wedding-registry";

/** Initializes Starfish + public page sync inside DatabaseProvider */
export function SyncInitializer({ wedding }: { wedding: WeddingRegistryEntry }) {
  useEffect(() => {
    if (getStarfishStore()) teardownStarfish();
    teardownPublicPageSync();

    if (!wedding.seedPhrase || wedding.syncDisabled || !isPremium()) return;

    let cancelled = false;
    (async () => {
      const config = await resolveServerConfig(wedding);
      if (cancelled || !config) return;
      initStarfish(config);
      initPublicPageSync(config);
      const sf = getStarfishStore();
      if (sf && !cancelled) {
        try { await sf.getState().pull(); } catch { /* sync will retry */ }
      }
      if (!cancelled) {
        await pullPublicPageSync();
        notifyPublicPageSync();
      }
    })();

    return () => { cancelled = true; };
  }, [wedding.id]);

  // Re-push public page when day-of items or wedding info change
  useEffect(() => {
    let prevDayOfItems = usePlanningStore.getState().dayOfItems;
    let prevWedding = useWeddingStore.getState().wedding;

    const unsubPlanning = usePlanningStore.subscribe((state) => {
      if (state.dayOfItems !== prevDayOfItems) {
        prevDayOfItems = state.dayOfItems;
        notifyPublicPageSync();
      }
    });
    const unsubWedding = useWeddingStore.subscribe((state) => {
      if (state.wedding !== prevWedding) {
        prevWedding = state.wedding;
        notifyPublicPageSync();
      }
    });
    return () => { unsubPlanning(); unsubWedding(); };
  }, []);

  return null;
}

/** Request permissions on boot and reschedule all notifications from current data */
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
