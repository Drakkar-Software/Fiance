import React from "react";
import { useColorScheme } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { BedDouble, Tag } from "lucide-react-native";
import { useSettingsStore } from "@/store/useSettingsStore";
import { StackMenu } from "@/components/StackMenu";

export default function InvitesLayout() {
  const { t } = useTranslation("guests");
  const router = useRouter();
  const appColorScheme = useSettingsStore((s) => s.colorScheme);
  const systemScheme = useColorScheme();
  const isDark = appColorScheme === "dark" || (appColorScheme === "system" && systemScheme === "dark");

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: isDark ? "#111827" : "#FFFFFF" },
        headerTintColor: isDark ? "#FFFFFF" : "#111827",
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: t("guestsScreen"),
          headerRight: () => (
            <StackMenu
              items={[
                {
                  label: t("accommodations"),
                  icon: BedDouble,
                  onPress: () => router.push("/(tabs)/guests/accommodations"),
                },
                {
                  label: t("invitationTypesScreen"),
                  icon: Tag,
                  onPress: () => router.push("/(tabs)/guests/invitation-types"),
                },
              ]}
            />
          ),
        }}
      />
      <Stack.Screen name="[id]" options={{ title: t("guestDetailScreen") }} />
      <Stack.Screen name="tables" options={{ title: t("tablesPlanScreen") }} />
      <Stack.Screen name="accommodations" options={{ title: t("accommodations") }} />
      <Stack.Screen name="invitation-types" options={{ title: t("invitationTypesScreen") }} />
    </Stack>
  );
}
