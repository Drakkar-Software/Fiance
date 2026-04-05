import React from "react";
import { View, Text } from "react-native";
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
  let colorClass: string;

  if (isToday(target)) {
    label = "Aujourd'hui";
    colorClass = "bg-red-100 text-red-700";
  } else if (isPast(target)) {
    label = "En retard";
    colorClass = "bg-red-100 text-red-700";
  } else if (days <= 7) {
    label = `Dans ${days} jour${days > 1 ? "s" : ""}`;
    colorClass = "bg-amber-100 text-amber-700";
  } else if (days <= 30) {
    label = `Dans ${days} jours`;
    colorClass = "bg-blue-100 text-blue-700";
  } else {
    label = `Dans ${months} mois`;
    colorClass = "bg-gray-100 text-gray-600";
  }

  return (
    <View className={`px-2 py-0.5 rounded-full ${colorClass.split(" ")[0]}`}>
      <Text className={`text-xs font-medium ${colorClass.split(" ")[1]}`}>
        {label}
      </Text>
    </View>
  );
}
