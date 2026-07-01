import React from "react";
import { ScrollView, Pressable } from "react-native-css/components";
import { StatusBadge } from "@fiance/ui/components";

// Local re-implementation: seahorse's StatusSelector (never vendored into @fiance/ui)
// passes "rgb(165, 163, 163)" for inactive badges, which when concatenated with "18"
// in StatusBadge produces invalid CSS ("rgb(165, 163, 163)18"). Using a hex value
// instead makes the alpha suffix valid.
const INACTIVE_COLOR = "#A5A3A3";

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

export function StatusSelector({ options, activeKey, onSelect, className }: StatusSelectorProps) {
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
            color={activeKey === opt.key ? opt.color : INACTIVE_COLOR}
            size="md"
          />
        </Pressable>
      ))}
    </ScrollView>
  );
}
