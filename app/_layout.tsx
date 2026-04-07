import "../global.css";
import "@/i18n";
import React, { useEffect, useState, useCallback } from "react";
import { AppState, View, ActivityIndicator, Text } from "react-native";
import { Stack, usePathname, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import * as Linking from "expo-linking";
import * as Updates from "expo-updates";
import NetInfo from "@react-native-community/netinfo";
import { DatabaseProvider } from "@/db/provider";
import { getStarfishStore, initStarfish, teardownStarfish } from "@/lib/starfish";
import { initPublicPageSync, teardownPublicPageSync, notifyPublicPageSync } from "@/lib/public-page";
import { parseInviteUrl, deriveAuthToken, deriveEncryptionKey } from "@/lib/identity";
import { isLockEnabled } from "@/lib/app-lock";
import { isPremium } from "@/lib/premium";
import { requestPermissions, rescheduleAllNotifications } from "@/lib/notifications";
import { LockScreen } from "@/components/LockScreen";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";
import type { WeddingRegistryEntry } from "@/lib/wedding-registry";
import { useSettingsStore } from "@/store/useSettingsStore";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useWeddingStore } from "@/store/useWeddingStore";
import OnboardingScreen from "./onboarding";

/** Rendered inside DatabaseProvider so getDatabase() is guaranteed ready */
function SyncInitializer({ wedding }: { wedding: WeddingRegistryEntry }) {
  const pathname = usePathname();
  const isPublicPage = pathname.startsWith("/wedding/");

  useEffect(() => {
    // Never initialize sync when viewing the public wedding page
    if (isPublicPage) return;

    if (getStarfishStore()) teardownStarfish();
    teardownPublicPageSync();

    if (!wedding.seedPhrase || wedding.syncDisabled || !isPremium()) return;
    const serverUrl = wedding.serverUrl || process.env.EXPO_PUBLIC_SYNC_URL;
    if (!serverUrl) return;

    let cancelled = false;
    (async () => {
      const authToken = await deriveAuthToken(wedding.seedPhrase!);
      if (cancelled) return;
      const userId = authToken.slice(0, 16);
      const encryptionKey = await deriveEncryptionKey(wedding.seedPhrase!, userId);
      if (cancelled) return;
      initStarfish({ serverUrl, authToken, userId, encryptionKey });
      initPublicPageSync({ serverUrl, authToken, userId });
      // Pull remote data — critical for join flow so data appears immediately
      const sf = getStarfishStore();
      if (sf && !cancelled) {
        try { await sf.getState().pull(); } catch { /* sync will retry */ }
      }
      // Push initial public page data
      if (!cancelled) notifyPublicPageSync();
    })();

    return () => { cancelled = true; };
  }, [wedding.id, isPublicPage]);

  // Re-push public page when day-of items or wedding info change
  useEffect(() => {
    if (isPublicPage) return;

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
  }, [isPublicPage]);

  return null;
}

/** Request permissions on boot and reschedule all notifications from current data */
function NotificationInitializer() {
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

function AppContent() {
  const registry = useWeddingRegistryStore((s) => s.registry);
  const isLoaded = useWeddingRegistryStore((s) => s.isLoaded);
  const segments = useSegments();
  const isPublicPage = segments[0] === "wedding";
  const [inviteParams, setInviteParams] = useState<{
    name: string;
    password: string;
  } | null>(null);

  const activeWedding = registry?.weddings.find(
    (w) => w.id === registry.activeWeddingId
  ) ?? registry?.weddings[0] ?? null;

  // Handle deep links (initial + while app is open)
  useEffect(() => {
    function handleUrl(event: { url: string }) {
      const params = parseInviteUrl(event.url);
      if (params) setInviteParams(params);
    }

    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });

    const sub = Linking.addEventListener("url", handleUrl);
    return () => sub.remove();
  }, []);

  // Clear invite params once a wedding is created (onboarding completes)
  useEffect(() => {
    if (registry && registry.weddings.length > 0 && inviteParams) {
      setInviteParams(null);
    }
  }, [registry?.weddings.length]);

  // Public wedding page — render standalone without requiring a wedding
  if (isPublicPage) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="wedding/[id]" />
      </Stack>
    );
  }

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Loading WeddingOS...</Text>
      </View>
    );
  }

  if (!registry || registry.weddings.length === 0) {
    return (
      <OnboardingScreen
        inviteName={inviteParams?.name}
        invitePassword={inviteParams?.password}
      />
    );
  }

  return (
    <DatabaseProvider dbFileName={activeWedding!.dbFileName}>
      <SyncInitializer wedding={activeWedding!} />
      <NotificationInitializer />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="wedding/[id]" />
      </Stack>
    </DatabaseProvider>
  );
}

export default function RootLayout() {
  const loadRegistry = useWeddingRegistryStore((s) => s.load);
  const loadLanguage = useSettingsStore((s) => s.loadLanguage);
  const loadNotifications = useSettingsStore((s) => s.loadNotifications);
  const [locked, setLocked] = useState<boolean | null>(null);

  useEffect(() => {
    loadRegistry();
    Promise.all([loadLanguage(), loadNotifications(), isLockEnabled()]).then(
      ([, , enabled]) => setLocked(enabled)
    );
  }, []);

  useEffect(() => {
    if (__DEV__) return;
    (async () => {
      try {
        const { isAvailable } = await Updates.checkForUpdateAsync();
        if (isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch {
        // Silent fail — update check is best-effort
      }
    })();
  }, []);

  useEffect(() => {
    const appSub = AppState.addEventListener("change", (state) => {
      const sf = getStarfishStore();
      if (!sf) return;
      if (state === "background") {
        if (sf.getState().dirty) {
          sf.getState().flush();
        }
      } else if (state === "active") {
        // Pull partner's changes when returning to foreground
        const { online, syncing } = sf.getState();
        if (online && !syncing) {
          sf.getState().pull().catch(() => {});
        }
      }
    });

    const netSub = NetInfo.addEventListener(({ isConnected }) => {
      const sf = getStarfishStore();
      if (sf) {
        sf.getState().setOnline(!!isConnected);
      }
    });

    return () => {
      appSub.remove();
      netSub();
    };
  }, []);

  const handleUnlock = useCallback(() => setLocked(false), []);

  if (locked === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (locked) {
    return (
      <>
        <StatusBar style="auto" />
        <LockScreen onUnlock={handleUnlock} />
      </>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <StatusBar style="auto" />
        <AppContent />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
