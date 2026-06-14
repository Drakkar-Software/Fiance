import React from "react";
import { View, type ViewStyle } from "react-native";
import { theme as GP } from "@/lib/theme";

type Props = {
  children: React.ReactNode;
  tinted?: string;
  style?: ViewStyle;
};

/** Freeform content card — paper-cream bg, 1px hair border, 14px radius.
 *  Different from seahorse FormCard (form-row container). */
export function Card({ children, tinted, style }: Props) {
  return (
    <View
      style={[
        {
          backgroundColor: tinted ?? GP.card,
          borderWidth: 1,
          borderColor: GP.hair,
          borderRadius: 14,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
