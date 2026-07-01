import React, { useState } from "react";
import { View, Text, Pressable } from "react-native-css/components";
import { useTranslation } from "react-i18next";
import { formatMoney } from "@/components/MoneyDisplay";
import { theme as GP } from "@/lib/theme";

const CATEGORIES = [
  { key: "venue", pct: 38, color: GP.clay },
  { key: "catering", pct: 22, color: GP.mustard },
  { key: "photography", pct: 12, color: GP.olive },
  { key: "decoration", pct: 16, color: GP.blue },
  { key: "attire", pct: 12, color: "#a3502f" },
] as const;

const MIN_TOTAL = 5000;
const MAX_TOTAL = 40000;
const STEP = 1000;

/** Interactive budget slider — reused in the landing page's budget spotlight row.
 *  A total-budget stepper drives five category bars, recomputed live. */
export function BudgetMiniDemo() {
  const { t } = useTranslation("marketing");
  const [total, setTotal] = useState(15000);
  const maxPct = Math.max(...CATEGORIES.map((c) => c.pct));

  function adjust(delta: number) {
    setTotal((prev) => Math.max(MIN_TOTAL, Math.min(MAX_TOTAL, prev + delta)));
  }

  return (
    <View
      style={{
        backgroundColor: GP.paper,
        borderRadius: 20,
        padding: 24,
        shadowColor: GP.ink,
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.16,
        shadowRadius: 30,
        elevation: 8,
      }}
    >
      <View className="flex-row items-center justify-between" style={{ marginBottom: 16 }}>
        <Text
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 11,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            color: GP.mustard,
          }}
        >
          {t("landing.features.budget.demo.totalLabel")}
        </Text>
        <View className="flex-row items-center" style={{ gap: 8 }}>
          <Pressable
            onPress={() => adjust(-STEP)}
            className="active:opacity-60"
            style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: GP.card, alignItems: "center", justifyContent: "center" }}
          >
            <Text style={{ fontFamily: "Inter_700Bold", fontSize: 15, color: GP.inkSoft, lineHeight: 15 }}>−</Text>
          </Pressable>
          <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 21, color: GP.ink }}>{formatMoney(total)}</Text>
          <Pressable
            onPress={() => adjust(STEP)}
            className="active:opacity-60"
            style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: GP.card, alignItems: "center", justifyContent: "center" }}
          >
            <Text style={{ fontFamily: "Inter_700Bold", fontSize: 15, color: GP.inkSoft, lineHeight: 15 }}>+</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ gap: 12 }}>
        {CATEGORIES.map((cat) => (
          <View key={cat.key}>
            <View className="flex-row items-center justify-between" style={{ marginBottom: 5 }}>
              <Text style={{ fontFamily: "Inter_500Medium", fontSize: 13.5, color: GP.inkSoft }}>
                {t(`landing.features.budget.demo.categories.${cat.key}`)}
              </Text>
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 13.5, color: GP.ink }}>
                {formatMoney((total * cat.pct) / 100)}
              </Text>
            </View>
            <View style={{ height: 8, borderRadius: 5, backgroundColor: "rgba(42,36,24,0.08)", overflow: "hidden" }}>
              <View
                style={{
                  height: "100%",
                  borderRadius: 5,
                  width: `${Math.round((cat.pct / maxPct) * 100)}%`,
                  backgroundColor: cat.color,
                }}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
