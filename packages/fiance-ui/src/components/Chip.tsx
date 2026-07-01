import React from "react";
import { View, Text, type ViewStyle } from "react-native";
import { theme as GP } from "../garden-theme";

type Props = {
  children: React.ReactNode;
  color?: string;
  filled?: boolean;
  style?: ViewStyle;
};

/** Generic pill chip — Garden Press style. */
export function Chip({ children, color, filled = false, style }: Props) {
  const c = color ?? GP.olive;
  return (
    <View
      style={[
        {
          paddingHorizontal: 9,
          paddingVertical: 3,
          borderRadius: 999,
          backgroundColor: filled ? c : `${c}24`,
          alignSelf: "flex-start",
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: 10,
          color: filled ? GP.card : c,
        }}
      >
        {children}
      </Text>
    </View>
  );
}
