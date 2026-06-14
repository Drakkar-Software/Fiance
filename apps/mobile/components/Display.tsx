import React from "react";
import { Platform, Text, type TextStyle } from "react-native";
import { theme as GP } from "@/lib/theme";

type Props = {
  children: React.ReactNode;
  size?: number;
  italic?: boolean;
  weight?: "300" | "400" | "500" | "600" | "700";
  color?: string;
  style?: TextStyle;
  numberOfLines?: number;
  adjustsFontSizeToFit?: boolean;
};

export function Display({ children, size = 28, italic = false, weight = "400", color, style, numberOfLines, adjustsFontSizeToFit }: Props) {
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
  return (
    <Text
      numberOfLines={numberOfLines}
      adjustsFontSizeToFit={adjustsFontSizeToFit}
      style={[
        {
          ...fontStyle,
          fontSize: size,
          color: color ?? GP.ink,
          letterSpacing: -0.02 * size,
          lineHeight: size * 0.95,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
