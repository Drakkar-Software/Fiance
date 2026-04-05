import React from "react";
import { View, Text, Pressable } from "react-native";
import type { LucideIcon } from "lucide-react-native";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <View className="w-24 h-24 rounded-full bg-accent-blush dark:bg-gray-800 items-center justify-center mb-5">
        <Icon size={40} color="#E8B4B8" />
      </View>
      <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200 text-center">
        {title}
      </Text>
      {description && (
        <Text className="text-sm text-gray-400 dark:text-gray-500 mt-2 text-center leading-5">
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          className="mt-6 bg-primary-500 px-6 py-3 rounded-full active:bg-primary-600"
        >
          <Text className="text-white font-semibold text-sm">
            {actionLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
