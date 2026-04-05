import "../global.css";
import React, { useEffect } from "react";
import { AppState } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import NetInfo from "@react-native-community/netinfo";
import { DatabaseProvider } from "@/db/provider";
import { getStarfishStore } from "@/lib/starfish";

export default function RootLayout() {
  useEffect(() => {
    // Flush dirty data when app goes to background
    const appSub = AppState.addEventListener("change", (state) => {
      if (state === "background") {
        const sf = getStarfishStore();
        if (sf?.getState().dirty) {
          sf.getState().flush();
        }
      }
    });

    // Track network connectivity → Starfish setOnline
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
    <DatabaseProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </DatabaseProvider>
  );
}
