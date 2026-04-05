import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
  const target = new Date(date);
  const now = new Date();
  const days = differenceInDays(target, now);
  const months = differenceInMonths(target, now);

  let label: string;
  let bg: string;
  let fg: string;
  let iconName: keyof typeof Ionicons.glyphMap = "time-outline";

  if (isToday(target)) {
    label = "Aujourd'hui";
    bg = "#FEF2F2";
    fg = "#DC2626";
    iconName = "alert-circle";
  } else if (isPast(target)) {
    label = "En retard";
    bg = "#FEF2F2";
    fg = "#DC2626";
    iconName = "alert-circle";
  } else if (days <= 7) {
    label = `${days}j`;
    bg = "#FFFBEB";
    fg = "#D97706";
  } else if (days <= 30) {
    label = `${days}j`;
    bg = "#EFF6FF";
    fg = "#2563EB";
  } else {
    label = `${months} mois`;
    bg = "#F3F4F6";
    fg = "#6B7280";
  }

  return (
    <View
      className="flex-row items-center px-2 py-0.5 rounded-full gap-1"
      style={{ backgroundColor: bg }}
    >
      <Ionicons name={iconName} size={11} color={fg} />
      <Text className="text-xs font-medium" style={{ color: fg }}>
        {label}
      </Text>
    </View>
  );
}
