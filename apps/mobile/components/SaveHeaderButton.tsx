import React, { type ComponentProps } from "react";
import { SaveHeaderButton as UiSaveHeaderButton } from "@fiance/ui/components";
import { useCanEditHere } from "@/lib/permissions/useCanEditHere";

/** Save action, hidden for a view-only collaborator on the current surface. */
export function SaveHeaderButton(props: ComponentProps<typeof UiSaveHeaderButton>) {
  const canEdit = useCanEditHere();
  if (!canEdit) return null;
  return <UiSaveHeaderButton {...props} />;
}
