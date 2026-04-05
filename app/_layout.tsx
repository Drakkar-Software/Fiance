import "../global.css";
import React, { useEffect, useState } from "react";
import { AppState, View, ActivityIndicator, Text, Platform } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Linking from "expo-linking";
import NetInfo from "@react-native-community/netinfo";
import { DatabaseProvider } from "@/db/provider";
import { getStarfishStore } from "@/lib/starfish";
import { parseInviteUrl } from "@/lib/identity";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";
import OnboardingScreen from "./onboarding";

function AppContent() {
  const registry = useWeddingRegistryStore((s) => s.registry);
  const isLoaded = useWeddingRegistryStore((s) => s.isLoaded);
  const [inviteParams, setInviteParams] = useState<{
    name: string;
    password: string;
  } | null>(null);

  // Handle deep links (initial + while app is open)
  useEffect(() => {
    function handleUrl(event: { url: string }) {
      const params = parseInviteUrl(event.url);
      if (params) setInviteParams(params);
    }

    // Check if app was opened via a deep link
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });

    // Listen for deep links while app is running
    const sub = Linking.addEventListener("url", handleUrl);
    return () => sub.remove();
  }, []);

  // Clear invite params once a wedding is created (onboarding completes)
  useEffect(() => {
    if (registry && registry.weddings.length > 0 && inviteParams) {
      setInviteParams(null);
    }
  }, [registry?.weddings.length]);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Loading WeddingOS...</Text>
      </View>
    );
  }

  // No weddings exist → show onboarding (with invite params if present)
  if (!registry || registry.weddings.length === 0) {
    return (
      <OnboardingScreen
        inviteName={inviteParams?.name}
        invitePassword={inviteParams?.password}
      />
    );
  }

  const activeWedding = registry.weddings.find(
    (w) => w.id === registry.activeWeddingId
  ) ?? registry.weddings[0];

  return (
    <DatabaseProvider dbFileName={activeWedding.dbFileName}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </DatabaseProvider>
  );
}

export default function RootLayout() {
  const loadRegistry = useWeddingRegistryStore((s) => s.load);

  useEffect(() => {
    if (Platform.OS !== "web") {
      loadRegistry();
    } else {
      useWeddingRegistryStore.setState({
        isLoaded: true,
        registry: { activeWeddingId: null, weddings: [] },
      });
    }
  }, []);

  useEffect(() => {
    const appSub = AppState.addEventListener("change", (state) => {
      if (state === "background") {
        const sf = getStarfishStore();
        if (sf?.getState().dirty) {
          sf.getState().flush();
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

  return (
    <>
      <StatusBar style="auto" />
      <AppContent />
    </>
  );
}
