import React from "react";
import { Stack } from "expo-router";

export default function PrestatairesLayout() {
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
        options={{ title: "Prestataires" }}
      />
      <Stack.Screen
        name="new"
        options={{ title: "Nouveau prestataire" }}
      />
      <Stack.Screen
        name="[type]/index"
        options={{ title: "Prestataires" }}
      />
      <Stack.Screen
        name="[type]/[id]"
        options={{ title: "Détail" }}
      />
      <Stack.Screen
        name="compare"
        options={{ title: "Comparateur traiteurs" }}
      />
    </Stack>
  );
}
