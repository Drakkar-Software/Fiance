import React from "react";
import { useColorScheme } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useVendorsStore } from "@/store/useVendorsStore";
import { useCanAddMore, FREE_LIMITS } from "@/lib/limits";
import { useShowPaywall } from "@/components/PaywallProvider";
import { toast } from "@/lib/toast/sonner";
import { useIsWideScreen } from "@/lib/useIsWideScreen";
import { HeaderAddButton } from "@/components/HeaderAddButton";

export default function VendorsLayout() {
  const { t } = useTranslation("vendors");
  const router = useRouter();
  const appColorScheme = useSettingsStore((s) => s.colorScheme);
  const systemScheme = useColorScheme();
  const isDark = appColorScheme === "dark" || (appColorScheme === "system" && systemScheme === "dark");
  const isWide = useIsWideScreen();
  const vendorCount = useVendorsStore((s) => s.vendors.length);
  const canAddVendor = useCanAddMore("vendors", vendorCount);
  const { openPaywall } = useShowPaywall();
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
            <HeaderAddButton
              accessibilityLabel={t("newVendor")}
              locked={!canAddVendor}
              onPress={() => {
                if (!canAddVendor) {
                  const msg = t("common:premiumLimits.vendors", { limit: FREE_LIMITS.vendors });
                  toast.error(msg);
                  openPaywall(msg);
                  return;
                }
                router.push("/(tabs)/vendors/new");
              }}
            />
          ),
        }}
      />
      <Stack.Screen name="new" options={{ title: t("newVendor") }} />
      <Stack.Screen name="[type]/index" options={{ title: t("common:tabs.vendors") }} />
      <Stack.Screen name="[type]/[id]" options={{ title: "" }} />
      <Stack.Screen name="compare" options={{ title: t("compareCaterers") }} />
    </Stack>
  );
}
