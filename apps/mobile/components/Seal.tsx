import React from "react";
import { View, Text, type ViewStyle } from "react-native";
import { theme as GP } from "@/lib/theme";

type Props = {
  label: string;
  sublabel?: string;
  size?: number;
  color?: string;
  bg?: string;
  angle?: number;
  style?: ViewStyle;
};

/** Circular stamp badge — used for status (e.g. "✓ booked", "✨ seed"). */
export function Seal({ label, sublabel, size = 44, color, bg, angle = -8, style }: Props) {
  const c = color ?? GP.olive;
  return (
    <View
      style={[{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1.2,
        borderColor: c,
        backgroundColor: bg ?? GP.card,
        alignItems: "center",
        justifyContent: "center",
        transform: [{ rotate: `${angle}deg` }],
      }, style]}
    >
      <Text style={{ fontFamily: "Caveat_700Bold", fontSize: size * 0.34, color: c, lineHeight: size * 0.38 }}>
        {label}
      </Text>
      {sublabel && (
        <Text style={{ fontFamily: "Caveat_400Regular", fontSize: size * 0.2, color: c, opacity: 0.8, marginTop: 1 }}>
          {sublabel}
        </Text>
      )}
    </View>
  );
}
