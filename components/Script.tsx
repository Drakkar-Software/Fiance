import React from "react";
import { Platform, Text, type TextStyle } from "react-native";
import { theme as GP } from "@/lib/theme";

type Props = {
  children: React.ReactNode;
  size?: number;
  color?: string;
  weight?: "400" | "500" | "700";
  style?: TextStyle;
};

export function Script({ children, size = 17, color, weight = "700", style }: Props) {
  const fontFamily =
    Platform.OS === "web"
      ? "Caveat"
      : ({ "400": "Caveat_400Regular", "500": "Caveat_500Medium", "700": "Caveat_700Bold" } as const)[weight];
  return (
    <Text
      style={[
        {
          fontFamily,
          fontWeight: Platform.OS === "web" ? (weight as TextStyle["fontWeight"]) : undefined,
          fontSize: size,
          color: color ?? GP.clay,
          lineHeight: size,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
