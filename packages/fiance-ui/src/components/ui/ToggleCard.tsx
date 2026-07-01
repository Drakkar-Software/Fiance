import React from "react";
import { View, Text } from "react-native-css/components";
import { Pressable } from "../../primitives/pressable";
import { Switch } from "../../primitives/switch";

interface ToggleCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function ToggleCard({ icon, title, subtitle, enabled, onToggle, disabled = false }: ToggleCardProps) {
  return (
    <Pressable
      onPress={!disabled ? onToggle : undefined}
      className={`bg-background-0 rounded-2xl p-4 mb-2 border border-outline-100 flex-row items-center ${
        disabled ? "opacity-50" : "active:opacity-80"
      }`}
    >
      {icon}
      <View className="ml-3 flex-1">
        <Text className="text-base text-typography-900 font-medium">{title}</Text>
        {subtitle != null && (
          <Text className="text-xs text-typography-400 mt-0.5">{subtitle}</Text>
        )}
      </View>
      <Switch value={enabled} onValueChange={() => onToggle()} disabled={disabled} />
    </Pressable>
  );
}
