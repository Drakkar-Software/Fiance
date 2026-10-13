import React, { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Modal,
  PixelRatio,
  Platform,
  Text as RNText,
  findNodeHandle,
  useWindowDimensions,
} from "react-native";
import { View, Text, Pressable, ScrollView } from "react-native-css/components";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import type { StatsConsentChoice } from "@fiance/sdk";
import { Display } from "@/components/Display";
import { Label } from "@/components/Label";

interface StatsConsentScreenProps {
  visible: boolean;
  onAnswer: (choice: StatsConsentChoice) => void;
  onDismiss: () => void;
}

// At large system text sizes two side-by-side buttons clip, so they stack.
const STACK_FONT_SCALE = 1.5;

export function StatsConsentScreen({ visible, onAnswer, onDismiss }: StatsConsentScreenProps) {
  const { t } = useTranslation(["consent", "settings"]);
  const questionRef = useRef<RNText>(null);
  const { width } = useWindowDimensions();
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      if (Platform.OS === "web") {
        (questionRef.current as unknown as HTMLElement | null)?.focus?.();
        return;
      }
      const tag = findNodeHandle(questionRef.current);
      if (tag != null) AccessibilityInfo.setAccessibilityFocus(tag);
    }, 150);
    return () => clearTimeout(timer);
  }, [visible]);

  useEffect(() => {
    if (!visible || Platform.OS !== "web" || typeof document === "undefined") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [visible, onDismiss]);

  const stacked = PixelRatio.getFontScale() >= STACK_FONT_SCALE || width < 360;
  const buttonClass =
    "min-h-[56px] flex-1 items-center justify-center rounded-2xl border border-hair-strong bg-accent-card px-4 py-4";

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType={reduceMotion ? "none" : "fade"}
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <SafeAreaView className="flex-1 bg-accent-paper" edges={["top", "bottom"]}>
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-6 py-8"
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full max-w-[480px] self-center flex flex-col gap-6">
            <View className="items-center">
              <Label>{t("analytics", { ns: "settings" })}</Label>
            </View>

            <Text
              ref={questionRef}
              accessibilityRole="header"
              accessible
              {...(Platform.OS === "web" ? { tabIndex: -1 } : {})}
              className="text-center"
            >
              <Display size={26} italic style={{ textAlign: "center" }}>
                {t("question")}
              </Display>
            </Text>

            <Text className="text-center text-base leading-6 text-ink-soft">{t("detail")}</Text>

            <Text className="text-center text-sm leading-5 text-mute">{t("settingsHint")}</Text>

            <View className={stacked ? "flex flex-col gap-3" : "flex flex-row gap-3"}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("yes")}
                onPress={() => onAnswer("yes")}
                className={buttonClass}
                style={({ pressed }) => (pressed ? { opacity: 0.7 } : undefined)}
              >
                <Text className="text-lg font-semibold text-ink">{t("yes")}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("no")}
                onPress={() => onAnswer("no")}
                className={buttonClass}
                style={({ pressed }) => (pressed ? { opacity: 0.7 } : undefined)}
              >
                <Text className="text-lg font-semibold text-ink">{t("no")}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
