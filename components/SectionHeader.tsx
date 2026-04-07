import React from "react";
import { View, Text } from "react-native";

interface SectionHeaderProps {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  children?: React.ReactNode;
}

export function SectionHeader({
  title,
  subtitle,
  right,
  children,
}: SectionHeaderProps) {
  return (
    <View className="px-4 pt-3 pb-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
      {(title || right) && (
        <View className={`flex-row items-center justify-between${children ? " mb-3" : ""}`}>
          {title && (
            <Text className="text-base font-semibold text-gray-900 dark:text-white">
              {title}
            </Text>
          )}
          {right}
        </View>
      )}
      {subtitle && !title && !right && (
        <Text className="text-sm text-gray-400">{subtitle}</Text>
      )}
      {subtitle && (title || right) && (
        <Text className="text-sm text-gray-400">{subtitle}</Text>
      )}
      {children}
    </View>
  );
}
