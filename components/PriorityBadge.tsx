import React from "react";
import { StatusBadge } from "./StatusBadge";
import type { Priority } from "@/db/types";
import { PRIORITY_LABELS, PRIORITY_COLORS } from "@/db/types";

interface PriorityBadgeProps {
  priority: Priority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <StatusBadge
      label={PRIORITY_LABELS[priority]}
      color={PRIORITY_COLORS[priority]}
    />
  );
}
