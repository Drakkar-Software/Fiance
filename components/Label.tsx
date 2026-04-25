import React from "react";
import { Text, type TextStyle } from "react-native";
import { theme as GP } from "@/lib/theme";

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
          fontFamily: "Inter_600SemiBold",
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
