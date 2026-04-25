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
import { ForgeThemeProvider } from "@drakkar.software/seahorse/theme";
import { theme as GP } from "@/lib/theme";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Updates from "expo-updates";
import * as Sentry from "@sentry/react-native";

import { isLockEnabled } from "@/lib/app-lock";
import { LockScreen } from "@/components/LockScreen";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Toaster } from "@/lib/toast/sonner";
import { SunglassesProvider, useSunglasses, useExpoRouterScreenTracking } from "@drakkar.software/sunglasses-react-native";
import { SunglassesErrorBoundary, createSentryBeforeSend } from "@drakkar.software/sunglasses-adapter-sentry";
import { initAnalytics, getAnalyticsCore } from "@/lib/analytics";
import type { SunglassesCore } from "@drakkar.software/sunglasses-core";

// Initialize Sentry at module load — before any components render.
// beforeSend lazily accesses the analytics client once it's ready.
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  beforeSend: (event: any, hint: any) => {
    const core = getAnalyticsCore();
    if (!core) return process.env.EXPO_PUBLIC_SENTRY_DSN ? event : null;
    return (createSentryBeforeSend(core, {
      suppressSentrySend: !process.env.EXPO_PUBLIC_SENTRY_DSN,
      maxMessageLength: 200,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any)(event, hint);
  },
});

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
  }, [isLoaded, isPublicPage, registry?.weddings.length]);

  // Public wedding page — always reachable, no auth required
  if (isPublicPage) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="wedding/[id]" />
        <Stack.Screen name="(marketing)" />
      </Stack>
    );
  }

  // Show spinner while loading OR while the /onboarding redirect is in flight.
  // Prevents a one-frame flash of the empty dashboard on first load when there
  // is no wedding yet and the useEffect hasn't fired yet.
  const hasWedding = isLoaded && !!registry?.weddings.length;
  if (!hasWedding && !isOnboardingLike) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Loading Fiancé...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="wedding/[id]" />
    </Stack>
  );
}

function InnerApp() {
  const client = useSunglasses();
  useExpoRouterScreenTracking(client);
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

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
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
  });

  const loadRegistry = useWeddingRegistryStore((s) => s.load);
  const loadLanguage = useSettingsStore((s) => s.loadLanguage);
  const loadNotifications = useSettingsStore((s) => s.loadNotifications);
  const loadColorScheme = useSettingsStore((s) => s.loadColorScheme);
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const systemScheme = useColorScheme();
  const [locked, setLocked] = useState<boolean | null>(null);
  const [analyticsClient, setAnalyticsClient] = useState<SunglassesCore | null>(null);
  const [analyticsReady, setAnalyticsReady] = useState(false);

  useEffect(() => {
    loadRegistry();
    Promise.all([loadLanguage(), loadNotifications(), loadColorScheme(), isLockEnabled(), initAnalytics().catch(() => null)]).then(
      ([, , , enabled, client]) => {
        setLocked(enabled);
        setAnalyticsClient(client);
        setAnalyticsReady(true);
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

  const handleUnlock = useCallback(() => setLocked(false), []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ForgeThemeProvider theme={{ colors: { primary: GP.clay } }}>
        <BottomSheetModalProvider>
          <StatusBar style="auto" />
          {!fontsLoaded || locked === null || !analyticsReady ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator size="large" />
            </View>
          ) : locked ? (
            <LockScreen onUnlock={handleUnlock} />
          ) : analyticsClient ? (
            <SunglassesErrorBoundary client={analyticsClient} fallback={crashFallback}>
              <SunglassesProvider client={analyticsClient}>
                <InnerApp />
              </SunglassesProvider>
            </SunglassesErrorBoundary>
          ) : (
            <><AppContent /><Toaster /></>
          )}
        </BottomSheetModalProvider>
        </ForgeThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
