import React from "react";
import { View, Text } from "react-native-css/components";

interface SectionHeaderProps {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  children?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, right, children }: SectionHeaderProps) {
  return (
    <View className="px-4 pt-3 pb-3 bg-background-0 border-b border-outline-100">
      {(title || right) && (
        <View className={`flex-row items-center justify-between${children ? " mb-3" : ""}`}>
          {title && (
            <Text className="text-base font-semibold text-typography-900">
              {title}
            </Text>
          )}
          {right}
        </View>
      )}
      {subtitle && !title && !right && (
        <Text className="text-sm text-typography-400">{subtitle}</Text>
      )}
      {subtitle && (title || right) && (
        <Text className="text-sm text-typography-400">{subtitle}</Text>
      )}
      {children}
    </View>
  );
}
