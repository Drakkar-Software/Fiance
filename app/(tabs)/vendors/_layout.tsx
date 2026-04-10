import React from "react";
import { useColorScheme } from "react-native";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "@/store/useSettingsStore";

export default function VendorsLayout() {
  const { t } = useTranslation("vendors");
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
      <Stack.Screen
        name="index"
        options={{ title: t("vendors:types.OTHER").replace(/.*/, t("common:tabs.vendors")) }}
      />
      <Stack.Screen name="new" options={{ title: t("newVendor") }} />
      <Stack.Screen name="[type]/index" options={{ title: t("common:tabs.vendors") }} />
      <Stack.Screen name="[type]/[id]" options={{ title: "" }} />
      <Stack.Screen name="compare" options={{ title: t("compareCaterers") }} />
    </Stack>
  );
}
