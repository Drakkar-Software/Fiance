import React, { useEffect, useCallback, useState } from "react";
import { View, Text, Pressable } from "react-native-css/components";
import { Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { Sheet } from "@drakkar.software/seahorse/components";
import { Sparkles } from "lucide-react-native";
import { purchasePremium, restorePurchases, fetchPremiumProduct, PREMIUM_SKU } from "@/lib/iap";
import { redirectToCheckout } from "@/lib/stripe";
import { useWeddingStore } from "@/store/useWeddingStore";
import { getStarfishClient, pullEntitlements } from "@/lib/starfish";
import { useEntitlementsStore } from "@/store/useEntitlementsStore";

interface PaywallSheetProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  weddingId?: string;
}

type SheetState = "idle" | "loading" | "unlocking" | "success" | "error";

export function PaywallSheet({ visible, onClose, userId, weddingId }: PaywallSheetProps) {
  const { t } = useTranslation("settings");
  const [state, setState] = useState<SheetState>("idle");
  const [price, setPrice] = useState<string | null>(null);

  useEffect(() => {
    if (visible && Platform.OS !== "web") {
      fetchPremiumProduct().then((p) => {
        if (p?.localizedPrice) setPrice(p.localizedPrice);
      }).catch(() => {});
    }
  }, [visible]);

  const handlePurchase = useCallback(async () => {
    if (Platform.OS === "web") {
      redirectToCheckout(userId, weddingId);
      return;
    }
    setState("loading");
    try {
      await purchasePremium(userId);
      setState("unlocking");
      // Background pull; optimistic store handles immediate gate
      const sfClient = getStarfishClient();
      if (sfClient) {
        const features = await pullEntitlements(sfClient, userId).catch(() => null);
        if (features && features.length > 0) {
          useEntitlementsStore.getState().setFeatures(features);
        }
      }
      setState("success");
      setTimeout(() => { onClose(); setState("idle"); }, 1500);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  }, [userId, onClose]);

  const handleRestore = useCallback(async () => {
    setState("unlocking");
    try {
      await restorePurchases(userId);
      setState("success");
      setTimeout(() => { onClose(); setState("idle"); }, 1500);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  }, [userId, onClose]);

  const ctaLabel = (() => {
    if (state === "loading" || state === "unlocking") return t("premiumUnlocking");
    if (state === "success") return t("premiumPurchaseSuccess");
    if (state === "error") return t("premiumPurchaseError");
    if (Platform.OS === "web") return t("premiumCtaWeb");
    return t("premiumCta", { price: price ?? "…" });
  })();

  return (
    <Sheet visible={visible} onDismiss={onClose}>
      <View className="bg-accent-card rounded-t-3xl px-6 pt-6 pb-10">
        <View className="w-10 h-1 rounded-full bg-hair self-center mb-5" />

        <View className="items-center mb-4">
          <View className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-900 items-center justify-center mb-3">
            <Sparkles size={28} color="#EC4899" />
          </View>
          <Text className="text-xl font-bold text-ink text-center">
            {t("premiumTitle")}
          </Text>
          <Text className="text-sm text-mute text-center mt-2 leading-5">
            {t("premiumPitch")}
          </Text>
        </View>

        <Pressable
          onPress={handlePurchase}
          disabled={state !== "idle"}
          className="bg-primary-500 rounded-2xl py-3.5 items-center active:opacity-80 mt-4"
          style={{ opacity: state !== "idle" ? 0.7 : 1 }}
        >
          <Text className="text-white font-semibold text-base">{ctaLabel}</Text>
        </Pressable>

        {Platform.OS !== "web" && (
          <Pressable
            onPress={handleRestore}
            disabled={state !== "idle"}
            className="items-center mt-3 py-2 active:opacity-60"
          >
            <Text className="text-sm text-mute dark:text-mute">{t("premiumRestore")}</Text>
          </Pressable>
        )}
      </View>
    </Sheet>
  );
}
