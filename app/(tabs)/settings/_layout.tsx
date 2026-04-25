import React from "react";
import { useColorScheme } from "react-native";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "@/store/useSettingsStore";

export default function SettingsLayout() {
  const { t } = useTranslation("settings");
  const appColorScheme = useSettingsStore((s) => s.colorScheme);
  const systemScheme = useColorScheme();
  const isDark = appColorScheme === "dark" || (appColorScheme === "system" && systemScheme === "dark");
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: isDark ? "#111827" : "#FFFFFF" },
        headerTintColor: isDark ? "#FFFFFF" : "#111827",
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="public-page" options={{ title: "" }} />
      <Stack.Screen name="event-photos" options={{ title: "" }} />
      <Stack.Screen name="faq" options={{ title: "" }} />
      <Stack.Screen name="gifts" options={{ title: "" }} />
      <Stack.Screen name="export-import" options={{ title: t("exportImportTitle") }} />
      <Stack.Screen name="premium" options={{ title: "" }} />
    </Stack>
  );
}
