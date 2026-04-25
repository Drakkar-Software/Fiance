import React from "react";
import { EmptyState as SeahorseEmptyState } from "@drakkar.software/seahorse/components";
import type { ComponentProps } from "react";

type EmptyStateProps = ComponentProps<typeof SeahorseEmptyState>;

export function EmptyState({
  iconBgClassName = "bg-accent-clay-soft",
  iconColor = "#b96a4a",
  ...props
}: EmptyStateProps) {
  return (
    <SeahorseEmptyState iconBgClassName={iconBgClassName} iconColor={iconColor} {...props} />
  );
}
