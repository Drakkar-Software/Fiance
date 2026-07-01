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
  /** Skip the full-width page-header padding/background — for inline use next to other controls. */
  compact?: boolean;
}

export function SegmentedControl({ segments, activeKey, onSelect, compact = false }: SegmentedControlProps) {
  const appColorScheme = useSettingsStore((s) => s.colorScheme);
  const systemScheme = useColorScheme();
  const isDark = appColorScheme === "dark" || (appColorScheme === "system" && systemScheme === "dark");
  const selectedIndex = Math.max(
    0,
    segments.findIndex((s) => s.key === activeKey)
  );

  const control = (
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
  );

  if (compact) return control;

  return <View className="px-4 pt-3 pb-2 bg-accent-paper">{control}</View>;
}
