import React from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Clock, AlertCircle } from "lucide-react-native";
import {
  differenceInDays,
  differenceInMonths,
  isPast,
  isToday,
} from "date-fns";

interface DeadlineChipProps {
  date: string;
}

export function DeadlineChip({ date }: DeadlineChipProps) {
  const { t } = useTranslation("common");
  const target = new Date(date);
  const now = new Date();
  const days = differenceInDays(target, now);
  const months = differenceInMonths(target, now);

  let label: string;
  let bg: string;
  let fg: string;
  let useAlert = false;

  if (isToday(target)) {
    label = t("today");
    bg = "#FEF2F2";
    fg = "#DC2626";
    useAlert = true;
  } else if (isPast(target)) {
    label = t("overdue");
    bg = "#FEF2F2";
    fg = "#DC2626";
    useAlert = true;
  } else if (days <= 7) {
    label = `${days}j`;
    bg = "#FFFBEB";
    fg = "#D97706";
  } else if (days <= 30) {
    label = `${days}j`;
    bg = "#EFF6FF";
    fg = "#2563EB";
  } else {
    label = `${months} ${t("months")}`;
    bg = "#F3F4F6";
    fg = "#6B7280";
  }

  return (
    <View
      className="flex-row items-center px-2 py-0.5 rounded-full gap-1"
      style={{ backgroundColor: bg }}
    >
      {useAlert ? (
        <AlertCircle size={11} color={fg} />
      ) : (
        <Clock size={11} color={fg} />
      )}
      <Text className="text-xs font-medium" style={{ color: fg }}>
        {label}
      </Text>
    </View>
  );
}
