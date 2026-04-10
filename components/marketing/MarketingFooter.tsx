import React from "react";
import { View, Text, Pressable } from "react-native-css/components";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

export function MarketingFooter() {
  const { t } = useTranslation("marketing");
  const router = useRouter();

  const featureLinks = [
    { label: t("nav.seatingChart"), href: "/seating-chart" },
    { label: t("nav.budget"), href: "/budget" },
    { label: t("nav.photos"), href: "/photos" },
  ];

  const toolLinks = [
    { label: t("nav.toolsSeatingChart"), href: "/tools/seating-chart" },
    { label: t("nav.toolsBudget"), href: "/tools/budget-calculator" },
    { label: t("nav.toolsTimeline"), href: "/tools/timeline" },
  ];

  return (
    <View className="w-full bg-typography-900 py-12 px-6">
      <View
        className="gap-8"
        style={{ maxWidth: 1100, alignSelf: "center", width: "100%" }}
      >
        {/* Top row */}
        <View className="flex-row flex-wrap gap-10">
          {/* Brand */}
          <View className="flex-1" style={{ minWidth: 200 }}>
            <Text className="text-lg font-bold text-white mb-2">WeddingOS</Text>
            <Text className="text-sm text-typography-400 leading-5">{t("footer.tagline")}</Text>
          </View>

          {/* Features */}
          <View style={{ minWidth: 160 }}>
            <Text className="text-xs font-semibold text-typography-400 uppercase tracking-widest mb-3">
              {t("footer.features")}
            </Text>
            <View className="gap-2">
              {featureLinks.map((link) => (
                <Pressable key={link.href} onPress={() => router.push(link.href as any)} className="active:opacity-60">
                  <Text className="text-sm text-typography-300">{link.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Tools */}
          <View style={{ minWidth: 180 }}>
            <Text className="text-xs font-semibold text-typography-400 uppercase tracking-widest mb-3">
              {t("footer.tools")}
            </Text>
            <View className="gap-2">
              {toolLinks.map((link) => (
                <Pressable key={link.href} onPress={() => router.push(link.href as any)} className="active:opacity-60">
                  <Text className="text-sm text-typography-300">{link.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Divider */}
        <View className="h-px bg-typography-700" />

        {/* Bottom row */}
        <View className="flex-row flex-wrap items-center justify-between gap-4">
          <Text className="text-xs text-typography-500">{t("footer.madeWith")}</Text>
          <Text className="text-xs text-typography-500">© {new Date().getFullYear()} WeddingOS</Text>
        </View>
      </View>
    </View>
  );
}
