import React, { useEffect, useCallback, useState } from "react";
import { View, Text, Pressable } from "react-native-css/components";
import { Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { Sheet } from "@fiance/ui/components";
import { Sparkles, Infinity as InfinityIcon, UserPlus, Globe, Wallet, BadgeCheck } from "lucide-react-native";
import { purchasePremium, restorePremium, getPremiumPrice } from "@/lib/revenuecat";
import { usePermissions } from "@/lib/permissions/usePermissions";

interface PaywallSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Optional contextual headline shown above the pitch (e.g. "30 guests reached"). */
  context?: string;
}

type SheetState = "idle" | "loading" | "unlocking" | "success" | "error";

const BENEFITS = [
  { key: "premiumBenefit1", icon: InfinityIcon },
  { key: "premiumBenefit2", icon: UserPlus },
  { key: "premiumBenefit3", icon: Globe },
  { key: "premiumBenefit5", icon: Wallet },
  { key: "premiumBenefit4", icon: BadgeCheck },
] as const;

/**
 * Purchase/restore are owner-only — the entitlement is shared across the whole
 * wedding (see RevenueCatInitializer in lib/providers.tsx), so a member device
 * cannot buy on the owner's behalf and instead sees a read-only message.
 */
export function PaywallSheet({ visible, onClose, context }: PaywallSheetProps) {
  const { t } = useTranslation("settings");
  const { isOwner } = usePermissions();
  const [state, setState] = useState<SheetState>("idle");
  const [price, setPrice] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !isOwner) return;
    // Retried: RevenueCat may not be configured yet when the sheet first opens
    // (see the matching comment in settings/premium.tsx) — poll instead of a
    // single fetch so the price still appears once configuration catches up.
    let cancelled = false;
    let attempts = 0;
    const tryFetch = () => {
      getPremiumPrice().then((p) => {
        if (cancelled) return;
        if (p) { setPrice(p); return; }
        attempts += 1;
        if (attempts < 10) setTimeout(tryFetch, 1000);
      }).catch(() => {});
    };
    tryFetch();
    return () => { cancelled = true; };
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
          {context ? (
            <Text className="text-base font-semibold text-primary-500 text-center mb-1">
              {context}
            </Text>
          ) : null}
          <Text className="text-xl font-bold text-ink text-center">
            {t("premiumTitle")}
          </Text>
          <Text className="text-sm text-mute text-center mt-2 leading-5">
            {isOwner ? t("premiumPitch") : t("premiumOwnerOnly")}
          </Text>
        </View>

        <View className="bg-accent-paper rounded-2xl overflow-hidden mb-4">
          {BENEFITS.map(({ key, icon: Icon }, i) => (
            <View
              key={key}
              className={`flex-row items-center px-3.5 py-3 gap-3${i < BENEFITS.length - 1 ? " border-b border-hair" : ""}`}
            >
              <View className="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-900 items-center justify-center">
                <Icon size={14} color="#b96a4a" />
              </View>
              <Text className="flex-1 text-xs font-medium text-ink">
                {t(key)}
              </Text>
            </View>
          ))}
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
