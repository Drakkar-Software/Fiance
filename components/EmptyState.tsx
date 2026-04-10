import React from "react";
import { EmptyState as SeahorseEmptyState } from "@drakkar.software/seahorse/components";
import type { ComponentProps } from "react";

type EmptyStateProps = ComponentProps<typeof SeahorseEmptyState>;

export function EmptyState({
  iconBgClassName = "bg-accent-blush",
  iconColor = "#E8B4B8",
  ...props
}: EmptyStateProps) {
  return (
    <SeahorseEmptyState iconBgClassName={iconBgClassName} iconColor={iconColor} {...props} />
  );
}
