import React from "react";
import { useColorScheme } from "react-native";
import { View } from "react-native-css/components";
import { Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { BedDouble, Tag, Mail } from "lucide-react-native";
import { useSettingsStore } from "@/store/useSettingsStore";
import { StackMenu } from "@/components/StackMenu";
import { HeaderAddButton } from "@/components/HeaderAddButton";
import { useIsWideScreen } from "@/lib/useIsWideScreen";

export default function InvitesLayout() {
  const { t } = useTranslation("guests");
  const router = useRouter();
  const appColorScheme = useSettingsStore((s) => s.colorScheme);
  const systemScheme = useColorScheme();
  const isDark = appColorScheme === "dark" || (appColorScheme === "system" && systemScheme === "dark");
  const isWide = useIsWideScreen();

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
          title: "",
          headerShown: !isWide,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: isDark ? "#1a1510" : "#f2ece0" },
          headerRight: () => (
            <View className="flex-row items-center">
              <HeaderAddButton
                accessibilityLabel={t("addGuest")}
                onPress={() =>
                  router.push({ pathname: "/(tabs)/guests/[id]", params: { id: "new" } })
                }
              />
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
                  {
                    label: t("communicationsScreen"),
                    icon: Mail,
                    onPress: () => router.push("/(tabs)/guests/communications"),
                  },
                ]}
              />
            </View>
          ),
        }}
      />
      <Stack.Screen name="[id]" options={{ title: t("guestDetailScreen") }} />
      <Stack.Screen name="tables" options={{ title: t("tablesPlanScreen") }} />
      <Stack.Screen name="accommodations" options={{ title: t("accommodations") }} />
      <Stack.Screen name="invitation-types" options={{ title: t("invitationTypesScreen") }} />
      <Stack.Screen name="communications" options={{ title: t("communicationsScreen") }} />
      <Stack.Screen
        name="communication/[id]"
        options={({ route }) => ({
          title: (route.params as any)?.title ?? t("communicationRosterScreen"),
        })}
      />
      <Stack.Screen name="seating" options={{ headerShown: false }} />
    </Stack>
  );
}
