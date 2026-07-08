import React, { type ComponentProps } from "react";
import { FAB as UiFAB } from "@fiance/ui/components";
import { useCanEditHere } from "@/lib/permissions/useCanEditHere";

/** Floating add button, hidden for a view-only collaborator on the current surface. */
export function FAB(props: ComponentProps<typeof UiFAB>) {
  const canEdit = useCanEditHere();
  if (!canEdit) return null;
  return <UiFAB {...props} />;
}
