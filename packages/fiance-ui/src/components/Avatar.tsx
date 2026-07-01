import React from "react";
import { View, Text } from "react-native";
import { theme as GP } from "../garden-theme";

type Props = {
  ini: string;
  size?: number;
  tone?: string;
};

/** Initials disc — Fraunces serif on tinted circle. */
export function Avatar({ ini, size = 34, tone }: Props) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: tone ?? GP.postit,
        borderWidth: 1,
        borderColor: GP.hair,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontFamily: "Fraunces_600SemiBold",
          fontSize: size * 0.36,
          color: GP.ink,
          letterSpacing: 0.02,
        }}
      >
        {ini.toUpperCase()}
      </Text>
    </View>
  );
}
