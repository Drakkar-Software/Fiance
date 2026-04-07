import React from "react";
import { ScrollView, View, Pressable, Text } from "react-native";

interface ChipOption {
  key: string;
  label: string;
}

interface HorizontalChipSelectProps {
  options: ChipOption[];
  activeKey: string;
  onSelect: (key: string) => void;
  className?: string;
}

export function HorizontalChipSelect({
  options,
  activeKey,
  onSelect,
  className,
}: HorizontalChipSelectProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className={className ?? "mb-5"}
      contentContainerStyle={{ gap: 8 }}
    >
      {options.map((opt) => {
        const isActive = opt.key === activeKey;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onSelect(opt.key)}
            className={`px-3.5 py-2 rounded-full border ${
              isActive
                ? "bg-primary-500 border-primary-500"
                : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
            }`}
          >
            <Text
              className={`text-sm ${
                isActive ? "text-white font-medium" : "text-gray-500"
              }`}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
