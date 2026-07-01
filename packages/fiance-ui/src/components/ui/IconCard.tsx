import React from "react";
import { View, Text } from "react-native-css/components";
import { Card } from "../../primitives/card";
import { Pressable } from "../../primitives/pressable";

interface IconCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export function IconCard({ icon, title, subtitle, right, onPress, children, className }: IconCardProps) {
  const content = (
    <>
      <View className="flex-row items-center">
        {icon}
        <View className="ml-3 flex-1">
          <Text className="text-base font-semibold text-typography-900">
            {title}
          </Text>
          {subtitle != null && (
            <Text className="text-xs text-typography-400 mt-0.5">{subtitle}</Text>
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
        className={`bg-background-0 rounded-2xl p-4 mb-3 border border-outline-100 active:opacity-80 ${className ?? ""}`}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <Card variant="elevated" className={`rounded-2xl p-4 mb-3 border border-outline-100 ${className ?? ""}`}>
      {content}
    </Card>
  );
}
