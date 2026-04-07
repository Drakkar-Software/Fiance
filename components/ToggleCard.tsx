import React from "react";
import { View, Text, Pressable } from "react-native";

interface ToggleCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function ToggleCard({
  icon,
  title,
  subtitle,
  enabled,
  onToggle,
  disabled = false,
}: ToggleCardProps) {
  return (
    <Pressable
      onPress={!disabled ? onToggle : undefined}
      className={`bg-white dark:bg-gray-900 rounded-2xl p-4 mb-2 border border-gray-100 dark:border-gray-800 flex-row items-center ${
        disabled ? "opacity-50" : "active:opacity-80"
      }`}
    >
      {icon}
      <View className="ml-3 flex-1">
        <Text className="text-base text-gray-900 dark:text-white font-medium">
          {title}
        </Text>
        {subtitle != null && (
          <Text className="text-xs text-gray-400 mt-0.5">{subtitle}</Text>
        )}
      </View>
      <View
        className="w-12 h-7 rounded-full justify-center px-0.5"
        style={{ backgroundColor: enabled ? "#EC4899" : "#D1D5DB" }}
      >
        <View
          className="w-6 h-6 rounded-full bg-white"
          style={{ alignSelf: enabled ? "flex-end" : "flex-start" }}
        />
      </View>
    </Pressable>
  );
}
