import React from "react";
import { View, Text } from "react-native-css/components";
import { Pressable } from "../../primitives/pressable";

interface StatCardProps {
  icon: React.ComponentType<{ size?: number; color?: string; className?: string }>;
  label: string;
  value: string | number;
  unit?: string;
  total?: string | number;
  footer?: string;
  alert?: React.ReactNode;
  onPress?: () => void;
}

export function StatCard({ icon: Icon, label, value, unit, total, footer, alert, onPress }: StatCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 bg-background-0 rounded-2xl p-4 border border-outline-100"
    >
      <View className="flex-row items-center mb-3">
        <Icon size={18} className="text-typography-500" />
        <Text className="text-sm font-semibold text-typography-900 ml-2">
          {label}
        </Text>
      </View>
      <Text className="text-3xl font-bold text-typography-900">
        {value}
        {total != null && (
          <Text className="text-lg text-typography-300 font-normal">
            /{total}
          </Text>
        )}
        {unit != null && (
          <Text className="text-lg text-typography-300 font-normal">
            {unit}
          </Text>
        )}
      </Text>
      {footer != null && (
        <Text className="text-xs text-typography-400 mt-1">{footer}</Text>
      )}
      {alert}
    </Pressable>
  );
}
