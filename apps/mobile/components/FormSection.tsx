import React from "react";
import { useTranslation } from "react-i18next";
import {
  SectionTitle,
  FormCard,
  InputRow,
  ToggleRow,
  ChipSelect,
  FormActions as UiFormActions,
  DateRow as UiDateRow,
  TimeRow as UiTimeRow,
} from "@fiance/ui/components";
import { getDateLocale } from "@/i18n/dateFnsLocale";
import { useCanEditHere } from "@/lib/permissions/useCanEditHere";
import type { ComponentProps } from "react";

export { SectionTitle, FormCard, InputRow, ToggleRow, ChipSelect };

type FormActionsProps = ComponentProps<typeof UiFormActions>;

/** Save/cancel form actions, hidden for a view-only collaborator on the current surface. */
export function FormActions(props: FormActionsProps) {
  const canEdit = useCanEditHere();
  if (!canEdit) return null;
  return <UiFormActions {...props} />;
}

type DateRowProps = ComponentProps<typeof UiDateRow>;

export function DateRow({ dateLocale, selectDateLabel, todayLabel, clearLabel, ...props }: DateRowProps) {
  const { t } = useTranslation("common");
  return (
    <UiDateRow
      dateLocale={dateLocale ?? getDateLocale()}
      selectDateLabel={selectDateLabel ?? t("selectDate")}
      todayLabel={todayLabel ?? t("today")}
      clearLabel={clearLabel ?? t("clear")}
      {...props}
    />
  );
}

type TimeRowProps = ComponentProps<typeof UiTimeRow>;

export function TimeRow({ selectTimeLabel, confirmLabel, clearLabel, hoursLabel, minutesLabel, ...props }: TimeRowProps) {
  const { t } = useTranslation("common");
  return (
    <UiTimeRow
      selectTimeLabel={selectTimeLabel ?? t("selectTime")}
      confirmLabel={confirmLabel ?? t("confirm")}
      clearLabel={clearLabel ?? t("clear")}
      hoursLabel={hoursLabel ?? t("hours")}
      minutesLabel={minutesLabel ?? t("minutes")}
      {...props}
    />
  );
}
