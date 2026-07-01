import React from "react";
import { ScrollView, Pressable, Text } from "react-native-css/components";

// Local override of seahorse's FilterTabs: seahorse hardcodes inactive chips
// to bg-background-0/border-outline-200 (white pills with a grey hairline),
// which clash with the warm Garden Press paper. This matches the warm chip
// style already hand-rolled on the guests screen.

interface Tab {
  key: string;
  label: string;
  count?: number | null;
  hidden?: boolean;
}

interface FilterTabsProps {
  tabs: Tab[];
  activeKey: string;
  onSelect: (key: string) => void;
  className?: string;
}

export function FilterTabs({ tabs, activeKey, onSelect, className }: FilterTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className={className ?? "mb-4"}
      // react-native-web's ScrollView defaults to flexGrow:1 — without this,
      // a FilterTabs placed next to a flex-1 sibling (e.g. EmptyState) stretches
      // vertically and its centered content container floats in the extra space.
      style={{ flexGrow: 0, flexShrink: 0 }}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: "center" }}
    >
      {tabs.map((tab) => {
        if (tab.hidden) return null;
        const isActive = tab.key === activeKey;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onSelect(tab.key)}
            className={`px-4 py-2 rounded-full border ${
              isActive ? "bg-primary-500 border-primary-500" : "bg-accent-card border-hair"
            }`}
          >
            <Text className={`text-sm font-medium ${isActive ? "text-white" : "text-mute"}`}>
              {tab.label}
              {tab.count != null ? ` (${tab.count})` : ""}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
