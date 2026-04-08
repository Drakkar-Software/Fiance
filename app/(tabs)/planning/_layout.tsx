import React from "react";
import { Stack } from "expo-router";

export default function PlanningLayout() {
  return (
    <Stack
      screenOptions={{
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
