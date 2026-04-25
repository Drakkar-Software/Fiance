import React from "react";
import { View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Display } from "./Display";
import { Script } from "./Script";
import { Label } from "./Label";

type Props = {
  eyebrow: string;
  title: string | number | React.ReactNode;
  tagline?: string;
  taglineColor?: string;
  titleSize?: number;
  italic?: boolean;
  right?: React.ReactNode;
  safeAreaTop?: boolean;
  style?: ViewStyle;
};

export function PageHeader({ eyebrow, title, tagline, taglineColor, titleSize = 22, italic = true, right, safeAreaTop = false, style }: Props) {
  const insets = useSafeAreaInsets();
  const topPad = 12 + (safeAreaTop ? insets.top : 0);
  return (
    <View style={[{ paddingHorizontal: 16, paddingTop: topPad, paddingBottom: 4, position: "relative" }, style]}>
      <Label>{eyebrow}</Label>
      <Display italic={italic} size={titleSize} style={right ? { paddingRight: 80 } : undefined}>
        {title}
      </Display>
      {tagline ? <Script size={19} color={taglineColor}>{tagline}</Script> : null}
      {right ? (
        <View style={{ position: "absolute", top: 18 + (safeAreaTop ? insets.top : 0), right: 16 }}>{right}</View>
      ) : null}
    </View>
  );
}
