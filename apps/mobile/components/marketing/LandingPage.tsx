import React from "react";
import { View, Text, Pressable } from "react-native-css/components";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  DollarSign, Users, LayoutGrid, Store, CalendarCheck,
  Camera, Globe, WifiOff, Lock, ShieldCheck, HeartHandshake,
} from "lucide-react-native";
import { usePageMeta } from "@/lib/use-page-meta";
import { Display } from "@/components/Display";
import { Script } from "@/components/Script";

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <View
      className="bg-accent-card rounded-2xl p-5 border border-accent-rose-light"
      style={{ flex: 1, minWidth: 260 }}
    >
      <View className="mb-3 w-10 h-10 rounded-xl bg-accent-blush items-center justify-center">
        {icon}
      </View>
      <Text className="text-base font-semibold text-typography-900 mb-1">{title}</Text>
      <Text className="text-sm text-typography-500 leading-5">{description}</Text>
    </View>
  );
}

function PrivacyCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <View
      className="bg-typography-800 rounded-2xl p-5"
      style={{ flex: 1, minWidth: 220 }}
    >
      <View className="mb-3">{icon}</View>
      <Text className="text-base font-semibold text-white mb-1">{title}</Text>
      <Text className="text-sm text-typography-400 leading-5">{description}</Text>
    </View>
  );
}

function ToolCard({ title, description, cta, href }: { title: string; description: string; cta: string; href: string }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(href as any)}
      className="bg-white rounded-2xl p-5 border border-accent-rose-light active:opacity-80"
      style={{ flex: 1, minWidth: 220 }}
    >
      <Text className="text-base font-semibold text-typography-900 mb-1">{title}</Text>
      <Text className="text-sm text-typography-500 leading-5 mb-4">{description}</Text>
      <Text className="text-sm font-semibold text-primary-500">{cta} →</Text>
    </Pressable>
  );
}

export function LandingPage() {
  const { t } = useTranslation("marketing");
  const router = useRouter();

  usePageMeta({
    title: t("landing.meta.title"),
    description: t("landing.meta.description"),
    canonical: t("landing.meta.canonical"),
    ogImage: "https://fiance.drakkar.software/assets/icon-512.png",
  });

  const appFeatures = [
    { key: "budget", icon: <DollarSign size={18} className="text-accent-gold" /> },
    { key: "guests", icon: <Users size={18} className="text-accent-gold" /> },
    { key: "seatingChart", icon: <LayoutGrid size={18} className="text-accent-gold" /> },
    { key: "vendors", icon: <Store size={18} className="text-accent-gold" /> },
    { key: "planning", icon: <CalendarCheck size={18} className="text-accent-gold" /> },
    { key: "photos", icon: <Camera size={18} className="text-accent-gold" /> },
    { key: "publicPage", icon: <Globe size={18} className="text-accent-gold" /> },
    { key: "offline", icon: <WifiOff size={18} className="text-accent-gold" /> },
  ] as const;

  const privacyFeatures = [
    { key: "offline", icon: <WifiOff size={20} className="text-accent-sage" /> },
    { key: "noAds", icon: <ShieldCheck size={20} className="text-accent-sage" /> },
    { key: "encrypted", icon: <Lock size={20} className="text-accent-sage" /> },
  ] as const;

  return (
    <View className="w-full">
      {/* Hero */}
      <View className="w-full py-20 px-6 items-center bg-accent-cream">
        <View style={{ maxWidth: 700, width: "100%", alignItems: "center" }}>
          {/* Eyebrow in Caveat script — warm, handwritten wedding feel */}
          <Script size={17} style={{ marginBottom: 20 }}>
            {t("landing.hero.badge")}
          </Script>
          {/* Headline in Fraunces — Garden Press display type */}
          <Display size={50} weight="600" style={{ textAlign: "center", marginBottom: 16 }}>
            {t("landing.hero.headline")}
          </Display>
          <Text className="text-lg text-typography-500 text-center mb-8 leading-7">
            {t("landing.hero.subheadline")}
          </Text>
          <View className="flex-row gap-3 flex-wrap justify-center">
            <Pressable
              onPress={() => router.push("/home" as any)}
              className="bg-primary-500 px-8 py-4 rounded-full active:opacity-70"
            >
              <Text className="text-base font-semibold text-white">{t("landing.hero.ctaPrimary")}</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/home" as any)}
              className="border border-primary-300 px-8 py-4 rounded-full active:opacity-70"
            >
              <Text className="text-base font-semibold text-primary-500">{t("landing.hero.ctaSecondary")}</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Features grid */}
      <View className="w-full py-20 px-6 bg-white">
        <View style={{ maxWidth: 1100, width: "100%", alignSelf: "center" }}>
          <Display size={34} weight="600" style={{ textAlign: "center", marginBottom: 12 }}>
            {t("landing.features.title")}
          </Display>
          <Text className="text-base text-typography-500 text-center mb-12">
            {t("landing.features.subtitle")}
          </Text>
          <View className="flex-row flex-wrap gap-4">
            {appFeatures.map((f) => (
              <FeatureCard
                key={f.key}
                icon={f.icon}
                title={t(`landing.features.${f.key}.title`)}
                description={t(`landing.features.${f.key}.description`)}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Free tools */}
      <View className="w-full py-20 px-6 bg-accent-cream">
        <View style={{ maxWidth: 1100, width: "100%", alignSelf: "center" }}>
          <Display size={34} weight="600" style={{ textAlign: "center", marginBottom: 12 }}>
            {t("landing.tools.title")}
          </Display>
          <Text className="text-base text-typography-500 text-center mb-12">
            {t("landing.tools.subtitle")}
          </Text>
          <View className="flex-row flex-wrap gap-4">
            <ToolCard
              title={t("landing.tools.seatingChart.title")}
              description={t("landing.tools.seatingChart.description")}
              cta={t("landing.tools.seatingChart.cta")}
              href="/tools/seating-chart"
            />
            <ToolCard
              title={t("landing.tools.budget.title")}
              description={t("landing.tools.budget.description")}
              cta={t("landing.tools.budget.cta")}
              href="/tools/budget-calculator"
            />
            <ToolCard
              title={t("landing.tools.timeline.title")}
              description={t("landing.tools.timeline.description")}
              cta={t("landing.tools.timeline.cta")}
              href="/tools/timeline"
            />
          </View>
        </View>
      </View>

      {/* Privacy section */}
      <View className="w-full py-20 px-6 bg-typography-900">
        <View style={{ maxWidth: 1100, width: "100%", alignSelf: "center" }}>
          <Display size={34} weight="600" color="#ffffff" style={{ textAlign: "center", marginBottom: 12 }}>
            {t("landing.privacy.title")}
          </Display>
          <Text className="text-base text-typography-400 text-center mb-12">
            {t("landing.privacy.subtitle")}
          </Text>
          <View className="flex-row flex-wrap gap-4">
            {privacyFeatures.map((f) => (
              <PrivacyCard
                key={f.key}
                icon={f.icon}
                title={t(`landing.privacy.${f.key}.title`)}
                description={t(`landing.privacy.${f.key}.description`)}
              />
            ))}
          </View>
          <View className="flex-row justify-center gap-6 mt-12">
            <Pressable onPress={() => router.push("/privacy" as any)} className="active:opacity-60">
              <Text className="text-sm text-typography-400 underline">{t("legal.privacyLink")}</Text>
            </Pressable>
            <Pressable onPress={() => router.push("/terms" as any)} className="active:opacity-60">
              <Text className="text-sm text-typography-400 underline">{t("legal.termsLink")}</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Download CTA */}
      <View className="w-full py-20 px-6 items-center bg-accent-blush">
        <View style={{ maxWidth: 600, width: "100%", alignItems: "center" }}>
          <HeartHandshake size={40} className="text-primary-500 mb-6" />
          <Display size={36} weight="600" style={{ textAlign: "center", marginBottom: 12 }}>
            {t("landing.download.title")}
          </Display>
          <Text className="text-base text-typography-500 text-center mb-8">
            {t("landing.download.subtitle")}
          </Text>
          <Pressable
            onPress={() => router.push("/home" as any)}
            className="bg-primary-500 px-10 py-4 rounded-full active:opacity-70"
          >
            <Text className="text-base font-semibold text-white">{t("landing.hero.ctaPrimary")}</Text>
          </Pressable>
        </View>
      </View>

    </View>
  );
}
