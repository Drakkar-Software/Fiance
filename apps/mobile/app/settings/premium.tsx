import React, { useState, useCallback, useEffect } from "react";
import { View, Text, ScrollView, Pressable } from "react-native-css/components";
import { Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { Sparkles, Users, Globe, BadgeCheck } from "lucide-react-native";
import { Display } from "@/components/Display";
import { Label } from "@/components/Label";
import { Script } from "@/components/Script";
import { Sprig } from "@/components/Sprig";
import { Seal } from "@/components/Seal";
import { PageHeader } from "@/components/PageHeader";
import { purchasePremium, restorePremium, getPremiumPrice } from "@/lib/revenuecat";
import { useIsPremium } from "@/lib/premium";
import { usePermissions } from "@/lib/permissions/usePermissions";
import { analytics } from "@/lib/analytics";

type PurchaseState = "idle" | "loading" | "unlocking" | "success" | "error";

const BENEFITS = [
  { key: "premiumBenefit2", icon: Users },
  { key: "premiumBenefit3", icon: Globe },
  { key: "premiumBenefit4", icon: BadgeCheck },
] as const;

export default function PremiumScreen() {
  const { t } = useTranslation("settings");
  const premium = useIsPremium();
  const { isOwner } = usePermissions();
  const [state, setState] = useState<PurchaseState>("idle");
  const [price, setPrice] = useState<string | null>(null);

  useEffect(() => {
    if (isOwner) {
      getPremiumPrice().then((p) => { if (p) setPrice(p); }).catch(() => {});
    }
  }, [isOwner]);

  const handlePurchase = useCallback(async () => {
    analytics.capture("premium_checkout_started", { platform: Platform.OS as "ios" | "android" | "web" });
    setState("loading");
    const outcome = await purchasePremium();
    if (outcome.kind === "purchased") {
      analytics.capture("premium_purchased", { platform: Platform.OS as "ios" | "android" | "web" });
      setState("success");
      setTimeout(() => setState("idle"), 2000);
    } else if (outcome.kind === "cancelled") {
      setState("idle");
    } else {
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  }, []);

  const handleRestore = useCallback(async () => {
    setState("unlocking");
    const restored = await restorePremium();
    if (restored) {
      analytics.capture("premium_restored");
      setState("success");
      setTimeout(() => setState("idle"), 2000);
    } else {
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  }, []);

  const ctaLabel = (() => {
    if (state === "loading" || state === "unlocking") return t("premiumUnlocking");
    if (state === "success") return t("premiumPurchaseSuccess");
    if (state === "error") return t("premiumPurchaseError");
    return t("premiumCta", { price: price ?? "…" });
  })();

  return (
    <ScrollView className="flex-1 bg-accent-paper" showsVerticalScrollIndicator={false}>
      <View className="px-6 pt-8 pb-12">

        {/* Hero */}
        <View className="bg-accent-card rounded-2xl p-6 mb-8 border border-hair items-center" style={{ overflow: "visible" }}>
          <View style={{ position: "absolute", top: -10, right: 14 }}>
            <Sprig size={20} angle={14} />
          </View>
          {premium && (
            <View style={{ position: "absolute", top: -12, left: 14 }}>
              <Seal label="✓" sublabel={t("premiumUnlocked").toLowerCase().split(" ")[0]} color="#6e7a4a" size={42} angle={-8} />
            </View>
          )}
          <PageHeader
            eyebrow={t("premiumFeature", { defaultValue: "Premium" })}
            title="49 €"
            tagline={t("premiumOneTime", { defaultValue: "one-time" })}
            titleSize={52}
            style={{ paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 }}
          />
          <Text className="text-sm text-mute text-center leading-5 mt-3">
            {t("premiumPitch")}
          </Text>
        </View>

        {/* Benefits */}
        <View className="bg-accent-card rounded-2xl overflow-hidden mb-6">
          {BENEFITS.map(({ key, icon: Icon }, i) => (
            <View
              key={key}
              className={`flex-row items-center px-4 py-4 gap-3${i < BENEFITS.length - 1 ? " border-b border-hair" : ""}`}
            >
              <View className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900 items-center justify-center">
                <Icon size={18} color="#b96a4a" />
              </View>
              <Text className="flex-1 text-sm font-medium text-ink">
                {t(key)}
              </Text>
            </View>
          ))}
        </View>

        {/* CTA, active badge, or (for non-owners) a read-only note */}
        {premium ? (
          <View className="bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl px-5 py-4 items-center">
            <Text className="text-base font-semibold text-emerald-600 dark:text-emerald-400">
              {t("premiumUnlocked")} ✓
            </Text>
          </View>
        ) : !isOwner ? (
          <View className="bg-accent-card rounded-2xl px-5 py-4 items-center border border-hair">
            <Text className="text-sm text-mute text-center leading-5">
              {t("premiumOwnerOnly")}
            </Text>
          </View>
        ) : (
          <>
            <Pressable
              onPress={handlePurchase}
              disabled={state !== "idle"}
              className="bg-primary-500 rounded-2xl py-4 items-center active:opacity-80 mb-3"
              style={{ opacity: state !== "idle" ? 0.7 : 1 }}
            >
              <Text className="text-white font-semibold text-base">{ctaLabel}</Text>
            </Pressable>

            <Text className="text-xs text-mute text-center mt-1 mb-1 leading-5 px-2">
              {t("premiumBetaNote")}
            </Text>

            {Platform.OS !== "web" && (
              <Pressable
                onPress={handleRestore}
                disabled={state !== "idle"}
                className="items-center py-2 active:opacity-60"
              >
                <Text className="text-sm text-mute dark:text-mute">{t("premiumRestore")}</Text>
              </Pressable>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}
