import React from "react";
import { ConfirmSheet as SeahorseConfirmSheet } from "@drakkar.software/seahorse/components";
import { useTranslation } from "react-i18next";
import type { ComponentProps } from "react";

type ConfirmSheetProps = ComponentProps<typeof SeahorseConfirmSheet>;

export function ConfirmSheet({ confirmLabel, cancelLabel, ...props }: ConfirmSheetProps) {
  const { t } = useTranslation("common");
  return (
    <SeahorseConfirmSheet
      confirmLabel={confirmLabel ?? t("confirm")}
      cancelLabel={cancelLabel ?? t("cancel")}
      {...props}
    />
  );
}
