import React, { useState, useCallback, useEffect } from "react";
import { View, Text, ScrollView, Pressable } from "react-native-css/components";
import { Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { Sparkles, Cloud, Users, Globe, BadgeCheck } from "lucide-react-native";
import { Display } from "@/components/Display";
import { useIsPremiumReal, purchasePremium, restorePurchases, fetchPremiumProduct, refreshEntitlements } from "@/lib/iap";
import { redirectToCheckout } from "@/lib/stripe";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";
import { resolveServerConfig } from "@/lib/server";

type PurchaseState = "idle" | "loading" | "unlocking" | "success" | "error";

const BENEFITS = [
  { key: "premiumBenefit1", icon: Cloud },
  { key: "premiumBenefit2", icon: Users },
  { key: "premiumBenefit3", icon: Globe },
  { key: "premiumBenefit4", icon: BadgeCheck },
] as const;

export default function PremiumScreen() {
  const { t } = useTranslation("settings");
  const premium = useIsPremiumReal();
  const [state, setState] = useState<PurchaseState>("idle");
  const [price, setPrice] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");

  const registry = useWeddingRegistryStore((s) => s.registry);
  const activeEntry = registry?.weddings.find((w) => w.id === registry.activeWeddingId);

  useEffect(() => {
    if (!activeEntry?.seedPhrase) return;
    resolveServerConfig(activeEntry).then((c) => { if (c) setUserId(c.userId); }).catch(() => {});
  }, [activeEntry?.id, activeEntry?.seedPhrase]);

  useEffect(() => {
    if (Platform.OS !== "web") {
      fetchPremiumProduct().then((p) => { if (p?.localizedPrice) setPrice(p.localizedPrice); }).catch(() => {});
    }
  }, []);

  const handlePurchase = useCallback(async () => {
    if (Platform.OS === "web") {
      try {
        redirectToCheckout(userId, activeEntry?.id);
      } catch {
        setState("error");
        setTimeout(() => setState("idle"), 3000);
      }
      return;
    }
    setState("loading");
    try {
      await purchasePremium(userId);
      setState("unlocking");
      await refreshEntitlements(userId);
      setState("success");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  }, [userId]);

  const handleRestore = useCallback(async () => {
    setState("unlocking");
    try {
      await restorePurchases(userId);
      setState("success");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  }, [userId]);

  const ctaLabel = (() => {
    if (state === "loading" || state === "unlocking") return t("premiumUnlocking");
    if (state === "success") return t("premiumPurchaseSuccess");
    if (state === "error") return t("premiumPurchaseError");
    if (Platform.OS === "web") return t("premiumCtaWeb");
    return t("premiumCta", { price: price ?? "…" });
  })();

  return (
    <ScrollView className="flex-1 bg-accent-paper" showsVerticalScrollIndicator={false}>
      <View className="px-6 pt-8 pb-12">

        {/* Hero */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 rounded-3xl bg-primary-50 dark:bg-primary-900 items-center justify-center mb-4">
            <Sparkles size={36} color="#b96a4a" />
          </View>
          <Display size={26} italic style={{ textAlign: "center", marginBottom: 8 }}>
            {t("premiumTitle")}
          </Display>
          <Text className="text-base text-gray-500 dark:text-gray-400 text-center leading-6">
            {t("premiumPitch")}
          </Text>
        </View>

        {/* Benefits */}
        <View className="bg-accent-card rounded-2xl overflow-hidden mb-6">
          {BENEFITS.map(({ key, icon: Icon }, i) => (
            <View
              key={key}
              className={`flex-row items-center px-4 py-4 gap-3${i < BENEFITS.length - 1 ? " border-b border-gray-100 dark:border-gray-800" : ""}`}
            >
              <View className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900 items-center justify-center">
                <Icon size={18} color="#b96a4a" />
              </View>
              <Text className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                {t(key)}
              </Text>
            </View>
          ))}
        </View>

        {/* CTA or active badge */}
        {premium ? (
          <View className="bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl px-5 py-4 items-center">
            <Text className="text-base font-semibold text-emerald-600 dark:text-emerald-400">
              {t("premiumUnlocked")} ✓
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

            <Text className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1 mb-1 leading-5 px-2">
              {t("premiumBetaNote")}
            </Text>

            {Platform.OS !== "web" && (
              <Pressable
                onPress={handleRestore}
                disabled={state !== "idle"}
                className="items-center py-2 active:opacity-60"
              >
                <Text className="text-sm text-gray-400 dark:text-gray-500">{t("premiumRestore")}</Text>
              </Pressable>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}
