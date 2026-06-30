import React from "react";
import { useColorScheme } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useIsWideScreen } from "@/lib/useIsWideScreen";
import { HeaderAddButton } from "@/components/HeaderAddButton";

export default function VendorsLayout() {
  const { t } = useTranslation("vendors");
  const router = useRouter();
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
          headerRight: () => (
            <HeaderAddButton
              accessibilityLabel={t("newVendor")}
              onPress={() => router.push("/(tabs)/vendors/new")}
            />
          ),
        }}
      />
      <Stack.Screen name="new" options={{ title: t("newVendor") }} />
      <Stack.Screen name="[type]/index" options={{ title: t("common:tabs.vendors") }} />
      <Stack.Screen name="[type]/[id]" options={{ title: "" }} />
      <Stack.Screen name="compare" options={{ title: t("compareCaterers") }} />
    </Stack>
  );
}
