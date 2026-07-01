import React from "react";
import { DeadlineChip as UiDeadlineChip } from "@fiance/ui/components";
import { useTranslation } from "react-i18next";
import type { ComponentProps } from "react";

type DeadlineChipProps = ComponentProps<typeof UiDeadlineChip>;

export function DeadlineChip({ labels, ...props }: DeadlineChipProps) {
  const { t } = useTranslation("common");
  return (
    <UiDeadlineChip
      labels={{
        today: t("today"),
        overdue: t("overdue"),
        days: t("days"),
        months: t("months"),
        ...labels,
      }}
      {...props}
    />
  );
}
