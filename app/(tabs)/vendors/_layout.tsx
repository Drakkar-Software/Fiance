import React from "react";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function VendorsLayout() {
  const { t } = useTranslation("vendors");
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#FFFFFF" },
        headerTintColor: "#111827",
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: t("vendors:types.OTHER").replace(/.*/, t("common:tabs.vendors")) }}
      />
      <Stack.Screen
        name="new"
        options={{ title: t("newVendor") }}
      />
      <Stack.Screen
        name="[type]/index"
        options={{ title: t("common:tabs.vendors") }}
      />
      <Stack.Screen
        name="[type]/[id]"
        options={{ title: "" }}
      />
      <Stack.Screen
        name="compare"
        options={{ title: t("compareCaterers") }}
      />
    </Stack>
  );
}
