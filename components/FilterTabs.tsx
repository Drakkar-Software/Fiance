import React from "react";
import { ScrollView, Pressable, Text } from "react-native";

interface FilterTab {
  key: string;
  label: string;
  count?: number;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  activeKey: string;
  onSelect: (key: string) => void;
}

export function FilterTabs({ tabs, activeKey, onSelect }: FilterTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-4"
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onSelect(tab.key)}
            className={`px-4 py-2 rounded-full border ${
              isActive
                ? "bg-primary-500 border-primary-500"
                : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                isActive
                  ? "text-white"
                  : "text-gray-600 dark:text-gray-400"
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
