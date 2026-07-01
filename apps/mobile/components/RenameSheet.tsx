import React from "react";
import { RenameSheet as UiRenameSheet } from "@fiance/ui/components";
import { useTranslation } from "react-i18next";
import type { ComponentProps } from "react";

type RenameSheetProps = ComponentProps<typeof UiRenameSheet>;

export function RenameSheet({ saveLabel, cancelLabel, ...props }: RenameSheetProps) {
  const { t } = useTranslation("common");
  return (
    <UiRenameSheet
      saveLabel={saveLabel ?? t("save")}
      cancelLabel={cancelLabel ?? t("cancel")}
      {...props}
    />
  );
}
