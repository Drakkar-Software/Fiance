import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <Ionicons name={icon} size={64} color="#D1D5DB" />
      <Text className="text-xl font-semibold text-gray-700 dark:text-gray-300 mt-4 text-center">
        {title}
      </Text>
      {description && (
        <Text className="text-gray-500 dark:text-gray-400 mt-2 text-center">
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          className="mt-6 bg-primary-500 px-6 py-3 rounded-full active:bg-primary-600"
        >
          <Text className="text-white font-semibold">{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}
