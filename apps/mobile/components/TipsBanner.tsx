import React, { useEffect } from "react";
import { View, Text, Pressable } from "react-native-css/components";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";
import { Lightbulb } from "lucide-react-native";
import { theme as GP } from "@/lib/theme";
import { useWeddingTip } from "@/lib/useWeddingTip";

/**
 * A distinct "paper note" card (postit tint, unlike the cream `HomeBanner`
 * cards around it) showing one short wedding-planning tip. Tapping cycles to
 * another tip; the tip also refreshes each time the app comes to the
 * foreground (see useWeddingTip).
 */
export function TipsBanner() {
  const { tip, eyebrow, next } = useWeddingTip();
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = reducedMotion ? 1 : 0;
    opacity.value = withTiming(1, { duration: reducedMotion ? 0 : 260 });
  }, [tip, reducedMotion, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (!tip) return null;

  return (
    <Pressable
      onPress={next}
      className="rounded-2xl px-4 py-3 mb-3 border border-hair flex-row items-center active:opacity-80"
      style={{ backgroundColor: GP.mustardSoft }}
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: GP.postit }}
      >
        <Lightbulb size={18} color={GP.clay} />
      </View>
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        <Text className="text-[10px] font-semibold uppercase tracking-wide text-mute">{eyebrow}</Text>
        <Text className="text-sm text-ink mt-0.5">{tip}</Text>
      </Animated.View>
    </Pressable>
  );
}
