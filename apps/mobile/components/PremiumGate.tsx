import React, { useState } from "react";
import { View, Text, Pressable } from "react-native-css/components";
import { useTranslation } from "react-i18next";
import { Lock } from "lucide-react-native";
import { PaywallSheet } from "@/components/PaywallSheet";

interface PremiumGateProps {
  /** Render the blur-lock overlay instead of `children` when true. */
  locked: boolean;
  /** Overrides the default lock headline. */
  title?: string;
  /** Overrides the default lock subtext (pass "" to omit). */
  message?: string;
  /**
   * Called instead of opening this gate's own PaywallSheet when the CTA is
   * tapped. Pass this when a screen has several PremiumGates at once (e.g.
   * budget/index.tsx) so they share one hoisted PaywallSheet instead of each
   * mounting its own native bottom sheet. Omit for a single, self-contained gate.
   */
  onUnlock?: () => void;
  children: React.ReactNode;
}

/**
 * Wraps a section of premium-only content. When `locked`, the wrapped content
 * still renders (so layout doesn't jump) but dimmed and non-interactive behind
 * a centered lock chip + "Déverrouiller" CTA that opens the paywall sheet.
 * When unlocked, renders `children` directly with no wrapper overhead.
 */
export function PremiumGate({ locked, title, message, onUnlock, children }: PremiumGateProps) {
  const { t } = useTranslation("settings");
  const [showPaywall, setShowPaywall] = useState(false);

  if (!locked) return <>{children}</>;

  const resolvedMessage = message ?? t("premiumGateMessage");

  return (
    <View style={{ position: "relative" }}>
      <View pointerEvents="none" style={{ opacity: 0.32 }}>
        {children}
      </View>
      <View
        className="items-center justify-center px-6 py-5 rounded-2xl"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(253, 250, 241, 0.82)",
        }}
      >
        <View className="w-11 h-11 rounded-full bg-primary-500 items-center justify-center mb-2">
          <Lock size={18} color="#fff" />
        </View>
        <Text className="text-sm font-semibold text-ink text-center mb-1">
          {title ?? t("premiumGateTitle")}
        </Text>
        {resolvedMessage ? (
          <Text
            className="text-xs text-mute text-center mb-3 leading-4"
            style={{ maxWidth: 220 }}
          >
            {resolvedMessage}
          </Text>
        ) : null}
        <Pressable
          onPress={() => (onUnlock ? onUnlock() : setShowPaywall(true))}
          className="bg-primary-500 rounded-full px-4 py-2 active:opacity-80"
        >
          <Text className="text-white text-xs font-semibold">{t("premiumGateCta")}</Text>
        </Pressable>
      </View>
      {!onUnlock && <PaywallSheet visible={showPaywall} onClose={() => setShowPaywall(false)} />}
    </View>
  );
}
