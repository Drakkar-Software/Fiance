import React from "react";
import { useColorScheme } from "react-native";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "@/store/useSettingsStore";

export default function InvitesLayout() {
  const { t } = useTranslation("guests");
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
      <Stack.Screen name="index" options={{ title: t("guestsScreen") }} />
      <Stack.Screen name="[id]" options={{ title: t("guestDetailScreen") }} />
      <Stack.Screen name="tables" options={{ title: t("tablesPlanScreen") }} />
      <Stack.Screen name="accommodations" options={{ title: t("accommodations") }} />
    </Stack>
  );
}
