import React from "react";
import { View, Text, Pressable } from "react-native-css/components";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  LayoutGrid, Store, CalendarCheck, Camera, Globe,
  WifiOff, Lock, ShieldCheck, HeartHandshake,
} from "lucide-react-native";
import { Seo } from "@/components/Seo";
import { Display } from "@/components/Display";
import { Script } from "@/components/Script";
import { Sprig } from "@/components/Sprig";
import { Underline } from "@/components/Underline";
import { Card } from "@/components/Card";
import { Chip } from "@/components/Chip";
import { Seal } from "@/components/Seal";
import { Postit } from "@/components/Postit";
import { Avatar } from "@/components/Avatar";
import { MoneyDisplay } from "@/components/MoneyDisplay";
import { ProgressBar } from "@/components/ProgressBar";
import { theme as GP } from "@/lib/theme";
import { BlogPostCard } from "@/components/marketing/BlogPostCard";
import { FreeToolsStrip } from "@/components/marketing/FreeToolsStrip";
import { getLandingBlogPosts } from "@/lib/blog";
import { localizedSeo, localizedPath } from "@/lib/seo-urls";

/** Budget preview — reused in the hero app-peek card and the Budget spotlight row. */
const BudgetPeek = React.memo(function BudgetPeek({ compact }: { compact?: boolean }) {
  const { t } = useTranslation("marketing");
  return (
    <View style={{ width: "100%", gap: compact ? 10 : 14 }}>
      <Chip color={GP.mustard}>{t("landing.hero.peek.budgetLabel")}</Chip>
      <MoneyDisplay amount={8400} size={compact ? "md" : "lg"} />
      <ProgressBar value={8400} max={12000} label={t("landing.hero.peek.budgetSpent")} />
    </View>
  );
});

/** Guest-list preview — reused in the hero app-peek card and the Guests spotlight row. */
const GuestsPeek = React.memo(function GuestsPeek() {
  const { t } = useTranslation("marketing");
  return (
    <View style={{ alignItems: "center", gap: 14 }}>
      <View className="flex-row items-center">
        <Avatar ini="M" tone={GP.claySoft} />
        <View style={{ marginLeft: -10 }}>
          <Avatar ini="J" tone={GP.oliveSoft} />
        </View>
        <View style={{ marginLeft: -10 }}>
          <Avatar ini="L" tone={GP.mustardSoft} />
        </View>
      </View>
      <Chip color={GP.olive}>{t("landing.hero.peek.rsvp")}</Chip>
    </View>
  );
});

/** Plain icon + Sprig vignette for spotlight rows that don't need a data preview. */
const IconVignette = React.memo(function IconVignette({ icon }: { icon: React.ReactNode }) {
  return (
    <View className="items-center" style={{ gap: 12 }}>
      <View className="w-16 h-16 rounded-2xl bg-accent-blush items-center justify-center">{icon}</View>
      <Sprig size={18} />
    </View>
  );
});

/** One alternating large row in the core-features section: vignette on one side, copy on the other. */
const FlagshipRow = React.memo(function FlagshipRow({
  featureKey,
  reverse,
  tint,
  vignette,
}: {
  featureKey: string;
  reverse: boolean;
  tint?: string;
  vignette: React.ReactNode;
}) {
  const { t } = useTranslation("marketing");
  const tagline = t(`landing.features.${featureKey}.tagline`, { defaultValue: "" });
  const copy = (
    <View key="copy" style={{ flexGrow: 1, flexBasis: 300, minWidth: 260 }}>
      {tagline ? (
        <Script size={15} style={{ marginBottom: 6 }}>
          {tagline}
        </Script>
      ) : null}
      <Display size={24} weight="600" style={{ marginBottom: 8 }}>
        {t(`landing.features.${featureKey}.title`)}
      </Display>
      <Text className="text-base text-typography-500 leading-6" style={{ maxWidth: 420 }}>
        {t(`landing.features.${featureKey}.description`)}
      </Text>
    </View>
  );
  const box = (
    <View key="box" style={{ flexGrow: 1, flexBasis: 260, minWidth: 240, maxWidth: 420 }}>
      <Card tinted={tint} style={{ padding: 26, minHeight: 190, alignItems: "center", justifyContent: "center" }}>
        {vignette}
      </Card>
    </View>
  );
  return (
    <View className="flex-row flex-wrap items-center" style={{ gap: 32, marginBottom: 40 }}>
      {reverse ? [copy, box] : [box, copy]}
    </View>
  );
});

/** Compact icon+title pill for the secondary features that don't get a full spotlight row. */
const CompactFeatureChip = React.memo(function CompactFeatureChip({
  featureKey,
  icon,
}: {
  featureKey: string;
  icon: React.ReactNode;
}) {
  const { t } = useTranslation("marketing");
  return (
    <View className="flex-row items-center bg-accent-paper rounded-full px-4 py-2.5" style={{ gap: 8 }}>
      {icon}
      <Text className="text-sm font-medium text-typography-700">{t(`landing.features.${featureKey}.title`)}</Text>
    </View>
  );
});

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

export function LandingPage() {
  const { t, i18n } = useTranslation("marketing");
  const router = useRouter();
  const lang = i18n.language === "en" ? "en" : "fr";
  const blogPosts = getLandingBlogPosts(lang);
  const seo = localizedSeo(lang, "/");

  const flagshipFeatures = [
    { key: "budget", tint: undefined, vignette: <BudgetPeek /> },
    { key: "seatingChart", tint: GP.paper, vignette: <IconVignette icon={<LayoutGrid size={28} className="text-accent-gold" />} /> },
    { key: "guests", tint: undefined, vignette: <GuestsPeek /> },
    { key: "publicPage", tint: GP.paper, vignette: <IconVignette icon={<Globe size={28} className="text-accent-gold" />} /> },
  ] as const;

  const compactFeatures = [
    { key: "vendors", icon: <Store size={16} className="text-accent-gold" /> },
    { key: "planning", icon: <CalendarCheck size={16} className="text-accent-gold" /> },
    { key: "photos", icon: <Camera size={16} className="text-accent-gold" /> },
    { key: "offline", icon: <WifiOff size={16} className="text-accent-gold" /> },
  ] as const;

  const privacyFeatures = [
    { key: "offline", icon: <WifiOff size={20} className="text-accent-sage" /> },
    { key: "noAds", icon: <ShieldCheck size={20} className="text-accent-sage" /> },
    { key: "encrypted", icon: <Lock size={20} className="text-accent-sage" /> },
  ] as const;

  return (
    <View className="w-full">
      <Seo
        title={t("landing.meta.title")}
        description={t("landing.meta.description")}
        {...seo}
        ogImage="https://fiance.drakkar.software/assets/og-image.png"
      />
      {/* Hero — editorial split: copy on the left, native app-peek vignette on the right */}
      <View className="w-full pt-24 pb-24 px-6 bg-accent-cream">
        <View className="flex-row flex-wrap" style={{ maxWidth: 1080, width: "100%", alignSelf: "center", gap: 48 }}>
          {/* Copy column */}
          <View style={{ flexGrow: 1, flexBasis: 420, minWidth: 300 }}>
            <Script size={18} style={{ marginBottom: 14 }}>
              {t("landing.hero.badge")}
            </Script>
            <Display size={50} weight="600" style={{ marginBottom: 8, lineHeight: 56 }}>
              {t("landing.hero.headline")}
            </Display>
            <View style={{ marginBottom: 18 }}>
              <Underline width={120} />
            </View>
            <Text className="text-lg text-typography-500 mb-8 leading-7" style={{ maxWidth: 440 }}>
              {t("landing.hero.subheadline")}
            </Text>
            <View className="flex-row gap-3 flex-wrap mb-8">
              <Pressable
                onPress={() => router.replace("/onboarding" as any)}
                className="bg-primary-500 px-8 py-4 rounded-full active:opacity-70 hover:opacity-90"
              >
                <Text className="text-base font-semibold text-white">{t("landing.hero.ctaPrimary")}</Text>
              </Pressable>
              <Pressable
                onPress={() => router.replace("/onboarding" as any)}
                className="border border-primary-300 px-8 py-4 rounded-full active:opacity-70 hover:opacity-90"
              >
                <Text className="text-base font-semibold text-primary-500">{t("landing.hero.ctaSecondary")}</Text>
              </Pressable>
            </View>
            <View className="flex-row flex-wrap" style={{ gap: 8 }}>
              <Chip color={GP.blue}>{t("landing.hero.trust.offline")}</Chip>
              <Chip color={GP.clay}>{t("landing.hero.trust.private")}</Chip>
              <Chip color={GP.mustard}>{t("landing.hero.trust.noAds")}</Chip>
            </View>
          </View>

          {/* App-peek vignette column */}
          <View style={{ flexGrow: 1, flexBasis: 320, minWidth: 280, maxWidth: 380, alignSelf: "center" }}>
            <View style={{ position: "relative" }}>
              <Card style={{ padding: 22, gap: 18 }}>
                <BudgetPeek compact />
                <View className="border-t border-accent-rose-light" style={{ paddingTop: 16 }}>
                  <GuestsPeek />
                </View>
              </Card>
              <View style={{ position: "absolute", top: -16, right: -12 }}>
                <Seal label={t("landing.hero.peek.sealLabel")} angle={-8} />
              </View>
              <View style={{ position: "absolute", bottom: -18, left: -16 }}>
                <Postit angle={-3}>{t("landing.hero.peek.postit")}</Postit>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Core features — alternating spotlight rows + a compact strip for the rest */}
      <View className="w-full py-20 px-6 bg-white">
        <View style={{ maxWidth: 1000, width: "100%", alignSelf: "center" }}>
          <Display size={34} weight="600" style={{ textAlign: "center", marginBottom: 10 }}>
            {t("landing.features.title")}
          </Display>
          <View className="items-center" style={{ marginBottom: 14 }}>
            <Underline width={90} />
          </View>
          <Text className="text-base text-typography-500 text-center mb-16">
            {t("landing.features.subtitle")}
          </Text>

          {flagshipFeatures.map((f, i) => (
            <FlagshipRow key={f.key} featureKey={f.key} reverse={i % 2 === 1} tint={f.tint} vignette={f.vignette} />
          ))}

          <View className="flex-row flex-wrap justify-center" style={{ gap: 12, marginTop: 8 }}>
            {compactFeatures.map((f) => (
              <CompactFeatureChip key={f.key} featureKey={f.key} icon={f.icon} />
            ))}
          </View>
        </View>
      </View>

      {/* Free tools */}
      <FreeToolsStrip
        toolIds={["seatingChart", "budget", "timeline"]}
        className="w-full py-20 px-6 bg-accent-cream"
      />

      {/* Le Carnet / Journal */}
      {blogPosts.length > 0 && (
        <View className="w-full py-20 px-6 bg-white">
          <View style={{ maxWidth: 1100, width: "100%", alignSelf: "center" }}>
            <Script size={17} style={{ marginBottom: 12, textAlign: "center" }}>
              {t("landing.blog.eyebrow")}
            </Script>
            <Display size={34} weight="600" style={{ textAlign: "center", marginBottom: 12 }}>
              {t("landing.blog.title")}
            </Display>
            <Text className="text-base text-typography-500 text-center mb-12">
              {t("landing.blog.subtitle")}
            </Text>
            <View className="flex-row flex-wrap" style={{ gap: 20 }}>
              {blogPosts.map((post) => (
                <View
                  key={post.slug}
                  style={{ flexBasis: 300, flexGrow: 1, maxWidth: 560 }}
                >
                  <BlogPostCard
                    post={post}
                    lang={lang}
                    onPress={() => router.push(localizedPath(lang, `/blog/${post.slug}`) as any)}
                  />
                </View>
              ))}
            </View>
            <View className="items-center" style={{ marginTop: 28 }}>
              <Pressable
                onPress={() => router.push(localizedPath(lang, "/blog") as any)}
                className="active:opacity-60"
              >
                <Text className="text-base font-semibold text-primary-500">
                  {t("landing.blog.viewAll")} →
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

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
            <Pressable onPress={() => router.push(localizedPath(lang, "/privacy") as any)} className="active:opacity-60">
              <Text className="text-sm text-typography-400 underline">{t("legal.privacyLink")}</Text>
            </Pressable>
            <Pressable onPress={() => router.push(localizedPath(lang, "/terms") as any)} className="active:opacity-60">
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
