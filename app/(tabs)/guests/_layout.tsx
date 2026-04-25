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
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ title: "" }} />
      <Stack.Screen name="tables" options={{ title: "" }} />
      <Stack.Screen name="accommodations" options={{ title: "" }} />
      <Stack.Screen name="invitation-types" options={{ title: t("invitationTypesScreen") }} />
      <Stack.Screen name="seating" options={{ headerShown: false }} />
    </Stack>
  );
}
