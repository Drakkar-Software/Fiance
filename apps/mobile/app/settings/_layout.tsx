import React from "react";
import { Pressable, useColorScheme } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ChevronLeft } from "lucide-react-native";
import { useSettingsStore } from "@/store/useSettingsStore";
import { DesktopShell } from "@/components/DesktopShell";
export default function SettingsLayout() {
  const { t } = useTranslation("settings");
  const router = useRouter();
  const appColorScheme = useSettingsStore((s) => s.colorScheme);
  const systemScheme = useColorScheme();
  const isDark = appColorScheme === "dark" || (appColorScheme === "system" && systemScheme === "dark");
  const tintColor = isDark ? "#FFFFFF" : "#111827";
  return (
    <DesktopShell>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: isDark ? "#111827" : "#FFFFFF" },
          headerTintColor: tintColor,
          headerTitleStyle: { fontWeight: "600" },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: t("settingsTitle"),
            headerShown: true,
            headerLeft: () => (
              <Pressable onPress={() => router.back()} style={{ padding: 4, marginLeft: -4 }}>
                <ChevronLeft size={24} color={tintColor} />
              </Pressable>
            ),
          }}
        />
        <Stack.Screen name="public-page" options={{ title: t("publicPageTitle") }} />
        <Stack.Screen name="event-photos" options={{ title: t("eventPhotosTitle") }} />
        <Stack.Screen name="faq" options={{ title: t("configureFaq") }} />
        <Stack.Screen name="gifts" options={{ title: t("giftRegistry") }} />
        <Stack.Screen name="export-import" options={{ title: t("exportImportTitle") }} />
        <Stack.Screen name="premium" options={{ title: t("premiumTitle") }} />
      </Stack>
    </DesktopShell>
  );
}
