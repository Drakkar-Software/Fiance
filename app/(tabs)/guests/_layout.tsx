import React from "react";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function InvitesLayout() {
  const { t } = useTranslation("guests");
  return (
    <Stack
      screenOptions={{
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
