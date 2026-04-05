import React from "react";
import { View, Text } from "react-native";

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  colorScheme?: "default" | "budget";
}

export function ProgressBar({
  value,
  max,
  label,
  showPercentage = true,
  colorScheme = "default",
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const overflow = max > 0 && value > max;

  let barColor = "bg-primary-400";
  if (colorScheme === "budget") {
    if (overflow) barColor = "bg-red-500";
    else if (percentage >= 90) barColor = "bg-amber-400";
    else barColor = "bg-emerald-400";
  }

  return (
    <View className="w-full">
      {(label || showPercentage) && (
        <View className="flex-row justify-between mb-1.5">
          {label && (
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {label}
            </Text>
          )}
          {showPercentage && (
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {Math.round(percentage)}%
            </Text>
          )}
        </View>
      )}
      <View className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <View
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </View>
    </View>
  );
}
