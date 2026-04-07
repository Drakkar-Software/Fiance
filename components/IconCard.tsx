import React from "react";
import { View, Text, Pressable } from "react-native";

interface IconCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export function IconCard({
  icon,
  title,
  subtitle,
  right,
  onPress,
  children,
  className,
}: IconCardProps) {
  const content = (
    <>
      <View className="flex-row items-center">
        {icon}
        <View className="ml-3 flex-1">
          <Text className="text-base font-semibold text-gray-900 dark:text-white">
            {title}
          </Text>
          {subtitle != null && (
            <Text className="text-xs text-gray-400 mt-0.5">{subtitle}</Text>
          )}
        </View>
        {right}
      </View>
      {children}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className={`bg-white dark:bg-gray-900 rounded-2xl p-4 mb-3 border border-gray-100 dark:border-gray-800 active:opacity-80 ${className ?? ""}`}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View
      className={`bg-white dark:bg-gray-900 rounded-2xl p-4 mb-3 border border-gray-100 dark:border-gray-800 ${className ?? ""}`}
    >
      {content}
    </View>
  );
}
