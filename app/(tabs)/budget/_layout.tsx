import React from "react";
import { Stack } from "expo-router";

export default function BudgetLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Budget" }} />
    </Stack>
  );
}
