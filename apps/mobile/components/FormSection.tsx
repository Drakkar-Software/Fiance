import React from "react";
import { useTranslation } from "react-i18next";
import {
  SectionTitle,
  FormCard,
  InputRow,
  ToggleRow,
  ChipSelect,
  DateRow as SeahorseDateRow,
  TimeRow as SeahorseTimeRow,
} from "@drakkar.software/seahorse/components";
import { getDateLocale } from "@/i18n/dateFnsLocale";
import type { ComponentProps } from "react";

export { SectionTitle, FormCard, InputRow, ToggleRow, ChipSelect };

type DateRowProps = ComponentProps<typeof SeahorseDateRow>;

export function DateRow({ dateLocale, selectDateLabel, todayLabel, clearLabel, ...props }: DateRowProps) {
  const { t } = useTranslation("common");
  return (
    <SeahorseDateRow
      dateLocale={dateLocale ?? getDateLocale()}
      selectDateLabel={selectDateLabel ?? t("selectDate")}
      todayLabel={todayLabel ?? t("today")}
      clearLabel={clearLabel ?? t("clear")}
      {...props}
    />
  );
}

type TimeRowProps = ComponentProps<typeof SeahorseTimeRow>;

export function TimeRow({ selectTimeLabel, confirmLabel, clearLabel, hoursLabel, minutesLabel, ...props }: TimeRowProps) {
  const { t } = useTranslation("common");
  return (
    <SeahorseTimeRow
      selectTimeLabel={selectTimeLabel ?? t("selectTime")}
      confirmLabel={confirmLabel ?? t("confirm")}
      clearLabel={clearLabel ?? t("clear")}
      hoursLabel={hoursLabel ?? t("hours")}
      minutesLabel={minutesLabel ?? t("minutes")}
      {...props}
    />
  );
}
