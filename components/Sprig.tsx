import React from "react";
import Svg, { Path, Ellipse } from "react-native-svg";
import { theme as GP } from "@/lib/theme";

type Props = {
  size?: number;
  color?: string;
  angle?: number;
};

/** Leafy SVG sprig — decorative Garden Press motif (one per hero card). */
export function Sprig({ size = 20, color, angle = 0 }: Props) {
  const c = color ?? GP.olive;
  return (
    <Svg
      width={size}
      height={size * 1.6}
      viewBox="0 0 20 32"
      style={{ transform: [{ rotate: `${angle}deg` }] }}
    >
      <Path d="M10 30 L10 6" stroke={c} strokeWidth="1" strokeLinecap="round" />
      <Path d="M10 22 Q 5 18, 3 13" fill="none" stroke={c} strokeWidth="1" />
      <Path d="M10 18 Q 15 14, 17 9" fill="none" stroke={c} strokeWidth="1" />
      <Ellipse cx="4" cy="14" rx="3" ry="1.5" transform="rotate(-30 4 14)" fill={c} opacity="0.7" />
      <Ellipse cx="16" cy="10" rx="3" ry="1.5" transform="rotate(40 16 10)" fill={c} opacity="0.7" />
      <Ellipse cx="10" cy="4" rx="1.8" ry="1" fill={c} />
    </Svg>
  );
}
