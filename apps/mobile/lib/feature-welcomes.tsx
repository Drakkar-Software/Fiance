import React from "react";
import { useRouter, useSegments } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Home,
  LayoutDashboard,
  Users,
  Shield,
  Briefcase,
  Store,
  CircleCheck,
  Wallet,
  UserPlus,
  Utensils,
  LayoutGrid,
  Calendar,
  ListChecks,
  BellRing,
  Clock,
  PieChart,
  Target,
  Receipt,
  TrendingUp,
  Lightbulb,
  Palette,
  FolderHeart,
  Sparkles,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { FeatureWelcome } from "@fiance/ui/components";
import { theme as GP } from "@/lib/theme";
import { useFeatureTrialsStore } from "@/store/useFeatureTrialsStore";

/** Any route accepted by expo-router's push (string or object form). */
type WelcomeRoute = string | { pathname: string; params: Record<string, string> };

interface WelcomeConfig {
  /** Hero icon. */
  icon: LucideIcon;
  /** Accent color (Garden Press) for the hero band + icon tints. */
  accent: string;
  /** One icon per bullet (three bullets). */
  bulletIcons: [LucideIcon, LucideIcon, LucideIcon];
  /** Where the primary CTA takes the user. Omit for a dismiss-only CTA. */
  primaryRoute?: WelcomeRoute;
}

/**
 * First-visit welcome registry, keyed by the feature segment (see the derivation
 * in FeatureWelcomeHost, which mirrors DesktopSidebar). i18n copy lives in the
 * `welcome` namespace under the same keys.
 */
export const FEATURE_WELCOMES: Record<string, WelcomeConfig> = {
  home: {
    icon: Home,
    accent: GP.clay,
    bulletIcons: [LayoutDashboard, Users, Shield],
    // Home is the landing screen — the CTA simply dismisses.
  },
  vendors: {
    icon: Briefcase,
    accent: GP.olive,
    bulletIcons: [Store, CircleCheck, Wallet],
    primaryRoute: "/(tabs)/vendors/new",
  },
  guests: {
    icon: Users,
    accent: GP.blue,
    bulletIcons: [UserPlus, Utensils, LayoutGrid],
    primaryRoute: { pathname: "/(tabs)/guests/[id]", params: { id: "new" } },
  },
  planning: {
    icon: Calendar,
    accent: GP.mustard,
    bulletIcons: [ListChecks, BellRing, Clock],
    primaryRoute: { pathname: "/(tabs)/planning/[id]", params: { id: "new" } },
  },
  budget: {
    icon: PieChart,
    accent: GP.clay,
    bulletIcons: [Target, Receipt, TrendingUp],
    // No single "add" route — the CTA dismisses onto the budget screen.
  },
  ideas: {
    icon: Lightbulb,
    accent: GP.olive,
    bulletIcons: [Palette, FolderHeart, Sparkles],
    primaryRoute: { pathname: "/ideas/[id]", params: { id: "new" } },
  },
};

/**
 * Mounted once, globally (in app/_layout.tsx). Watches the active route, and the
 * first time the user lands on a feature area they've never visited, shows the
 * generic FeatureWelcome for it — then marks it seen so it never reappears.
 * Device-local, persisted via useFeatureTrialsStore.
 */
export function FeatureWelcomeHost() {
  const { t } = useTranslation("welcome");
  const router = useRouter();
  const segments = useSegments() as string[];
  const isLoaded = useFeatureTrialsStore((s) => s.isLoaded);
  const seen = useFeatureTrialsStore((s) => s.seen);
  const markSeen = useFeatureTrialsStore((s) => s.markSeen);

  // Mirrors DesktopSidebar: tab routes sit under "(tabs)"; top-level groups
  // (ideas) sit at segments[0].
  const activeKey = segments[0] === "(tabs)" ? segments[1] : segments[0];
  const cfg = activeKey ? FEATURE_WELCOMES[activeKey] : undefined;

  // No config for this route → nothing to render (settings/onboarding/etc.).
  if (!cfg || !activeKey) return null;

  // Derived directly from state (no effect/setState): show until the flag flips.
  // Dismissing calls markSeen(), which updates `seen` and hides the modal — and
  // persists it so the welcome never returns for this feature.
  const shouldShow = isLoaded && !seen[activeKey];

  const close = () => markSeen(activeKey);
  const handlePrimary = () => {
    const route = cfg.primaryRoute;
    markSeen(activeKey);
    if (route) router.push(route as never);
  };
  const hasRoute = !!cfg.primaryRoute;

  return (
    <FeatureWelcome
      visible={shouldShow}
      onDismiss={close}
      variant="fullscreen"
      icon={cfg.icon}
      accent={cfg.accent}
      eyebrow={t(`${activeKey}.eyebrow`)}
      title={t(`${activeKey}.title`)}
      tagline={t(`${activeKey}.tagline`)}
      bullets={[
        { icon: cfg.bulletIcons[0], text: t(`${activeKey}.bullet1`) },
        { icon: cfg.bulletIcons[1], text: t(`${activeKey}.bullet2`) },
        { icon: cfg.bulletIcons[2], text: t(`${activeKey}.bullet3`) },
      ]}
      primaryLabel={t(`${activeKey}.primaryCta`)}
      onPrimary={handlePrimary}
      secondaryLabel={hasRoute ? t(`${activeKey}.secondaryCta`) : undefined}
      onSecondary={hasRoute ? close : undefined}
    />
  );
}
