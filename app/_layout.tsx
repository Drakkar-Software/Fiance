import "../global.css";
import React, { useEffect, useState } from "react";
import { AppState, View, ActivityIndicator, Text } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Linking from "expo-linking";
import NetInfo from "@react-native-community/netinfo";
import { DatabaseProvider } from "@/db/provider";
import { getStarfishStore, initStarfish } from "@/lib/starfish";
import { parseInviteUrl, deriveAuthToken, deriveEncryptionKey } from "@/lib/identity";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";
import OnboardingScreen from "./onboarding";

function AppContent() {
  const registry = useWeddingRegistryStore((s) => s.registry);
  const isLoaded = useWeddingRegistryStore((s) => s.isLoaded);
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

  // Auto-enable sync if the wedding has a server URL and seed phrase
  useEffect(() => {
    if (!activeWedding) return;
    const { serverUrl, seedPhrase, id } = activeWedding;
    if (!serverUrl || !seedPhrase || getStarfishStore()) return;

    (async () => {
      const authToken = await deriveAuthToken(seedPhrase);
      const userId = authToken.slice(0, 16);
      const encryptionKey = await deriveEncryptionKey(seedPhrase, userId);
      const sf = initStarfish({
        serverUrl,
        authToken,
        userId,
        encryptionKey,
      });
      sf.getState().pull().catch(console.error);
    })();
  }, [activeWedding?.id]);

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
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </DatabaseProvider>
  );
}

export default function RootLayout() {
  const loadRegistry = useWeddingRegistryStore((s) => s.load);

  useEffect(() => {
    loadRegistry();
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
