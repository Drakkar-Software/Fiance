import React, { useMemo } from "react";
import { View, Text, ScrollView } from "react-native-css/components";
import { useTranslation } from "react-i18next";
import { useVendorsStore } from "@/store/useVendorsStore";
import { useGuestsStore, computeCounts } from "@/store/useGuestsStore";
import { calculateCatererScore, calculateCatererTotal } from "@/lib/budget";
import { PRICING_KEY_LABELS } from "@/db/types";
import type { PricingKey } from "@/db/types";
import { RatingStars } from "@/components/RatingStars";
import { PageHeader } from "@/components/PageHeader";
import { Postit } from "@/components/Postit";
import { formatMoney } from "@/components/MoneyDisplay";
import { ProgressBar } from "@/components/ProgressBar";
import { Display } from "@/components/Display";
import { Label } from "@/components/Label";

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
      total: calculateCatererTotal(c.pricings, counts, c.vendor.countAllGuests !== false),
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
      <View className="flex-1 items-center justify-center bg-accent-paper">
        <Text className="text-mute">
          {t("addAtLeast2")}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-accent-paper px-4 pt-4">
      <PageHeader
        eyebrow={t("compareEyebrow")}
        title={`${t(`types.CATERER` as any)} · ${vendors.length}`}
        titleSize={22}
      />
      {/* Score cards */}
      <Display size={20} italic style={{ marginBottom: 12 }}>{t("scores")}</Display>
      {caterers
        .sort((a, b) => b.score - a.score)
        .map((c, idx) => (
          <View key={c.vendor.id} style={{ position: "relative" }}>
            {idx === 0 && (
              <Postit angle={6} size="sm" style={{ position: "absolute", top: -12, right: 8, zIndex: 10 }}>
                our pick ✦
              </Postit>
            )}
            <View
              className="bg-accent-card rounded-xl p-4 mb-3 border border-hair"
            >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                {idx === 0 && (
                  <Trophy size={20} color="#F59E0B" />
                )}
                <Text className="text-base font-semibold text-ink ml-1">
                  {c.vendor.name}
                </Text>
              </View>
              <Display size={26} weight="500" color="#b96a4a">
                {c.score}
                <Text style={{ fontSize: 13, color: "#9CA3AF", fontFamily: "Inter_400Regular" }}>/100</Text>
              </Display>
            </View>
            <ProgressBar value={c.score} max={100} showPercentage={false} />
            <View className="flex-row justify-between mt-3">
              <View>
                <Text className="text-sm text-mute">{t("estimatedTotal")}</Text>
                <Display size={18} weight="500">{formatMoney(c.total)}</Display>
              </View>
              <RatingStars rating={c.vendor.rating || 0} size={16} />
            </View>
            </View>
          </View>
        ))}

      {/* Price comparison table */}
      <Display size={20} italic style={{ marginBottom: 12, marginTop: 16 }}>{t("detailByItem")}</Display>
      <View className="bg-accent-card rounded-xl p-4 mb-8 border border-hair">
        {/* Header row */}
        <View className="flex-row border-b border-hair pb-2 mb-2">
          <Text className="flex-1 text-sm font-medium text-mute">
            {t("item")}
          </Text>
          {caterers.map((c) => (
            <Text
              key={c.vendor.id}
              className="w-24 text-sm font-medium text-mute text-right"
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
            className="flex-row py-2 border-b border-hair"
          >
            <Text className="flex-1 text-sm text-ink-soft">
              {t(PRICING_KEY_LABELS[key])}
            </Text>
            {caterers.map((c) => {
              const pricing = c.pricings.find((p) => p.pricingKey === key);
              return (
                <Text
                  key={c.vendor.id}
                  className="w-24 text-sm text-right text-ink"
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
          <Text className="flex-1 text-sm font-bold text-ink">
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
      <View className="h-24" />
    </ScrollView>
  );
}

import { Trophy } from "lucide-react-native";
