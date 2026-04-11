import "../global.css";
import "@/i18n";
import React, { useEffect, useState, useCallback } from "react";
import { AppState, Appearance, Platform, useColorScheme } from "react-native";

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
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Updates from "expo-updates";
import NetInfo from "@react-native-community/netinfo";
import { createMobileLifecycle } from "@drakkar.software/starfish-client";
import { getStarfishStore } from "@/lib/starfish";
import { isLockEnabled } from "@/lib/app-lock";
import { LockScreen } from "@/components/LockScreen";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Toaster } from "@/lib/toast/sonner";

function AppContent() {
  const registry = useWeddingRegistryStore((s) => s.registry);
  const isLoaded = useWeddingRegistryStore((s) => s.isLoaded);
  const segments = useSegments();
  const router = useRouter();
  // (marketing) routes are web-only; on native they should fall through to the app
  const isPublicPage = segments[0] === "wedding" || (Platform.OS === "web" && segments[0] === "(marketing)");

  // Redirect to /onboarding when no wedding — skip if already there to avoid loop
  useEffect(() => {
    if (!isLoaded || isPublicPage || segments[0] === "onboarding") return;
    if (!registry || registry.weddings.length === 0) {
      router.replace("/onboarding" as any);
    }
  }, [isLoaded, isPublicPage, registry?.weddings.length]);

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
  if (!hasWedding && segments[0] !== "onboarding") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Loading WeddingOS...</Text>
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

export default function RootLayout() {
  const loadRegistry = useWeddingRegistryStore((s) => s.load);
  const loadLanguage = useSettingsStore((s) => s.loadLanguage);
  const loadNotifications = useSettingsStore((s) => s.loadNotifications);
  const loadColorScheme = useSettingsStore((s) => s.loadColorScheme);
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const systemScheme = useColorScheme();
  const [locked, setLocked] = useState<boolean | null>(null);

  useEffect(() => {
    loadRegistry();
    Promise.all([loadLanguage(), loadNotifications(), loadColorScheme(), isLockEnabled()]).then(
      ([, , , enabled]) => setLocked(enabled)
    );
  }, []);

  // Sync color scheme: override native Appearance + toggle CSS dark class on web
  useEffect(() => {
    const isDark =
      colorScheme === "dark" ||
      (colorScheme === "system" && systemScheme === "dark");

    if (Platform.OS !== "web") {
      Appearance.setColorScheme(colorScheme === "system" ? null : colorScheme);
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

  useEffect(() => {
    const sf = getStarfishStore();
    if (!sf) return;
    return createMobileLifecycle(sf, { appState: AppState, netInfo: NetInfo });
  }, []);

  const handleUnlock = useCallback(() => setLocked(false), []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ForgeThemeProvider theme={{ colors: { primary: "#EC4899" } }}>
        <BottomSheetModalProvider>
          <StatusBar style="auto" />
          {locked === null ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator size="large" />
            </View>
          ) : locked ? (
            <LockScreen onUnlock={handleUnlock} />
          ) : (
            <>
              <AppContent />
              <Toaster />
            </>
          )}
        </BottomSheetModalProvider>
        </ForgeThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
