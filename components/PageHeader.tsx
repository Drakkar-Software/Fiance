import React from "react";
import { View, type ViewStyle } from "react-native";
import { Display } from "./Display";
import { Script } from "./Script";
import { Label } from "./Label";

type Props = {
  eyebrow: string;
  title: string | number | React.ReactNode;
  tagline?: string;
  titleSize?: number;
  italic?: boolean;
  right?: React.ReactNode;
  style?: ViewStyle;
};

export function PageHeader({ eyebrow, title, tagline, titleSize = 22, italic = true, right, style }: Props) {
  return (
    <View style={[{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, position: "relative" }, style]}>
      <Label>{eyebrow}</Label>
      <Display italic={italic} size={titleSize}>
        {title}
      </Display>
      {tagline ? <Script size={19}>{tagline}</Script> : null}
      {right ? (
        <View style={{ position: "absolute", top: 18, right: 16 }}>{right}</View>
      ) : null}
    </View>
  );
}
