import React from "react";
import { View, Pressable, Text } from "react-native";

interface Segment {
  key: string;
  label: string;
}

interface SegmentedControlProps {
  segments: Segment[];
  activeKey: string;
  onSelect: (key: string) => void;
}

export function SegmentedControl({
  segments,
  activeKey,
  onSelect,
}: SegmentedControlProps) {
  return (
    <View className="px-4 pt-3 pb-2 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
      <View className="flex-row bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        {segments.map((seg) => {
          const isActive = seg.key === activeKey;
          return (
            <Pressable
              key={seg.key}
              onPress={() => onSelect(seg.key)}
              className={`flex-1 py-2 rounded-lg items-center ${
                isActive ? "bg-white dark:bg-gray-700 shadow-sm" : ""
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  isActive
                    ? "text-primary-500"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {seg.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
