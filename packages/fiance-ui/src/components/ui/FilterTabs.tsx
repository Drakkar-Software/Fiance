import React from "react";
import { ScrollView, Text } from "react-native-css/components";
import { Pressable } from "../../primitives/pressable";
import type { LucideIcon } from "lucide-react-native";

interface FilterTab {
  key: string;
  label: string;
  count?: number;
  icon?: LucideIcon;
  hidden?: boolean;
}

interface FilterTabsProps {
  tabs: FilterTab[];
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
              isActive
                ? "bg-primary-500 border-primary-500"
                : "bg-background-0 border-outline-200"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                isActive ? "text-white" : "text-typography-600"
              }`}
            >
              {tab.label}
              {tab.count != null ? ` (${tab.count})` : ""}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
