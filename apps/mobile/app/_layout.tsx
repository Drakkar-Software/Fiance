import "react-native-get-random-values";
import "../global.css";
import "@/i18n";
import React, { useEffect, useState, useCallback } from "react";
import { useFonts } from "expo-font";
import {
  Fraunces_300Light,
  Fraunces_400Regular,
  Fraunces_400Regular_Italic,
  Fraunces_500Medium,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
  // @ts-ignore — italic variants follow same naming pattern
  Fraunces_500Medium_Italic,
  Fraunces_600SemiBold_Italic,
} from "@expo-google-fonts/fraunces";
import {
  Caveat_400Regular,
  Caveat_500Medium,
  Caveat_700Bold,
} from "@expo-google-fonts/caveat";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { Appearance, Platform, useColorScheme } from "react-native";

// Apply dark class synchronously before React renders (prevents flash on web)
if (typeof document !== "undefined") {
  try {
    const stored = localStorage.getItem("wos_color_scheme") || "light";
    const isDark =
      stored === "dark" ||
      (stored === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);
  } catch {}
}
import { View, ActivityIndicator, Text } from "react-native-css/components";
import { Stack, useSegments, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ForgeThemeProvider } from "@fiance/ui/theme";
import { theme as GP } from "@/lib/theme";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { isLockEnabled } from "@/lib/app-lock";
import { LockScreen } from "@/components/LockScreen";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Toaster } from "@/lib/toast/sonner";
import { TelemetryProvider, useTelemetryScreenTracking } from "@drakkar.software/dk-spaces-analytics-sdk";
import { analytics, initAnalytics } from "@/lib/analytics";
import { configureOnBoot, SyncInitializer, NotificationInitializer, RevenueCatInitializer, WeddingPremiumInitializer, WidgetInitializer } from "@/lib/providers";
import { DatabaseProvider, useDatabaseSwitching } from "@/db/provider";
import type { WeddingRegistryEntry } from "@/lib/wedding-registry";
import { OfflineBanner } from "@/components/OfflineBanner";
import { ReadOnlyBanner } from "@/components/ReadOnlyBanner";
import { FeatureWelcomeHost } from "@/lib/feature-welcomes";
import { useFeatureTrialsStore } from "@/store/useFeatureTrialsStore";
import { ObserveRoot, useObserve } from "expo-observe";

// Configure octospaces-sdk at module load so deriveSession/buildSession are
// available before any screen renders (home, settings, public-page all call
// resolveServerConfig which calls deriveSession).
configureOnBoot();


// Hosts every per-wedding side-effect initializer (sync, notifications, RevenueCat,
// premium flag, widget). Unmounted for the duration of a wedding switch (see
// useDatabaseSwitching) so none of them keep running — subscriptions firing,
// in-flight sync pulls/pushes, AppState listeners — against the old wedding's
// torn-down DB/sync globals while clearAllStores/hydrateAllStores swap underneath.
// They remount fresh, for the new wedding, once the swap completes.
function ActiveWeddingRuntime({ wedding }: { wedding: WeddingRegistryEntry }) {
  const switching = useDatabaseSwitching();
  if (switching) return null;
  return (
    <>
      <SyncInitializer wedding={wedding} />
      <NotificationInitializer />
      <RevenueCatInitializer wedding={wedding} />
      <WeddingPremiumInitializer wedding={wedding} />
      <WidgetInitializer />
    </>
  );
}

function AppContent() {
  const registry = useWeddingRegistryStore((s) => s.registry);
  const isLoaded = useWeddingRegistryStore((s) => s.isLoaded);
  const segments = useSegments();
  const router = useRouter();
  // (marketing) routes are web-only; on native they should fall through to the app
  const isPublicPage = segments[0] === "wedding" || (Platform.OS === "web" && segments[0] === "(marketing)");

  // /join is handled like /onboarding: it must render even when the user has
  // no wedding yet, because that's exactly when the invite link deep-links in.
  const isOnboardingLike = segments[0] === "onboarding" || segments[0] === "join";

  // Redirect to /onboarding when no wedding — skip on onboarding/join routes.
  useEffect(() => {
    if (!isLoaded || isPublicPage || isOnboardingLike) return;
    if (!registry || registry.weddings.length === 0) {
      router.replace("/onboarding" as any);
    }
  }, [isLoaded, isPublicPage, isOnboardingLike, registry?.weddings.length]);

  // Navigate to /home after onboarding completes. Fired in a useEffect so it runs
  // after (tabs)/_layout re-renders and mounts DatabaseProvider, guaranteeing the
  // DB context is available before home.tsx renders.
  useEffect(() => {
    if (!isLoaded || isPublicPage || segments[0] !== "onboarding") return;
    if (registry?.weddings.length) {
      router.replace("/home" as any);
    }
  }, [isLoaded, isPublicPage, registry?.weddings.length, segments]);

  // Public wedding page — always reachable, no auth required
  if (isPublicPage) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="wedding/[id]" />
        <Stack.Screen name="(marketing)" />
      </Stack>
    );
  }

  // Show spinner only while the store hasn't hydrated yet.
  // Once loaded, always render the Stack so Expo Router can handle the
  // /onboarding redirect properly — calling router.replace() without a mounted
  // Stack races against the initial route resolution on iOS and gets stuck.
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const activeWedding =
    registry?.weddings.find((w) => w.id === registry.activeWeddingId) ??
    registry?.weddings[0] ??
    null;

  return (
    <DatabaseProvider dbFileName={activeWedding?.dbFileName}>
      {activeWedding && <ActiveWeddingRuntime wedding={activeWedding} />}
      <View style={{ flex: 1 }}>
        {activeWedding && <ReadOnlyBanner />}
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="ideas" />
            <Stack.Screen name="wedding/[id]" />
            <Stack.Screen name="wedding-switch" options={{ gestureEnabled: false }} />
          </Stack>
        </View>
        {activeWedding && <OfflineBanner />}
        {activeWedding && <FeatureWelcomeHost />}
      </View>
    </DatabaseProvider>
  );
}

function InnerApp() {
  useTelemetryScreenTracking(analytics);
  // EAS Observe: signal Time to Interactive once the real app content renders.
  // InnerApp mounts only after fonts load + unlock, and every entry screen
  // (public page, onboarding, tabs) renders under it. markInteractive() is
  // idempotent — only the first call per session is recorded.
  const { markInteractive } = useObserve();
  useEffect(() => {
    markInteractive();
  }, [markInteractive]);
  return (
    <>
      <AppContent />
      <Toaster />
    </>
  );
}

const crashFallback = (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text>An unexpected error occurred. Please restart the app.</Text>
  </View>
);

function RootLayout() {
  // On web, fonts are loaded via Google Fonts <link> in +html.tsx — skip TTF bundling
  const [fontsLoaded] = useFonts(
    Platform.OS === "web"
      ? {}
      : {
          Fraunces_300Light,
          Fraunces_400Regular,
          Fraunces_400Regular_Italic,
          Fraunces_500Medium,
          Fraunces_500Medium_Italic,
          Fraunces_600SemiBold,
          Fraunces_600SemiBold_Italic,
          Fraunces_700Bold,
          Caveat_400Regular,
          Caveat_500Medium,
          Caveat_700Bold,
          Inter_400Regular,
          Inter_500Medium,
          Inter_600SemiBold,
          Inter_700Bold,
        }
  );

  const loadRegistry = useWeddingRegistryStore((s) => s.load);
  const loadLanguage = useSettingsStore((s) => s.loadLanguage);
  const loadNotifications = useSettingsStore((s) => s.loadNotifications);
  const loadColorScheme = useSettingsStore((s) => s.loadColorScheme);
  const loadFeatureTrials = useFeatureTrialsStore((s) => s.load);
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const systemScheme = useColorScheme();
  const [locked, setLocked] = useState<boolean | null>(Platform.OS === "web" ? false : null);

  useEffect(() => {
    loadRegistry();
    initAnalytics().catch(console.error);
    loadFeatureTrials();
    Promise.all([loadLanguage(), loadNotifications(), loadColorScheme(), isLockEnabled()]).then(
      ([, , , enabled]) => {
        setLocked(enabled);
      }
    );
  }, []);

  // Sync color scheme: override native Appearance + toggle CSS dark class on web
  useEffect(() => {
    const isDark =
      colorScheme === "dark" ||
      (colorScheme === "system" && systemScheme === "dark");

    if (Platform.OS !== "web") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Appearance.setColorScheme(colorScheme === "system" ? undefined : colorScheme as any);
    }

    if (Platform.OS === "web" && typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", isDark);
    }
  }, [colorScheme, systemScheme]);

  const handleUnlock = useCallback(() => setLocked(false), []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ForgeThemeProvider theme={{ colors: { primary: GP.clay, surface: GP.card } }}>
          <StatusBar style="auto" />
          {!fontsLoaded || locked === null ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator size="large" />
            </View>
          ) : locked ? (
            <LockScreen onUnlock={handleUnlock} />
          ) : (
            <TelemetryProvider client={analytics} fallback={crashFallback}>
              <InnerApp />
            </TelemetryProvider>
          )}
        </ForgeThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

export default ObserveRoot.wrap(RootLayout);
