import React from "react";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function SettingsLayout() {
  const { t } = useTranslation("settings");
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#FFFFFF" },
        headerTintColor: "#111827",
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Stack.Screen name="index" options={{ title: t("settingsTitle") }} />
      <Stack.Screen name="faq" options={{ title: t("configureFaq") }} />
    </Stack>
  );
}
