import React from "react";
import { View, Text } from "react-native-css/components";

// Local override of seahorse's ProgressBar: seahorse's track uses
// bg-background-900 (~near-white, even in dark mode), which reads as an
// out-of-place bright bar on the warm Garden Press paper. Same API, warm track.

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  colorScheme?: "default" | "budget";
}

export function ProgressBar({ value, max, label, showPercentage = true, colorScheme = "default" }: ProgressBarProps) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const overflow = max > 0 && value > max;

  let barColor = "bg-primary-400";
  if (colorScheme === "budget") {
    if (overflow) barColor = "bg-error-500";
    else if (percentage >= 90) barColor = "bg-warning-400";
    else barColor = "bg-success-400";
  }

  return (
    <View className="w-full">
      {(label || showPercentage) && (
        <View className="flex-row justify-between mb-1.5">
          {label && <Text className="text-sm text-mute">{label}</Text>}
          {showPercentage && (
            <Text className="text-sm font-semibold text-ink-soft">{Math.round(percentage)}%</Text>
          )}
        </View>
      )}
      <View className="h-2 bg-hair rounded-full overflow-hidden">
        <View className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
      </View>
    </View>
  );
}
