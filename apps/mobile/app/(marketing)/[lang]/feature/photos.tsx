import React from "react";
import { View, Text, Pressable } from "react-native-css/components";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  QrCode, Lock, Upload, UserX, Server, Download, CheckCircle, XCircle,
} from "lucide-react-native";
import { Seo } from "@/components/Seo";
import { localizedSeo, localizedUrl } from "@/lib/seo-urls";

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

function ComparisonRow({ feature, hasFiance, hasOthers }: { feature: string; hasFiance: boolean; hasOthers: boolean }) {
  return (
    <View className="flex-row items-center py-3 border-b border-accent-rose-light">
      <Text className="flex-1 text-sm text-typography-700">{feature}</Text>
      <View className="w-20 items-center">
        {hasFiance ? (
          <CheckCircle size={18} className="text-accent-sage" />
        ) : (
          <XCircle size={18} className="text-typography-300" />
        )}
      </View>
      <View className="w-20 items-center">
        {hasOthers ? (
          <CheckCircle size={18} className="text-accent-sage" />
        ) : (
          <XCircle size={18} className="text-typography-300" />
        )}
      </View>
    </View>
  );
}

export default function PhotosPage() {
  const { t, i18n } = useTranslation("marketing");
  const router = useRouter();
  const lang = i18n.language === "en" ? "en" : "fr";
  const seo = localizedSeo(lang, "/feature/photos");

  const features = [
    { key: "qrCode", icon: <QrCode size={18} className="text-accent-gold" /> },
    { key: "private", icon: <Lock size={18} className="text-accent-gold" /> },
    { key: "guestUpload", icon: <Upload size={18} className="text-accent-gold" /> },
    { key: "noAccount", icon: <UserX size={18} className="text-accent-gold" /> },
    { key: "noCloud", icon: <Server size={18} className="text-accent-gold" /> },
    { key: "download", icon: <Download size={18} className="text-accent-gold" /> },
  ] as const;

  const comparisonFeatures = t("photos.comparison.features", { returnObjects: true }) as string[];

  return (
    <View className="w-full">
      <Seo
        title={t("photos.meta.title")}
        description={t("photos.meta.description")}
        {...seo}
        jsonLd={[
          { "@type": "BreadcrumbList", itemListElement: [
            { "@type": "ListItem", position: 1, name: "Fiancé", item: localizedUrl(lang, "/") },
            { "@type": "ListItem", position: 2, name: t("photos.meta.title"), item: seo.canonical },
          ]},
        ]}
      />
      {/* Hero */}
      <View className="w-full py-20 px-6 bg-accent-cream items-center">
        <View style={{ maxWidth: 700, width: "100%", alignItems: "center" }}>
          <Text
            className="text-typography-900 font-bold text-center mb-4"
            style={{ fontSize: 40, lineHeight: 48 }}
          >
            {t("photos.hero.headline")}
          </Text>
          <Text className="text-lg text-typography-500 text-center mb-8 leading-7">
            {t("photos.hero.subheadline")}
          </Text>
          <Pressable
            onPress={() => router.push("/home" as any)}
            className="bg-primary-500 px-8 py-4 rounded-full active:opacity-70"
          >
            <Text className="text-base font-semibold text-white">{t("photos.hero.ctaPrimary")}</Text>
          </Pressable>
        </View>
      </View>

      {/* Features */}
      <View className="w-full py-16 px-6 bg-white">
        <View style={{ maxWidth: 800, width: "100%", alignSelf: "center" }}>
          <Text className="text-2xl font-bold text-typography-900 mb-8">
            {t("photos.features.title")}
          </Text>
          <View>
            {features.map((f) => (
              <FeatureRow
                key={f.key}
                icon={f.icon}
                title={t(`photos.features.${f.key}.title`)}
                description={t(`photos.features.${f.key}.description`)}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Comparison table */}
      <View className="w-full py-16 px-6 bg-accent-cream">
        <View style={{ maxWidth: 700, width: "100%", alignSelf: "center" }}>
          <Text className="text-2xl font-bold text-typography-900 mb-8">
            {t("photos.comparison.title")}
          </Text>
          {/* Header */}
          <View className="flex-row items-center pb-3 border-b-2 border-typography-200 mb-1">
            <Text className="flex-1 text-xs font-semibold text-typography-400 uppercase tracking-widest" />
            <Text className="w-20 text-center text-sm font-semibold text-primary-500">
              {t("photos.comparison.fiance")}
            </Text>
            <Text className="w-20 text-center text-sm font-semibold text-typography-400">
              {t("photos.comparison.others")}
            </Text>
          </View>
          {comparisonFeatures.map((feature, i) => (
            <ComparisonRow
              key={i}
              feature={feature}
              hasFiance={true}
              hasOthers={i >= 2}
            />
          ))}
        </View>
      </View>

      {/* App CTA */}
      <View className="w-full py-16 px-6 bg-typography-900 items-center">
        <View style={{ maxWidth: 600, width: "100%", alignItems: "center" }}>
          <Text className="text-2xl font-bold text-white text-center mb-3">
            {t("photos.appCta.title")}
          </Text>
          <Text className="text-base text-typography-400 text-center mb-6">
            {t("photos.appCta.description")}
          </Text>
          <Pressable
            onPress={() => router.push("/home" as any)}
            className="bg-primary-500 px-8 py-4 rounded-full active:opacity-70"
          >
            <Text className="text-base font-semibold text-white">{t("photos.appCta.cta")}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
