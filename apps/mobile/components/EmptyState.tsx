import React from "react";
import { EmptyState as UiEmptyState } from "@fiance/ui/components";
import type { ComponentProps } from "react";

type EmptyStateProps = ComponentProps<typeof UiEmptyState>;

export function EmptyState({
  iconBgClassName = "bg-accent-clay-soft",
  iconColor = "#b96a4a",
  ...props
}: EmptyStateProps) {
  return (
    <UiEmptyState iconBgClassName={iconBgClassName} iconColor={iconColor} {...props} />
  );
}
