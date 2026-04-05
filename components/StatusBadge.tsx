import React from "react";
import { View, Text } from "react-native";

interface StatusBadgeProps {
  label: string;
  color: string;
  size?: "sm" | "md";
}

export function StatusBadge({ label, color, size = "sm" }: StatusBadgeProps) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5" : "px-3 py-1";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <View
      className={`rounded-full ${sizeClasses}`}
      style={{ backgroundColor: color + "20" }}
    >
      <Text className={`${textSize} font-medium`} style={{ color }}>
        {label}
      </Text>
    </View>
  );
}
