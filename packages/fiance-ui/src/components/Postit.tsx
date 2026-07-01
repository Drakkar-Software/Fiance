import React from "react";
import { View, Text, type ViewStyle } from "react-native";
import { theme as GP } from "../garden-theme";

type Props = {
  children: React.ReactNode;
  angle?: number;
  color?: string;
  size?: "sm" | "md";
  style?: ViewStyle;
};

/** Rotated post-it sticker — one per screen max, Garden Press signature. */
export function Postit({ children, angle = -2, color, size = "md", style }: Props) {
  const isSm = size === "sm";
  return (
    <View
      pointerEvents="none"
      style={[
        {
          backgroundColor: color ?? GP.postit,
          padding: isSm ? 8 : 12,
          paddingHorizontal: isSm ? 10 : 14,
          transform: [{ rotate: `${angle}deg` }],
          shadowColor: GP.ink,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.12,
          shadowRadius: 8,
          elevation: 4,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontFamily: "Caveat_700Bold",
          fontSize: isSm ? 13 : 15,
          color: GP.ink,
          lineHeight: isSm ? 16 : 18,
        }}
      >
        {children}
      </Text>
    </View>
  );
}
