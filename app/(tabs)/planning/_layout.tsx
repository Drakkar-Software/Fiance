import React from "react";
import { useColorScheme } from "react-native";
import { Stack } from "expo-router";

export default function PlanningLayout() {
  const isDark = useColorScheme() === "dark";
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: isDark ? "#111827" : "#FFFFFF" },
        headerTintColor: isDark ? "#FFFFFF" : "#111827",
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Planning" }} />
      <Stack.Screen name="[id]" options={{ title: "Tâche" }} />
      <Stack.Screen name="categories" options={{ title: "Catégories" }} />
      <Stack.Screen name="agenda-event" options={{ title: "Rendez-vous" }} />
      <Stack.Screen name="day-of-item" options={{ title: "Jour J" }} />
    </Stack>
  );
}
