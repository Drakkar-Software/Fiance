import React from "react";
import { ConfirmSheet as UiConfirmSheet } from "@fiance/ui/components";
import { useTranslation } from "react-i18next";
import type { ComponentProps } from "react";

type ConfirmSheetProps = ComponentProps<typeof UiConfirmSheet>;

export function ConfirmSheet({ confirmLabel, cancelLabel, ...props }: ConfirmSheetProps) {
  const { t } = useTranslation("common");
  return (
    <UiConfirmSheet
      confirmLabel={confirmLabel ?? t("confirm")}
      cancelLabel={cancelLabel ?? t("cancel")}
      {...props}
    />
  );
}
