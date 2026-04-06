import React, { useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { useVendorsStore } from "@/store/useVendorsStore";
import { useGuestsStore, computeCounts } from "@/store/useGuestsStore";
import { calculateCatererScore, calculateCatererTotal } from "@/lib/budget";
import { PRICING_KEY_LABELS } from "@/db/types";
import type { PricingKey } from "@/db/types";
import { RatingStars } from "@/components/RatingStars";
import { formatMoney } from "@/components/MoneyDisplay";
import { ProgressBar } from "@/components/ProgressBar";

export default function CompareScreen() {
  const { t } = useTranslation("vendors");
  const vendors = useVendorsStore((s) =>
    s.vendors.filter((v) => v.type === "CATERER")
  );
  const quotePricings = useVendorsStore((s) => s.quotePricings);
  const guests = useGuestsStore((s) => s.guests);
  const counts = useMemo(() => computeCounts(guests), [guests]);

  const caterers = useMemo(() => {
    const allCaterers = vendors.map((v) => ({
      vendor: v,
      pricings: quotePricings.filter((p) => p.vendorId === v.id),
    }));

    return allCaterers.map((c) => ({
      ...c,
      total: calculateCatererTotal(c.pricings, counts),
      score: calculateCatererScore(c.vendor, c.pricings, counts, allCaterers),
    }));
  }, [vendors, quotePricings, counts]);

  const pricingKeys: PricingKey[] = [
    "cocktail",
    "dinner",
    "drinks",
    "next-day",
    "tableware",
    "linen",
    "vegetarian",
    "child",
    "service",
  ];

  if (caterers.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Text className="text-gray-500">
          Ajoutez au moins 2 traiteurs pour comparer
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-950 px-4 pt-4">
      {/* Score cards */}
      <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
        Scores
      </Text>
      {caterers
        .sort((a, b) => b.score - a.score)
        .map((c, idx) => (
          <View
            key={c.vendor.id}
            className="bg-white dark:bg-gray-900 rounded-xl p-4 mb-3 shadow-sm"
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                {idx === 0 && (
                  <Trophy size={20} color="#F59E0B" />
                )}
                <Text className="text-base font-semibold text-gray-900 dark:text-white ml-1">
                  {c.vendor.name}
                </Text>
              </View>
              <Text className="text-2xl font-bold text-primary-500">
                {c.score}
                <Text className="text-sm text-gray-400">/100</Text>
              </Text>
            </View>
            <ProgressBar value={c.score} max={100} showPercentage={false} />
            <View className="flex-row justify-between mt-3">
              <View>
                <Text className="text-sm text-gray-500">Total estimé</Text>
                <Text className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatMoney(c.total)}
                </Text>
              </View>
              <RatingStars rating={c.vendor.rating || 0} size={16} />
            </View>
          </View>
        ))}

      {/* Price comparison table */}
      <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3 mt-4">
        Détail par poste
      </Text>
      <View className="bg-white dark:bg-gray-900 rounded-xl p-4 mb-8">
        {/* Header row */}
        <View className="flex-row border-b border-gray-100 dark:border-gray-800 pb-2 mb-2">
          <Text className="flex-1 text-sm font-medium text-gray-500">
            Poste
          </Text>
          {caterers.map((c) => (
            <Text
              key={c.vendor.id}
              className="w-24 text-sm font-medium text-gray-500 text-right"
              numberOfLines={1}
            >
              {c.vendor.name}
            </Text>
          ))}
        </View>

        {/* Pricing rows */}
        {pricingKeys.map((key) => (
          <View
            key={key}
            className="flex-row py-2 border-b border-gray-50 dark:border-gray-800"
          >
            <Text className="flex-1 text-sm text-gray-700 dark:text-gray-300">
              {t(PRICING_KEY_LABELS[key])}
            </Text>
            {caterers.map((c) => {
              const pricing = c.pricings.find((p) => p.pricingKey === key);
              return (
                <Text
                  key={c.vendor.id}
                  className="w-24 text-sm text-right text-gray-900 dark:text-white"
                >
                  {pricing?.pricePerPerson
                    ? `${pricing.pricePerPerson.toFixed(0)} €/p`
                    : "—"}
                </Text>
              );
            })}
          </View>
        ))}

        {/* Total row */}
        <View className="flex-row pt-3 mt-1">
          <Text className="flex-1 text-sm font-bold text-gray-900 dark:text-white">
            TOTAL
          </Text>
          {caterers.map((c) => (
            <Text
              key={c.vendor.id}
              className="w-24 text-sm font-bold text-right text-primary-500"
            >
              {formatMoney(c.total)}
            </Text>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

import { Trophy } from "lucide-react-native";
