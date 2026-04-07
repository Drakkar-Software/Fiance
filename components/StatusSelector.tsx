import React from "react";
import { ScrollView, Pressable } from "react-native";
import { StatusBadge } from "./StatusBadge";

interface StatusOption {
  key: string;
  label: string;
  color: string;
}

interface StatusSelectorProps {
  options: StatusOption[];
  activeKey: string;
  onSelect: (key: string) => void;
  className?: string;
}

export function StatusSelector({
  options,
  activeKey,
  onSelect,
  className,
}: StatusSelectorProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className={className ?? "mb-5"}
      contentContainerStyle={{ gap: 8 }}
    >
      {options.map((opt) => (
        <Pressable key={opt.key} onPress={() => onSelect(opt.key)}>
          <StatusBadge
            label={opt.label}
            color={activeKey === opt.key ? opt.color : "#D1D5DB"}
            size="md"
          />
        </Pressable>
      ))}
    </ScrollView>
  );
}
