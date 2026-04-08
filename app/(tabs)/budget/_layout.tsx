import React from "react";
import { useColorScheme } from "react-native";
import { Stack } from "expo-router";

export default function BudgetLayout() {
  const isDark = useColorScheme() === "dark";
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: isDark ? "#111827" : "#FFFFFF" },
        headerTintColor: isDark ? "#F9FAFB" : "#111827",
        headerTitleStyle: { fontWeight: "600", color: isDark ? "#F9FAFB" : "#111827" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Budget" }} />
    </Stack>
  );
}
