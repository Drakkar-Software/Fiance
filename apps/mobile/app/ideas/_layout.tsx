import React from "react";
import { Pressable, useColorScheme } from "react-native";
import { Stack, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useSettingsStore } from "@/store/useSettingsStore";
import { DesktopShell } from "@/components/DesktopShell";
export default function IdeesLayout() {
  const router = useRouter();
  const appColorScheme = useSettingsStore((s) => s.colorScheme);
  const systemScheme = useColorScheme();
  const isDark = appColorScheme === "dark" || (appColorScheme === "system" && systemScheme === "dark");
  const tintColor = isDark ? "#FFFFFF" : "#111827";
  return (
    <DesktopShell>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: isDark ? "#111827" : "#FFFFFF" },
          headerTintColor: tintColor,
          headerTitleStyle: { fontWeight: "600" },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Idées & Déco",
            headerShown: true,
            headerLeft: () => (
              <Pressable onPress={() => router.back()} style={{ padding: 4, marginLeft: -4 }}>
                <ChevronLeft size={24} color={tintColor} />
              </Pressable>
            ),
          }}
        />
        <Stack.Screen name="[id]" options={{ title: "Idée" }} />
        <Stack.Screen name="collections" options={{ title: "Collections" }} />
      </Stack>
    </DesktopShell>
  );
}
