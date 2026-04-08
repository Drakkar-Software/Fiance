import React from "react";
import { Stack } from "expo-router";

export default function IdeesLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Idées & Déco" }} />
      <Stack.Screen name="[id]" options={{ title: "Idée" }} />
      <Stack.Screen name="collections" options={{ title: "Collections" }} />
    </Stack>
  );
}
