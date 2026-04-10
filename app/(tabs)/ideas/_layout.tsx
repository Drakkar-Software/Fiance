import React from "react";
import { useColorScheme } from "react-native";
import { Stack } from "expo-router";

export default function IdeesLayout() {
  const isDark = useColorScheme() === "dark";
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: isDark ? "#111827" : "#FFFFFF" },
        headerTintColor: isDark ? "#FFFFFF" : "#111827",
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Idées & Déco" }} />
      <Stack.Screen name="[id]" options={{ title: "Idée" }} />
      <Stack.Screen name="collections" options={{ title: "Collections" }} />
    </Stack>
  );
}
