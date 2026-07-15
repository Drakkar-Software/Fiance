import React from "react";
import { View, Text, Pressable } from "react-native-css/components";
import { useTranslation } from "react-i18next";
import { Lock, Sparkles } from "lucide-react-native";
import {
  getQuotaStatus,
  shouldShowQuotaBadge,
  PREMIUM_LIMIT_MESSAGE_KEY,
  type FreeLimitKey,
} from "@fiance/sdk";
import { useIsPremium } from "@/lib/premium";
import { useShowPaywall } from "@/components/PaywallProvider";

interface QuotaBadgeProps {
  entityKey: FreeLimitKey;
  count: number;
}

/**
 * Free-tier usage pill ("12 / 30"), shown near a list header so the cap is
 * visible before it's hit — mirrors the pre-emptive lock the boolean feature
 * gates (PremiumGate, member invite) already show, instead of the count caps'
 * previous "toast only after tapping add" surprise. Hidden for premium
 * (unlimited) and at zero count (the empty-state CTA already carries the
 * free-tier message on first use). Tapping it opens the shared paywall sheet
 * with the same contextual limit message the add button uses.
 */
export function QuotaBadge({ entityKey, count }: QuotaBadgeProps) {
  const { t } = useTranslation("common");
  const premium = useIsPremium();
  const { openPaywall } = useShowPaywall();

  if (!shouldShowQuotaBadge(count, premium)) return null;

  const { limit, atCap } = getQuotaStatus(entityKey, count);
  const Icon = atCap ? Lock : Sparkles;

  return (
    <Pressable
      onPress={() => openPaywall(t(`premiumLimits.${PREMIUM_LIMIT_MESSAGE_KEY[entityKey]}`, { limit }))}
      accessibilityRole="button"
      accessibilityLabel={t("quota.badgeLabel", { count, limit })}
      className={`flex-row items-center gap-1.5 self-start px-3 py-1.5 rounded-full border active:opacity-70 ${
        atCap ? "bg-primary-50 dark:bg-primary-900/30 border-primary-200 dark:border-primary-800" : "bg-accent-card border-hair"
      }`}
    >
      <Icon size={12} color={atCap ? "#b96a4a" : "#9CA3AF"} />
      <Text className={`text-xs font-medium ${atCap ? "text-primary-600 dark:text-primary-300" : "text-mute"}`}>
        {t("quota.badge", { count, limit })}
      </Text>
    </Pressable>
  );
}
