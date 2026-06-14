import React from "react";
import { useTranslation } from "react-i18next";
import { StatusBadge } from "./StatusBadge";
import type { Priority } from "@/db/types";
import { PRIORITY_LABELS, PRIORITY_COLORS } from "@/db/types";

interface PriorityBadgeProps {
  priority: Priority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const { t } = useTranslation();
  return (
    <StatusBadge
      label={t(PRIORITY_LABELS[priority])}
      color={PRIORITY_COLORS[priority]}
    />
  );
}
