import React from "react";
import { View, Pressable, Text } from "react-native-css/components";

// Web fallback: @expo/ui's SegmentedControl (used on iOS/Android, see
// SegmentedControl.tsx) doesn't render reliably on web, so this keeps the
// previous custom warm pill there instead.

interface Segment {
  key: string;
  label: string;
}

interface SegmentedControlProps {
  segments: Segment[];
  activeKey: string;
  onSelect: (key: string) => void;
}

export function SegmentedControl({ segments, activeKey, onSelect }: SegmentedControlProps) {
  return (
    <View className="px-4 pt-3 pb-2 bg-accent-paper">
      <View className="flex-row bg-accent-paper rounded-xl p-1">
        {segments.map((seg) => {
          const isActive = seg.key === activeKey;
          return (
            <Pressable
              key={seg.key}
              onPress={() => onSelect(seg.key)}
              className={`flex-1 py-2 rounded-lg items-center ${
                isActive ? "bg-accent-card shadow-soft-1" : ""
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  isActive ? "text-primary-500" : "text-mute"
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
