import React from "react";
import { Platform, Text, type TextStyle } from "react-native";
import { theme as GP } from "../garden-theme";

type Props = {
  children: React.ReactNode;
  size?: number;
  color?: string;
  style?: TextStyle;
};

export function Label({ children, size = 9, color, style }: Props) {
  return (
    <Text
      style={[
        {
          fontFamily: Platform.OS === "web" ? "Inter" : "Inter_600SemiBold",
          fontWeight: Platform.OS === "web" ? "600" : undefined,
          fontSize: size,
          letterSpacing: 0.18 * size,
          textTransform: "uppercase",
          color: color ?? GP.mute,
          lineHeight: size * 1.5,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
