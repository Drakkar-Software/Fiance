import React, { type ComponentProps } from "react";
import { DeleteButton as UiDeleteButton } from "@fiance/ui/components";
import { useCanEditHere } from "@/lib/permissions/useCanEditHere";

/** Destructive action, hidden for a view-only collaborator on the current surface. */
export function DeleteButton(props: ComponentProps<typeof UiDeleteButton>) {
  const canEdit = useCanEditHere();
  if (!canEdit) return null;
  return <UiDeleteButton {...props} />;
}
