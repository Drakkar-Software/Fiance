import React from "react";
import { View, Text, Pressable } from "react-native-css/components";
import Svg, { Rect, Circle, Path, Text as SvgText } from "react-native-svg";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Store, CalendarCheck, Camera,
  WifiOff, Lock, ShieldCheck, HeartHandshake,
} from "lucide-react-native";
import { Seo } from "@/components/Seo";
import { Display } from "@/components/Display";
import { Script } from "@/components/Script";
import { Underline } from "@/components/Underline";
import { Card } from "@/components/Card";
import { Chip } from "@/components/Chip";
import { Seal } from "@/components/Seal";
import { Postit } from "@/components/Postit";
import { Avatar } from "@/components/Avatar";
import { formatMoney } from "@/components/MoneyDisplay";
import { theme as GP } from "@/lib/theme";
import { BlogPostCard } from "@/components/marketing/BlogPostCard";
import { FreeToolsStrip } from "@/components/marketing/FreeToolsStrip";
import { getLandingBlogPosts } from "@/lib/blog";
import { localizedSeo, localizedPath } from "@/lib/seo-urls";

/** Shared depth treatment for every app-peek/illustration card — real shadow + softer
 *  edge so the card reads as a distinct floating object against the near-identical
 *  page background, instead of a flat hairline-bordered rectangle. */
const vignetteCardStyle = {
  borderRadius: 18,
  borderColor: "rgba(42,36,24,0.08)",
  shadowColor: GP.ink,
  shadowOffset: { width: 0, height: 14 },
  shadowOpacity: 0.18,
  shadowRadius: 28,
  elevation: 10,
  padding: 24,
} as const;

/** Budget preview — reused in the hero app-peek card and the Budget spotlight row. */
const BudgetPeek = React.memo(function BudgetPeek({ compact }: { compact?: boolean }) {
  const { t } = useTranslation("marketing");
  const spent = 8400;
  const max = 12000;
  const pct = Math.round((spent / max) * 100);
  return (
    <View style={{ width: "100%", gap: compact ? 12 : 16 }}>
      <View>
        <Text
          className="text-accent-gold"
          style={{ fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase" }}
        >
          {t("landing.hero.peek.budgetLabel")}
        </Text>
        <View className="flex-row items-baseline" style={{ gap: 6, marginTop: 4 }}>
          <Display size={compact ? 28 : 32} weight="600">
            {formatMoney(spent)}
          </Display>
          <Text className="text-typography-400" style={{ fontFamily: "Inter_500Medium", fontSize: 13 }}>
            / {formatMoney(max)}
          </Text>
        </View>
      </View>
      <View>
        <View className="flex-row justify-between" style={{ marginBottom: 8 }}>
          <Text className="text-mute" style={{ fontSize: 12 }}>
            {t("landing.hero.peek.budgetSpent")}
          </Text>
          <Text className="text-typography-900" style={{ fontSize: 12, fontFamily: "Inter_600SemiBold" }}>
            {pct}%
          </Text>
        </View>
        <View style={{ position: "relative" }}>
          <View style={{ height: 10, borderRadius: 5, overflow: "hidden", backgroundColor: "rgba(42,36,24,0.08)" }}>
            <View style={{ width: `${pct}%`, height: "100%", borderRadius: 5, backgroundColor: GP.clay }}>
              <View
                style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 5,
                  borderTopLeftRadius: 5, borderTopRightRadius: 5,
                  backgroundColor: "rgba(255,255,255,0.18)",
                }}
              />
            </View>
          </View>
          {compact && (
            <View
              style={{
                position: "absolute", top: -2, left: `${pct}%`, marginLeft: -7,
                width: 14, height: 14, borderRadius: 7,
                backgroundColor: GP.card, borderWidth: 2, borderColor: GP.clay,
                shadowColor: GP.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.25, shadowRadius: 3, elevation: 2,
              }}
            />
          )}
        </View>
      </View>
      {!compact && (
        <Text className="text-mute" style={{ fontSize: 12 }}>
          {t("landing.hero.peek.budgetRemaining", { amount: formatMoney(max - spent) })}
        </Text>
      )}
    </View>
  );
});

const RsvpPill = React.memo(function RsvpPill({ color, label }: { color: string; label: string }) {
  return (
    <View
      className="flex-row items-center"
      style={{ gap: 6, backgroundColor: GP.paper, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4 }}
    >
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
      <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 11, color: GP.inkSoft }}>{label}</Text>
    </View>
  );
});

/** Guest-list preview — reused in the hero app-peek card and the Guests spotlight row. */
const GuestsPeek = React.memo(function GuestsPeek({ variant = "compact" }: { variant?: "compact" | "full" }) {
  const { t } = useTranslation("marketing");
  const avatars = [
    { ini: "M", tone: GP.claySoft },
    { ini: "J", tone: GP.oliveSoft },
    { ini: "L", tone: GP.mustardSoft },
  ];
  return (
    <View style={{ alignItems: "center", gap: 14 }}>
      <View className="flex-row items-center">
        {avatars.map((a, i) => (
          <View
            key={a.ini}
            style={{
              marginLeft: i === 0 ? 0 : -12,
              zIndex: avatars.length - i,
              borderRadius: 21,
              borderWidth: 3,
              borderColor: GP.card,
              backgroundColor: GP.card,
              shadowColor: GP.ink,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 5,
              elevation: 2,
            }}
          >
            <Avatar ini={a.ini} tone={a.tone} size={36} />
          </View>
        ))}
        <View
          style={{
            marginLeft: -12, width: 36, height: 36, borderRadius: 21,
            backgroundColor: GP.paper, borderWidth: 3, borderColor: GP.card,
            alignItems: "center", justifyContent: "center",
          }}
        >
          <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 12, color: GP.inkSoft }}>+21</Text>
        </View>
      </View>
      {variant === "compact" ? (
        <View className="flex-row items-center" style={{ gap: 6 }}>
          <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: GP.olive }} />
          <Chip color={GP.olive}>{t("landing.hero.peek.rsvp")}</Chip>
        </View>
      ) : (
        <View className="flex-row flex-wrap items-center justify-center" style={{ gap: 8 }}>
          <RsvpPill color={GP.olive} label={t("landing.features.guests.peek.yes", { count: 24 })} />
          <RsvpPill color={GP.clay} label={t("landing.features.guests.peek.no", { count: 3 })} />
          <RsvpPill color={GP.mustard} label={t("landing.features.guests.peek.maybe", { count: 5 })} />
        </View>
      )}
    </View>
  );
});

/** Top-down seating-canvas mini-illustration — mirrors the real seating plan (paper canvas,
 *  hair-dot grid, card-colored round table) instead of a generic icon-in-a-box. */
const SeatingVignette = React.memo(function SeatingVignette() {
  const { t } = useTranslation("marketing");
  const seatColors = [GP.clay, GP.olive, GP.mustard, GP.blue, GP.claySoft, GP.oliveSoft];
  const seats = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * Math.PI * 2) / 8 - Math.PI / 2;
    const r = 44;
    return {
      cx: 90 + r * Math.cos(angle),
      cy: 78 + r * Math.sin(angle),
      filled: i < 6,
      color: seatColors[i % seatColors.length],
    };
  });
  return (
    <View style={{ alignItems: "center", gap: 10 }}>
      <Svg width={180} height={150} viewBox="0 0 180 150">
        <Rect x={6} y={6} width={168} height={138} rx={12} fill={GP.paper} />
        {Array.from({ length: 36 }, (_, idx) => {
          const row = Math.floor(idx / 6);
          const col = idx % 6;
          return <Circle key={idx} cx={18 + col * 26} cy={18 + row * 26} r={1} fill="rgba(42,36,24,0.14)" />;
        })}
        <Circle cx={90} cy={78} r={27} fill={GP.card} stroke="rgba(42,36,24,0.24)" strokeWidth={1.5} />
        <SvgText x={90} y={82} fontSize={10} fill={GP.mute} textAnchor="middle">
          6/8
        </SvgText>
        {seats.map((s, i) =>
          s.filled ? (
            <Circle key={i} cx={s.cx} cy={s.cy} r={7} fill={s.color} stroke={GP.card} strokeWidth={2} />
          ) : (
            <Circle key={i} cx={s.cx} cy={s.cy} r={7} fill={GP.card} stroke={GP.olive} strokeWidth={1.3} strokeDasharray="2 2" />
          )
        )}
      </Svg>
      <Postit size="sm" angle={-4}>
        {t("landing.features.seatingChart.peek.dragDrop")}
      </Postit>
    </View>
  );
});

/** Wedding-website mini mock — browser chrome + cover band + a handwritten couple-name
 *  overlay, so this reads as "a real site" instead of a bare Globe icon. */
const WebsiteVignette = React.memo(function WebsiteVignette() {
  const { t } = useTranslation("marketing");
  return (
    <View style={{ width: 200, height: 150, position: "relative" }}>
      <Svg width={200} height={150} viewBox="0 0 200 150">
        <Rect x={4} y={4} width={192} height={142} rx={12} fill={GP.card} stroke="rgba(42,36,24,0.14)" />
        <Rect x={4} y={4} width={192} height={24} fill={GP.paper} />
        <Circle cx={16} cy={16} r={3} fill={GP.clay} />
        <Circle cx={26} cy={16} r={3} fill={GP.mustard} />
        <Circle cx={36} cy={16} r={3} fill={GP.olive} />
        <Rect x={52} y={10} width={120} height={12} rx={6} fill={GP.card} stroke="rgba(42,36,24,0.14)" />
        <Rect x={14} y={38} width={172} height={52} rx={8} fill={GP.oliveSoft} />
        <Path
          d="M100 70 C 96 63, 86 63, 86 71 C 86 78, 100 87, 100 87 C 100 87, 114 78, 114 71 C 114 63, 104 63, 100 70 Z"
          fill={GP.clay}
        />
        <Rect x={66} y={100} width={68} height={5} rx={2.5} fill="rgba(42,36,24,0.18)" />
        <Rect x={78} y={114} width={44} height={16} rx={8} fill={GP.mustard} />
        <SvgText x={100} y={125} fontSize={8} fill={GP.card} textAnchor="middle" fontWeight="700">
          {t("landing.features.publicPage.peek.rsvp")}
        </SvgText>
      </Svg>
      <View style={{ position: "absolute", top: 44, left: 0, right: 0, alignItems: "center" }}>
        <Script size={13} color={GP.clay}>
          {t("landing.features.publicPage.peek.coupleNames")}
        </Script>
      </View>
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
      <Card tinted={tint} style={[vignetteCardStyle, { minHeight: 190, alignItems: "center", justifyContent: "center" }]}>
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
    { key: "seatingChart", tint: GP.paper, vignette: <SeatingVignette /> },
    { key: "guests", tint: undefined, vignette: <GuestsPeek variant="full" /> },
    { key: "publicPage", tint: GP.paper, vignette: <WebsiteVignette /> },
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
              <Card style={[vignetteCardStyle, { gap: 18 }]}>
                <BudgetPeek compact />
                <View style={{ borderTopWidth: 1, borderStyle: "dashed", borderColor: "rgba(42,36,24,0.18)", paddingTop: 16 }}>
                  <GuestsPeek />
                </View>
              </Card>
              <View style={{ position: "absolute", top: -20, right: -14 }}>
                <Seal
                  label={t("landing.hero.peek.sealLabel")}
                  angle={-10}
                  size={58}
                  style={{
                    shadowColor: GP.ink, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.28, shadowRadius: 16, elevation: 6,
                  }}
                />
              </View>
              <View style={{ position: "absolute", bottom: -12, left: -14 }}>
                <Postit
                  angle={-4}
                  style={{
                    shadowColor: GP.ink, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 18, elevation: 7,
                  }}
                >
                  {t("landing.hero.peek.postit")}
                </Postit>
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
