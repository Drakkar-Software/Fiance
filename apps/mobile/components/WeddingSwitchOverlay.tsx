import React, { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, Platform, StyleSheet, View } from "react-native";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { Display, Label, Script, Sprig, Underline } from "@fiance/ui/components";
import { theme as GP } from "@fiance/ui/garden-theme";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";

/**
 * Full-screen cover shown while db/provider.tsx swaps the active wedding's
 * SQLite file and re-hydrates the stores. Rendered as a sibling ON TOP of the
 * still-mounted app tree (never gates <Stack>, see provider.tsx) so it can
 * arm on the very first frame `dbFileName` changes — before the old wedding's
 * data would otherwise flash.
 *
 * Reads the wedding's registry `label` (set synchronously by switchWedding,
 * correct from frame one) — never couple names, which still belong to the
 * OLD wedding in useWeddingStore until hydration finishes. Pass `label`
 * explicitly when mounting before the registry has switched yet (e.g. the
 * dedicated /wedding-switch route, which arms before `switchWedding` resolves).
 */
export function WeddingSwitchOverlay({
  visible,
  label: labelProp,
}: {
  visible: boolean;
  label?: string;
}) {
  const { t } = useTranslation("common");
  const storeLabel = useWeddingRegistryStore(
    (s) => s.registry?.weddings.find((w) => w.id === s.registry?.activeWeddingId)?.label,
  );
  const label = labelProp ?? storeLabel;

  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion).catch(() => {});
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReducedMotion);
    return () => sub.remove();
  }, []);

  const [mounted, setMounted] = useState(visible);
  const opacity = useRef(new Animated.Value(0)).current;
  const cardProgress = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
      Animated.timing(cardProgress, {
        toValue: 1,
        duration: reducedMotion ? 180 : 320,
        delay: reducedMotion ? 0 : 120,
        easing: reducedMotion ? Easing.linear : Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      if (Platform.OS !== "web") {
        Haptics.selectionAsync().catch(() => {});
      }
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 240,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
      Animated.timing(cardProgress, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, reducedMotion, opacity, cardProgress]);

  useEffect(() => {
    if (!mounted) return;
    if (reducedMotion) {
      dot1.setValue(0.6);
      dot2.setValue(0.6);
      dot3.setValue(0.6);
      return;
    }
    const pulse = (value: Animated.Value) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, { toValue: 1, duration: 420, useNativeDriver: true }),
          Animated.timing(value, { toValue: 0.3, duration: 420, useNativeDriver: true }),
        ]),
      );
    const loop1 = pulse(dot1);
    const loop2 = pulse(dot2);
    const loop3 = pulse(dot3);
    const timer2 = setTimeout(() => loop2.start(), 140);
    const timer3 = setTimeout(() => loop3.start(), 280);
    loop1.start();
    return () => {
      clearTimeout(timer2);
      clearTimeout(timer3);
      loop1.stop();
      loop2.stop();
      loop3.stop();
    };
  }, [mounted, reducedMotion, dot1, dot2, dot3]);

  // Stop everything on unmount so no animation callback fires afterward.
  useEffect(
    () => () => {
      opacity.stopAnimation();
      cardProgress.stopAnimation();
      dot1.stopAnimation();
      dot2.stopAnimation();
      dot3.stopAnimation();
    },
    [opacity, cardProgress, dot1, dot2, dot3],
  );

  const overlayStyle = { opacity };
  const cardStyle = reducedMotion
    ? { opacity: cardProgress }
    : {
        opacity: cardProgress,
        transform: [
          { translateY: cardProgress.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
          { scale: cardProgress.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
        ],
      };
  const dot1Style = { opacity: dot1 };
  const dot2Style = { opacity: dot2 };
  const dot3Style = { opacity: dot3 };

  if (!mounted) return null;

  return (
    <Animated.View
      style={[styles.overlay, overlayStyle]}
      pointerEvents={visible ? "auto" : "none"}
    >
      <Sprig size={26} color={GP.olive} angle={-16} style={styles.sprigTopLeft} />
      <Sprig size={22} color={GP.clay} angle={20} style={styles.sprigTopRight} />

      <Animated.View style={[styles.card, cardStyle]}>
        <Label color={GP.mute}>{t("openingWedding")}</Label>
        <Display size={30} italic color={GP.ink} style={styles.title}>
          {label}
        </Display>
        <Underline width={100} color={GP.clay} strokeWidth={2} />
        <Script size={18} color={GP.mute} style={styles.tagline}>
          {t("switchingWedding")}
        </Script>

        <View style={styles.dots}>
          <Animated.View style={[styles.dot, dot1Style]} />
          <Animated.View style={[styles.dot, dot2Style]} />
          <Animated.View style={[styles.dot, dot3Style]} />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: GP.paper,
  },
  sprigTopLeft: {
    position: "absolute",
    top: "18%",
    left: "14%",
    opacity: 0.3,
  },
  sprigTopRight: {
    position: "absolute",
    top: "22%",
    right: "16%",
    opacity: 0.22,
  },
  card: {
    alignItems: "center",
    paddingHorizontal: 32,
  },
  title: {
    marginTop: 4,
    textAlign: "center",
  },
  tagline: {
    marginTop: 10,
  },
  dots: {
    flexDirection: "row",
    gap: 6,
    marginTop: 24,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GP.clay,
  },
});
