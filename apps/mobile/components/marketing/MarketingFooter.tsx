import React from "react";
import { Image } from "react-native";
import { View, Text } from "react-native-css/components";
import { useTranslation } from "react-i18next";
import { MarketingLink } from "@/components/marketing/MarketingLink";
import { localizedPath, type MarketingLang } from "@/lib/seo-urls";

export function MarketingFooter() {
  const { t, i18n } = useTranslation("marketing");
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
            <MarketingLink
              href={localizedPath(lang, "/") as any}
              title={t("nav.homeTitle")}
              className="flex flex-row items-center gap-2 mb-2 active:opacity-70"
            >
              <Image
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                source={require("@/assets/icon-192.png")}
                style={{ width: 24, height: 24, borderRadius: 5 }}
                resizeMode="cover"
                accessibilityLabel={t("footer.logoAlt")}
                alt={t("footer.logoAlt")}
              />
              <Text className="text-lg font-bold text-white">Fiancé</Text>
            </MarketingLink>
            <Text className="text-sm text-typography-400 leading-5 mb-3">{t("footer.tagline")}</Text>
            <View className="flex-row flex-wrap gap-2">
              <Text className="text-xs font-semibold tracking-widest text-accent-gold border border-accent-gold rounded-full px-2.5 py-1">
                {t("footer.badges.offline")}
              </Text>
              <Text className="text-xs font-semibold tracking-widest text-accent-sage border border-accent-sage rounded-full px-2.5 py-1">
                {t("footer.badges.private")}
              </Text>
            </View>
          </View>

          {/* Features */}
          <View style={{ minWidth: 160 }}>
            <Text className="text-xs font-semibold text-typography-400 uppercase tracking-widest mb-3">
              {t("footer.features")}
            </Text>
            <View className="gap-2">
              {featureLinks.map((link) => (
                <MarketingLink
                  key={link.href}
                  href={link.href as any}
                  title={link.label}
                  className="active:opacity-60"
                >
                  <Text className="text-sm text-typography-300">{link.label}</Text>
                </MarketingLink>
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
                <MarketingLink
                  key={link.href}
                  href={link.href as any}
                  title={link.label}
                  className="active:opacity-60"
                >
                  <Text className="text-sm text-typography-300">{link.label}</Text>
                </MarketingLink>
              ))}
            </View>
          </View>

          {/* Le Carnet / Journal */}
          <View style={{ minWidth: 140 }}>
            <Text className="text-xs font-semibold text-typography-400 uppercase tracking-widest mb-3">
              {t("footer.blog")}
            </Text>
            <View className="gap-2">
              <MarketingLink
                href={localizedPath(lang, "/blog") as any}
                title={t("nav.blog")}
                className="active:opacity-60"
              >
                <Text className="text-sm text-typography-300">{t("nav.blog")}</Text>
              </MarketingLink>
            </View>
          </View>

          {/* Legal */}
          <View style={{ minWidth: 160 }}>
            <Text className="text-xs font-semibold text-typography-400 uppercase tracking-widest mb-3">
              {t("footer.legal")}
            </Text>
            <View className="gap-2">
              <MarketingLink
                href={localizedPath(lang, "/terms") as any}
                title={t("legal.termsLink")}
                className="active:opacity-60"
              >
                <Text className="text-sm text-typography-300">{t("legal.termsLink")}</Text>
              </MarketingLink>
              <MarketingLink
                href={localizedPath(lang, "/privacy") as any}
                title={t("legal.privacyLink")}
                className="active:opacity-60"
              >
                <Text className="text-sm text-typography-300">{t("legal.privacyLink")}</Text>
              </MarketingLink>
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
