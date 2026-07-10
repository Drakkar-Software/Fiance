import React from "react";
import { useTranslation } from "react-i18next";
import {
  SectionTitle,
  FormCard,
  InputRow as UiInputRow,
  ToggleRow as UiToggleRow,
  ChipSelect as UiChipSelect,
  FormActions as UiFormActions,
  DateRow as UiDateRow,
  TimeRow as UiTimeRow,
} from "@fiance/ui/components";
import { getDateLocale } from "@/i18n/dateFnsLocale";
import { useCanEditHere } from "@/lib/permissions/useCanEditHere";
import type { ComponentProps } from "react";

export { SectionTitle, FormCard };

/**
 * The input primitives below all default their editable/disabled state to
 * `useCanEditHere()` — the same route-aware gate the mutating wrappers
 * (FAB, SaveHeaderButton, DeleteButton, FormActions) already use — so a
 * view-only collaborator sees inert (dimmed, non-interactive) fields instead
 * of just a hidden Save button. An explicit `editable`/`disabled` prop from
 * the caller still wins.
 */

type InputRowProps = ComponentProps<typeof UiInputRow>;

export function InputRow({ editable, ...props }: InputRowProps) {
  const canEdit = useCanEditHere();
  return <UiInputRow editable={editable ?? canEdit} {...props} />;
}

type ToggleRowProps = ComponentProps<typeof UiToggleRow>;

export function ToggleRow({ disabled, ...props }: ToggleRowProps) {
  const canEdit = useCanEditHere();
  return <UiToggleRow disabled={disabled ?? !canEdit} {...props} />;
}

type ChipSelectProps<T extends string> = ComponentProps<typeof UiChipSelect<T>>;

export function ChipSelect<T extends string>({ disabled, ...props }: ChipSelectProps<T>) {
  const canEdit = useCanEditHere();
  return <UiChipSelect disabled={disabled ?? !canEdit} {...props} />;
}

type FormActionsProps = ComponentProps<typeof UiFormActions>;

/** Save/cancel form actions, hidden for a view-only collaborator on the current surface. */
export function FormActions(props: FormActionsProps) {
  const canEdit = useCanEditHere();
  if (!canEdit) return null;
  return <UiFormActions {...props} />;
}

type DateRowProps = ComponentProps<typeof UiDateRow>;

export function DateRow({ dateLocale, selectDateLabel, todayLabel, clearLabel, disabled, ...props }: DateRowProps) {
  const { t } = useTranslation("common");
  const canEdit = useCanEditHere();
  return (
    <UiDateRow
      dateLocale={dateLocale ?? getDateLocale()}
      selectDateLabel={selectDateLabel ?? t("selectDate")}
      todayLabel={todayLabel ?? t("today")}
      clearLabel={clearLabel ?? t("clear")}
      disabled={disabled ?? !canEdit}
      {...props}
    />
  );
}

type TimeRowProps = ComponentProps<typeof UiTimeRow>;

export function TimeRow({ selectTimeLabel, confirmLabel, clearLabel, hoursLabel, minutesLabel, disabled, ...props }: TimeRowProps) {
  const { t } = useTranslation("common");
  const canEdit = useCanEditHere();
  return (
    <UiTimeRow
      selectTimeLabel={selectTimeLabel ?? t("selectTime")}
      confirmLabel={confirmLabel ?? t("confirm")}
      clearLabel={clearLabel ?? t("clear")}
      hoursLabel={hoursLabel ?? t("hours")}
      minutesLabel={minutesLabel ?? t("minutes")}
      disabled={disabled ?? !canEdit}
      {...props}
    />
  );
}
