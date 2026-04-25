import React from "react";
import { Text, type TextStyle } from "react-native";
import { theme as GP } from "@/lib/theme";

type Props = {
  children: React.ReactNode;
  size?: number;
  italic?: boolean;
  weight?: "300" | "400" | "500" | "600" | "700";
  color?: string;
  style?: TextStyle;
};

export function Display({ children, size = 28, italic = false, weight = "400", color, style }: Props) {
  const fontMap: Record<string, string> = {
    "300": italic ? "Fraunces_300Light" : "Fraunces_300Light",
    "400": italic ? "Fraunces_400Regular_Italic" : "Fraunces_400Regular",
    "500": italic ? "Fraunces_500Medium_Italic" : "Fraunces_500Medium",
    "600": italic ? "Fraunces_600SemiBold_Italic" : "Fraunces_600SemiBold",
    "700": italic ? "Fraunces_700Bold" : "Fraunces_700Bold",
  };
  return (
    <Text
      style={[
        {
          fontFamily: fontMap[weight],
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
