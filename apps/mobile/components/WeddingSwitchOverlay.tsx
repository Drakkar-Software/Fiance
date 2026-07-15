import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
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
 * Only reads the wedding's registry `label` (set synchronously by
 * switchWedding, correct from frame one) — never couple names, which still
 * belong to the OLD wedding in useWeddingStore until hydration finishes.
 */
export function WeddingSwitchOverlay({ visible }: { visible: boolean }) {
  const { t } = useTranslation("common");
  const label = useWeddingRegistryStore(
    (s) => s.registry?.weddings.find((w) => w.id === s.registry?.activeWeddingId)?.label,
  );
  const reducedMotion = useReducedMotion();

  const [mounted, setMounted] = useState(visible);
  const opacity = useSharedValue(0);
  const cardProgress = useSharedValue(0);
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      opacity.value = withTiming(1, { duration: 180 });
      cardProgress.value = reducedMotion
        ? withTiming(1, { duration: 180 })
        : withDelay(120, withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) }));
      if (Platform.OS !== "web") {
        Haptics.selectionAsync().catch(() => {});
      }
    } else {
      opacity.value = withTiming(0, { duration: 240 }, (finished) => {
        if (finished) runOnJS(setMounted)(false);
      });
      cardProgress.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  useEffect(() => {
    if (!mounted) return;
    if (reducedMotion) {
      dot1.value = 0.6;
      dot2.value = 0.6;
      dot3.value = 0.6;
      return;
    }
    dot1.value = withRepeat(withTiming(1, { duration: 420 }), -1, true);
    dot2.value = withDelay(140, withRepeat(withTiming(1, { duration: 420 }), -1, true));
    dot3.value = withDelay(280, withRepeat(withTiming(1, { duration: 420 }), -1, true));
  }, [mounted, reducedMotion]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const cardStyle = useAnimatedStyle(() =>
    reducedMotion
      ? { opacity: cardProgress.value }
      : {
          opacity: cardProgress.value,
          transform: [
            { translateY: (1 - cardProgress.value) * 12 },
            { scale: 0.94 + cardProgress.value * 0.06 },
          ],
        },
  );
  const dot1Style = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const dot2Style = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const dot3Style = useAnimatedStyle(() => ({ opacity: dot3.value }));

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
