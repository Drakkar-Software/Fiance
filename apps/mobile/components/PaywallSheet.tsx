import React, { useEffect, useCallback, useState } from "react";
import { View, Text, Pressable } from "react-native-css/components";
import { Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { Sheet } from "@fiance/ui/components";
import { Sparkles } from "lucide-react-native";
import { purchasePremium, restorePremium, getPremiumPrice } from "@/lib/revenuecat";
import { usePermissions } from "@/lib/permissions/usePermissions";

interface PaywallSheetProps {
  visible: boolean;
  onClose: () => void;
}

type SheetState = "idle" | "loading" | "unlocking" | "success" | "error";

/**
 * Purchase/restore are owner-only — the entitlement is shared across the whole
 * wedding (see RevenueCatInitializer in lib/providers.tsx), so a member device
 * cannot buy on the owner's behalf and instead sees a read-only message.
 */
export function PaywallSheet({ visible, onClose }: PaywallSheetProps) {
  const { t } = useTranslation("settings");
  const { isOwner } = usePermissions();
  const [state, setState] = useState<SheetState>("idle");
  const [price, setPrice] = useState<string | null>(null);

  useEffect(() => {
    if (visible && isOwner) {
      getPremiumPrice().then((p) => { if (p) setPrice(p); }).catch(() => {});
    }
  }, [visible, isOwner]);

  const handlePurchase = useCallback(async () => {
    setState("loading");
    const outcome = await purchasePremium();
    if (outcome.kind === "purchased") {
      setState("success");
      setTimeout(() => { onClose(); setState("idle"); }, 1500);
    } else if (outcome.kind === "cancelled") {
      setState("idle");
    } else {
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  }, [onClose]);

  const handleRestore = useCallback(async () => {
    setState("unlocking");
    const restored = await restorePremium();
    if (restored) {
      setState("success");
      setTimeout(() => { onClose(); setState("idle"); }, 1500);
    } else {
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  }, [onClose]);

  const ctaLabel = (() => {
    if (state === "loading" || state === "unlocking") return t("premiumUnlocking");
    if (state === "success") return t("premiumPurchaseSuccess");
    if (state === "error") return t("premiumPurchaseError");
    return price ? t("premiumCta", { price }) : t("premiumCtaNoPrice");
  })();

  return (
    <Sheet visible={visible} onDismiss={onClose}>
      <View className="bg-accent-card rounded-t-3xl px-6 pt-6 pb-10">
        <View className="items-center mb-4">
          <View className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-900 items-center justify-center mb-3">
            <Sparkles size={28} color="#EC4899" />
          </View>
          <Text className="text-xl font-bold text-ink text-center">
            {t("premiumTitle")}
          </Text>
          <Text className="text-sm text-mute text-center mt-2 leading-5">
            {isOwner ? t("premiumPitch") : t("premiumOwnerOnly")}
          </Text>
        </View>

        {isOwner && (
          <>
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
          </>
        )}
      </View>
    </Sheet>
  );
}
