import React from "react";
import { Image } from "react-native";
import { View, Text, Pressable } from "react-native-css/components";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { localizedPath, type MarketingLang } from "@/lib/seo-urls";

export function MarketingFooter() {
  const { t, i18n } = useTranslation("marketing");
  const router = useRouter();
  const lang: MarketingLang = i18n.language === "en" ? "en" : "fr";

  const featureLinks = [
    { label: t("nav.seatingChart"), href: localizedPath(lang, "/feature/seating-chart") },
    { label: t("nav.budget"), href: localizedPath(lang, "/feature/budget") },
    { label: t("nav.photos"), href: localizedPath(lang, "/feature/photos") },
  ];

  const toolLinks = [
    { label: t("nav.toolsSeatingChart"), href: localizedPath(lang, "/tools/seating-chart") },
    { label: t("nav.toolsBudget"), href: localizedPath(lang, "/tools/budget-calculator") },
    { label: t("nav.toolsTimeline"), href: localizedPath(lang, "/tools/timeline") },
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
            <View className="flex-row items-center gap-2 mb-2">
              <Image
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                source={require("@/assets/icon-192.png")}
                style={{ width: 24, height: 24, borderRadius: 5 }}
                accessible={false}
              />
              <Text className="text-lg font-bold text-white">Fiancé</Text>
            </View>
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

          {/* Le Carnet / Journal */}
          <View style={{ minWidth: 140 }}>
            <Text className="text-xs font-semibold text-typography-400 uppercase tracking-widest mb-3">
              {t("footer.blog")}
            </Text>
            <View className="gap-2">
              <Pressable onPress={() => router.push(localizedPath(lang, "/blog") as any)} className="active:opacity-60">
                <Text className="text-sm text-typography-300">{t("nav.blog")}</Text>
              </Pressable>
            </View>
          </View>

          {/* Legal */}
          <View style={{ minWidth: 160 }}>
            <Text className="text-xs font-semibold text-typography-400 uppercase tracking-widest mb-3">
              {t("footer.legal")}
            </Text>
            <View className="gap-2">
              <Pressable onPress={() => router.push(localizedPath(lang, "/terms") as any)} className="active:opacity-60">
                <Text className="text-sm text-typography-300">{t("legal.termsLink")}</Text>
              </Pressable>
              <Pressable onPress={() => router.push(localizedPath(lang, "/privacy") as any)} className="active:opacity-60">
                <Text className="text-sm text-typography-300">{t("legal.privacyLink")}</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View className="h-px bg-typography-700" />

        {/* Bottom row */}
        <View className="flex-row flex-wrap items-center justify-between gap-4">
          <Text className="text-xs text-typography-500">{t("footer.madeWith")}</Text>
          <Text className="text-xs text-typography-500">© {new Date().getFullYear()} Fiancé</Text>
        </View>
      </View>
    </View>
  );
}
