import React from "react";
import { Pressable, type PressableProps } from "react-native";
import { Script } from "./Script";
import { theme as GP } from "@/lib/theme";

type Props = PressableProps & {
  children: React.ReactNode;
  size?: number;
  color?: string;
};

export function ScriptButton({ children, size = 22, color, style, ...rest }: Props) {
  return (
    <Pressable
      style={[{ alignItems: "center", justifyContent: "center", paddingVertical: 12 }, style as any]}
      {...rest}
    >
      <Script size={size} color={color ?? GP.clay}>
        {children}
      </Script>
    </Pressable>
  );
}
