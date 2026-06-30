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
      <Stack.Screen name="index" options={{ title: t("settingsTitle"), headerShown: true }} />
      <Stack.Screen name="public-page" options={{ title: t("publicPageTitle") }} />
      <Stack.Screen name="event-photos" options={{ title: t("eventPhotosTitle") }} />
      <Stack.Screen name="faq" options={{ title: t("configureFaq") }} />
      <Stack.Screen name="gifts" options={{ title: t("giftRegistry") }} />
      <Stack.Screen name="export-import" options={{ title: t("exportImportTitle") }} />
      <Stack.Screen name="premium" options={{ title: t("premiumTitle") }} />
    </Stack>
  );
}
