import React from "react";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function SettingsLayout() {
  const { t } = useTranslation("settings");
  return (
    <Stack
      screenOptions={{
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Stack.Screen name="index" options={{ title: t("settingsTitle") }} />
      <Stack.Screen name="public-page" options={{ title: t("publicPageTitle") }} />
      <Stack.Screen name="event-photos" options={{ title: t("eventPhotosTitle") }} />
      <Stack.Screen name="faq" options={{ title: t("configureFaq") }} />
      <Stack.Screen name="gifts" options={{ title: t("giftRegistry") }} />
      <Stack.Screen name="export-import" options={{ title: t("exportImportTitle") }} />
    </Stack>
  );
}
