import React from "react";
import { View, Text } from "react-native-css/components";
import { useTranslation } from "react-i18next";
import {
  Move, Square, Users, Download, FileText, RefreshCw,
} from "lucide-react-native";
import { Display } from "@/components/Display";
import { MarketingLink } from "@/components/marketing/MarketingLink";
import { Seo } from "@/components/Seo";
import { localizedSeo, localizedUrl, localizedPath } from "@/lib/seo-urls";

function FeatureRow({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <View className="flex-row gap-4 py-4 border-b border-accent-rose-light">
      <View className="w-10 h-10 rounded-xl bg-accent-blush items-center justify-center shrink-0">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-typography-900 mb-0.5">{title}</Text>
        <Text className="text-sm text-typography-500 leading-5">{description}</Text>
      </View>
    </View>
  );
}

export default function SeatingChartPage() {
  const { t, i18n } = useTranslation("marketing");
  const lang = i18n.language === "en" ? "en" : "fr";
  const seo = localizedSeo(lang, "/feature/seating-chart");

  const features = [
    { key: "dragDrop", icon: <Move size={18} className="text-accent-gold" /> },
    { key: "shapes", icon: <Square size={18} className="text-accent-gold" /> },
    { key: "capacity", icon: <Users size={18} className="text-accent-gold" /> },
    { key: "groups", icon: <Users size={18} className="text-accent-gold" /> },
    { key: "export", icon: <Download size={18} className="text-accent-gold" /> },
    { key: "realtime", icon: <RefreshCw size={18} className="text-accent-gold" /> },
  ] as const;

  return (
    <View className="w-full">
      <Seo
        title={t("seatingChart.meta.title")}
        description={t("seatingChart.meta.description")}
        {...seo}
        jsonLd={[
          { "@type": "BreadcrumbList", itemListElement: [
            { "@type": "ListItem", position: 1, name: "Fiancé", item: localizedUrl(lang, "/") },
            { "@type": "ListItem", position: 2, name: t("seatingChart.meta.title"), item: seo.canonical },
          ]},
        ]}
      />
      <View className="w-full py-20 px-6 bg-accent-cream items-center">
        <View style={{ maxWidth: 700, width: "100%", alignItems: "center" }}>
          <Display as="h1" size={40} weight="700" style={{ textAlign: "center", marginBottom: 16, lineHeight: 48 }}>
            {t("seatingChart.hero.headline")}
          </Display>
          <Text className="text-lg text-typography-500 text-center mb-8 leading-7">
            {t("seatingChart.hero.subheadline")}
          </Text>
          <View className="flex-row gap-3 flex-wrap justify-center">
            <MarketingLink
              href={localizedPath(lang, "/tools/seating-chart") as any}
              title={t("seatingChart.hero.ctaPrimary")}
              className="bg-primary-500 px-8 py-4 rounded-full active:opacity-70"
            >
              <Text className="text-base font-semibold text-white">{t("seatingChart.hero.ctaPrimary")}</Text>
            </MarketingLink>
            <MarketingLink href="/home" title={t("seatingChart.hero.ctaSecondary")} className="border border-primary-300 px-8 py-4 rounded-full active:opacity-70">
              <Text className="text-base font-semibold text-primary-500">{t("seatingChart.hero.ctaSecondary")}</Text>
            </MarketingLink>
          </View>
        </View>
      </View>

      <View className="w-full py-16 px-6 bg-white">
        <View style={{ maxWidth: 800, width: "100%", alignSelf: "center" }}>
          <Display as="h2" size={28} weight="600" style={{ marginBottom: 32 }}>
            {t("seatingChart.features.title")}
          </Display>
          <View>
            {features.map((f) => (
              <FeatureRow
                key={f.key}
                icon={f.icon}
                title={t(`seatingChart.features.${f.key}.title`)}
                description={t(`seatingChart.features.${f.key}.description`)}
              />
            ))}
          </View>
        </View>
      </View>

      <View className="w-full py-16 px-6 bg-accent-blush items-center">
        <View style={{ maxWidth: 600, width: "100%", alignItems: "center" }}>
          <FileText size={32} className="text-primary-500 mb-4" />
          <Display as="h2" size={28} weight="600" style={{ textAlign: "center", marginBottom: 12 }}>
            {t("seatingChart.toolCta.title")}
          </Display>
          <Text className="text-base text-typography-500 text-center mb-6">
            {t("seatingChart.toolCta.description")}
          </Text>
          <MarketingLink
            href={localizedPath(lang, "/tools/seating-chart") as any}
            title={t("seatingChart.toolCta.cta")}
            className="bg-primary-500 px-8 py-4 rounded-full active:opacity-70"
          >
            <Text className="text-base font-semibold text-white">{t("seatingChart.toolCta.cta")}</Text>
          </MarketingLink>
        </View>
      </View>

      <View className="w-full py-16 px-6 bg-typography-900 items-center">
        <View style={{ maxWidth: 600, width: "100%", alignItems: "center" }}>
          <Display as="h2" size={28} weight="600" color="#ffffff" style={{ textAlign: "center", marginBottom: 12 }}>
            {t("seatingChart.appCta.title")}
          </Display>
          <Text className="text-base text-typography-400 text-center mb-6">
            {t("seatingChart.appCta.description")}
          </Text>
          <MarketingLink href="/home" title={t("seatingChart.appCta.cta")} className="bg-primary-500 px-8 py-4 rounded-full active:opacity-70">
            <Text className="text-base font-semibold text-white">{t("seatingChart.appCta.cta")}</Text>
          </MarketingLink>
        </View>
      </View>
    </View>
  );
}
