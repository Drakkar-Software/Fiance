import React from "react";
import { Stack } from "expo-router";

export default function InvitesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#FFFFFF" },
        headerTintColor: "#111827",
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Invités" }} />
      <Stack.Screen name="[id]" options={{ title: "Invité" }} />
      <Stack.Screen name="tables" options={{ title: "Plan de tables" }} />
    </Stack>
  );
}
