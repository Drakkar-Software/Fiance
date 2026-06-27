import React from "react";
import { useColorScheme } from "react-native";
import { Stack } from "expo-router";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useIsWideScreen } from "@/lib/useIsWideScreen";

export default function PlanningLayout() {
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
      <Stack.Screen name="index" options={{ title: "Planning", headerShown: !isWide }} />
      <Stack.Screen name="[id]" options={{ title: "Tâche" }} />
      <Stack.Screen name="categories" options={{ title: "Catégories" }} />
      <Stack.Screen name="agenda-event" options={{ title: "Rendez-vous" }} />
      <Stack.Screen name="day-of-item" options={{ title: "Jour J" }} />
    </Stack>
  );
}
