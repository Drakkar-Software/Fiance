import React from "react";
import { useColorScheme } from "react-native";
import { View } from "react-native-css/components";
import NativeSegmentedControl, {
  type NativeSegmentedControlChangeEvent,
} from "@expo/ui/community/segmented-control";
import { useSettingsStore } from "@/store/useSettingsStore";

// Native @expo/ui control (real SwiftUI/Jetpack Compose segmented control)
// instead of a custom JS pill — no more bg-background-0/border-b white band
// under the cream stack header.

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
  const appColorScheme = useSettingsStore((s) => s.colorScheme);
  const systemScheme = useColorScheme();
  const isDark = appColorScheme === "dark" || (appColorScheme === "system" && systemScheme === "dark");
  const selectedIndex = Math.max(
    0,
    segments.findIndex((s) => s.key === activeKey)
  );

  return (
    <View className="px-4 pt-3 pb-2 bg-accent-paper">
      <NativeSegmentedControl
        values={segments.map((s) => s.label)}
        selectedIndex={selectedIndex}
        onChange={(event: NativeSegmentedControlChangeEvent) => {
          onSelect(segments[event.nativeEvent.selectedSegmentIndex].key);
        }}
        tintColor="#b96a4a"
        appearance={isDark ? "dark" : "light"}
        style={{ height: 36 }}
      />
    </View>
  );
}
