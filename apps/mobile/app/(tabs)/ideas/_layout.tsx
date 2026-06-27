import React from "react";
import { useColorScheme } from "react-native";
import { Stack } from "expo-router";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useIsWideScreen } from "@/lib/useIsWideScreen";

export default function IdeesLayout() {
  const appColorScheme = useSettingsStore((s) => s.colorScheme);
  const systemScheme = useColorScheme();
  const isDark = appColorScheme === "dark" || (appColorScheme === "system" && systemScheme === "dark");
  const isWide = useIsWideScreen();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: isDark ? "#111827" : "#FFFFFF" },
        headerTintColor: isDark ? "#FFFFFF" : "#111827",
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Idées & Déco", headerShown: !isWide }} />
      <Stack.Screen name="[id]" options={{ title: "Idée" }} />
      <Stack.Screen name="collections" options={{ title: "Collections" }} />
    </Stack>
  );
}
