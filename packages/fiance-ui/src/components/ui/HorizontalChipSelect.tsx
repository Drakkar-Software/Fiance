import React from "react";
import { FilterTabs } from "./FilterTabs";

interface ChipOption {
  key: string;
  label: string;
}

interface HorizontalChipSelectProps {
  options: ChipOption[];
  activeKey: string;
  onSelect: (key: string) => void;
  className?: string;
}

/**
 * Horizontal single-select chip list.
 * Delegates to FilterTabs — a thin wrapper for the simpler (no icon/count) API.
 */
export function HorizontalChipSelect({ options, activeKey, onSelect, className }: HorizontalChipSelectProps) {
  return (
    <FilterTabs
      tabs={options}
      activeKey={activeKey}
      onSelect={onSelect}
      className={className ?? "mb-5"}
    />
  );
}
