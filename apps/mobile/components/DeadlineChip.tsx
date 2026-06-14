import React from "react";
import { DeadlineChip as SeahorseDeadlineChip } from "@drakkar.software/seahorse/components";
import { useTranslation } from "react-i18next";
import type { ComponentProps } from "react";

type DeadlineChipProps = ComponentProps<typeof SeahorseDeadlineChip>;

export function DeadlineChip({ labels, ...props }: DeadlineChipProps) {
  const { t } = useTranslation("common");
  return (
    <SeahorseDeadlineChip
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
