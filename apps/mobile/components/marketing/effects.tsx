import React, { useEffect, useRef, useState } from "react";
import { Platform, type ViewStyle } from "react-native";
import { View } from "react-native-css/components";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";

/**
 * Reveal — fades + translates a section/row in once it scrolls into view.
 * Web-only (IntersectionObserver); everywhere else — native, no observer support,
 * or a failed ref assumption — content stays fully visible. This is a best-effort
 * motion touch, never a gate on content being shown.
 */
export function Reveal({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const ref = useRef<any>(null);
  const progress = useSharedValue(1);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof IntersectionObserver === "undefined") return;
    const node = ref.current;
    if (!node || typeof node.getBoundingClientRect !== "function") return;
    progress.value = 0; // only hide once we've confirmed we can reveal it again
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          progress.value = withTiming(1, { duration: 550, easing: Easing.out(Easing.cubic) });
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 18 }],
  }));

  return (
    <Animated.View ref={ref} style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

type GradientSpot = { cx: number; cy: number; r: number; color: string };

/** Absolutely-positioned soft radial gradient backdrop, layered behind section content. */
export function SectionGradient({ spots, style }: { spots: GradientSpot[]; style?: ViewStyle }) {
  return (
    <View
      pointerEvents="none"
      style={[{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden" }, style]}
    >
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <Defs>
          {spots.map((s, i) => (
            <RadialGradient key={i} id={`section-gradient-${i}`} cx={`${s.cx}%`} cy={`${s.cy}%`} r={`${s.r}%`}>
              <Stop offset="0%" stopColor={s.color} stopOpacity={1} />
              <Stop offset="100%" stopColor={s.color} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>
        {spots.map((s, i) => (
          <Rect key={i} x={0} y={0} width={100} height={100} fill={`url(#section-gradient-${i})`} />
        ))}
      </Svg>
    </View>
  );
}

/** Faint web-only noise texture overlay. Best-effort: no-op on native or if the
 *  style engine drops the raw CSS `backgroundImage`/`mixBlendMode` properties. */
export function Grain({ opacity = 0.05 }: { opacity?: number }) {
  if (Platform.OS !== "web") return null;
  const dataUri =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";
  return (
    <View
      pointerEvents="none"
      style={
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity,
          backgroundImage: `url("${dataUri}")`,
          mixBlendMode: "multiply",
        } as ViewStyle
      }
    />
  );
}

/** Animates a number from 0 to `target` on web mount (rAF ease-out). Native returns
 *  `target` immediately — no point animating a value with no scroll/hover context. */
export function useCountUp(target: number, { duration = 1500 }: { duration?: number } = {}): number {
  const [value, setValue] = useState(Platform.OS === "web" ? 0 : target);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    let raf = 0;
    const start = performance.now() + 200;
    const step = (now: number) => {
      const p = Math.max(0, Math.min(1, (now - start) / duration));
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(target * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}
