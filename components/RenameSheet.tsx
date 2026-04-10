import React from "react";
import { RenameSheet as SeahorseRenameSheet } from "@drakkar.software/seahorse/components";
import { useTranslation } from "react-i18next";
import type { ComponentProps } from "react";

type RenameSheetProps = ComponentProps<typeof SeahorseRenameSheet>;

export function RenameSheet({ saveLabel, cancelLabel, ...props }: RenameSheetProps) {
  const { t } = useTranslation("common");
  return (
    <SeahorseRenameSheet
      saveLabel={saveLabel ?? t("save")}
      cancelLabel={cancelLabel ?? t("cancel")}
      {...props}
    />
  );
}
