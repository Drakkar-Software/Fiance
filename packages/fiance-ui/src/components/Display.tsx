import React from "react";
import { Platform, Text, type TextStyle } from "react-native";
import { theme as GP } from "../garden-theme";

type Props = {
  children: React.ReactNode;
  /** Semantic heading level for SEO/a11y — renders h1/h2/h3 on web. */
  as?: "h1" | "h2" | "h3";
  size?: number;
  italic?: boolean;
  weight?: "300" | "400" | "500" | "600" | "700";
  color?: string;
  style?: TextStyle;
  numberOfLines?: number;
  adjustsFontSizeToFit?: boolean;
};

export function Display({ children, as, size = 28, italic = false, weight = "400", color, style, numberOfLines, adjustsFontSizeToFit }: Props) {
  const fontStyle: TextStyle =
    Platform.OS === "web"
      ? { fontFamily: "Fraunces", fontWeight: weight as TextStyle["fontWeight"], fontStyle: italic ? "italic" : "normal" }
      : {
          fontFamily: {
            "300": italic ? "Fraunces_300Light" : "Fraunces_300Light",
            "400": italic ? "Fraunces_400Regular_Italic" : "Fraunces_400Regular",
            "500": italic ? "Fraunces_500Medium_Italic" : "Fraunces_500Medium",
            "600": italic ? "Fraunces_600SemiBold_Italic" : "Fraunces_600SemiBold",
            "700": italic ? "Fraunces_700Bold" : "Fraunces_700Bold",
          }[weight],
        };
  const mergedStyle: TextStyle = {
    ...fontStyle,
    fontSize: size,
    color: color ?? GP.ink,
    letterSpacing: -0.02 * size,
    lineHeight: size * 0.95,
    ...(style as TextStyle),
  };

  if (Platform.OS === "web" && as) {
    // Raw DOM elements (unlike RN's Text/react-native-web) treat a bare
    // numeric `lineHeight` as a unitless multiplier of font-size, not px —
    // convert explicitly so heading line-height matches the RN/native render.
    const webStyle: React.CSSProperties = {
      ...(mergedStyle as React.CSSProperties),
      lineHeight:
        typeof mergedStyle.lineHeight === "number" ? `${mergedStyle.lineHeight}px` : mergedStyle.lineHeight,
    };
    return React.createElement(
      as,
      { style: webStyle },
      children
    );
  }

  return (
    <Text
      accessibilityRole={as ? "header" : undefined}
      aria-level={as ? Number(as[1]) : undefined}
      numberOfLines={numberOfLines}
      adjustsFontSizeToFit={adjustsFontSizeToFit}
      style={[mergedStyle]}
    >
      {children}
    </Text>
  );
}
