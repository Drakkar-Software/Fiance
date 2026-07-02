import React from "react";
import { Platform, useColorScheme } from "react-native";
import { View, Text, Pressable } from "react-native-css/components";
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

  // Android: use a custom pill toggle instead of the native control. Two reasons,
  // both matching the @expo/ui Button label fix: (1) the native control leaves the
  // active label at Material's dark default on the clay tint — the community wrapper
  // forwards no content color and swift-ui modifiers are Compose no-ops, so the
  // active label is unreadable; (2) its Host hugs Material's ~48dp height (its
  // `style.height` is ignored via `matchContents.vertical`), inflating inline rows.
  // The custom toggle gives a readable clay fill + white label. iOS keeps the native
  // control (its active label is already white on tint); web keeps its .web.tsx pill.
  if (Platform.OS === "android") {
    const toggle = (
      <View className="flex-row bg-accent-card border border-hair rounded-lg p-0.5">
        {segments.map((s) => {
          const active = s.key === activeKey;
          return (
            <Pressable
              key={s.key}
              onPress={() => onSelect(s.key)}
              className={`${
                compact ? "px-3 py-1" : "flex-1 items-center py-1.5"
              } rounded-md active:opacity-80 ${active ? "bg-primary-500" : ""}`}
            >
              <Text className={`text-xs font-medium text-center ${active ? "text-white" : "text-mute"}`}>
                {s.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
    if (compact) return toggle;
    return <View className="px-4 pt-3 pb-2 bg-accent-paper">{toggle}</View>;
  }

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
