import React from "react";
import Svg, { Path } from "react-native-svg";
import { theme as GP } from "@/lib/theme";

type Props = {
  width?: number;
  color?: string;
  strokeWidth?: number;
};

/** Wavy hand-drawn SVG underline — for emphasis under Display headings. */
export function Underline({ width = 80, color, strokeWidth = 1.5 }: Props) {
  return (
    <Svg width={width} height={6} viewBox="0 0 120 6" preserveAspectRatio="none">
      <Path
        d="M2 4 Q 20 1, 40 3 T 80 3 T 118 3"
        fill="none"
        stroke={color ?? GP.clay}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}
