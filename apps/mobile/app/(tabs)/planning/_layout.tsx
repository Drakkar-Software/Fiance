import React from "react";
import { useColorScheme } from "react-native";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useIsWideScreen } from "@/lib/useIsWideScreen";

export default function PlanningLayout() {
  const { t } = useTranslation("planning");
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
      <Stack.Screen
        name="index"
        options={{
          title: "",
          headerShown: !isWide,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: isDark ? "#1a1510" : "#f2ece0" },
        }}
      />
      <Stack.Screen
        name="agenda"
        options={{
          title: "",
          headerShown: !isWide,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: isDark ? "#1a1510" : "#f2ece0" },
        }}
      />
      <Stack.Screen
        name="day-of"
        options={{
          title: "",
          headerShown: !isWide,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: isDark ? "#1a1510" : "#f2ece0" },
        }}
      />
      <Stack.Screen name="[id]" options={{ title: "Tâche" }} />
      <Stack.Screen name="categories" options={{ title: "Catégories" }} />
      <Stack.Screen name="agenda-event" options={{ title: "Rendez-vous" }} />
      <Stack.Screen name="day-of-item" options={{ title: "Jour J" }} />
      <Stack.Screen name="events" options={{ title: t("events.title") }} />
      <Stack.Screen name="legal" options={{ title: t("legal.title") }} />
      <Stack.Screen name="honeymoon" options={{ title: t("honeymoon.title") }} />
    </Stack>
  );
}
