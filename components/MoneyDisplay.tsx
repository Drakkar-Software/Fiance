import React from "react";
import { Text, View } from "react-native";

interface MoneyDisplayProps {
  amount: number;
  currency?: string;
  size?: "sm" | "md" | "lg";
  isDynamic?: boolean;
  className?: string;
}

export function formatMoney(amount: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function MoneyDisplay({
  amount,
  currency = "EUR",
  size = "md",
  isDynamic = false,
  className = "",
}: MoneyDisplayProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-2xl",
  };

  return (
    <View className={`flex-row items-center gap-1 ${className}`}>
      <Text
        className={`font-semibold text-gray-900 dark:text-white ${sizeClasses[size]}`}
      >
        {formatMoney(amount, currency)}
      </Text>
      {isDynamic && (
        <View className="bg-blue-100 px-1.5 py-0.5 rounded">
          <Text className="text-[10px] text-blue-700 font-medium">
            Dynamique
          </Text>
        </View>
      )}
    </View>
  );
}
