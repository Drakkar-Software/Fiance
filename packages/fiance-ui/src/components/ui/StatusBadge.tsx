import React from "react";
import { View, Text } from "react-native-css/components";

interface StatusBadgeProps {
  label: string;
  color: string;
  size?: "sm" | "md";
}

export function StatusBadge({ label, color, size = "sm" }: StatusBadgeProps) {
  const sizeClasses = size === "sm" ? "px-2.5 py-0.5" : "px-3.5 py-1.5";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <View
      className={`rounded-full ${sizeClasses}`}
      style={{ backgroundColor: color + "18" }}
    >
      <Text className={`${textSize} font-semibold`} style={{ color }}>
        {label}
      </Text>
    </View>
  );
}
