import React, { useState, useMemo } from "react";
import { View, Text, Pressable, TextInput } from "react-native-css/components";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, RotateCcw } from "lucide-react-native";
import { Seo } from "@/components/Seo";
import { exportToPdf } from "@fiance/ui/utils/file-export";

interface Category {
  key: string;
  percentage: number;
}

const DEFAULT_CATEGORIES: Category[] = [
  { key: "venue", percentage: 38 },
  { key: "catering", percentage: 15 },
  { key: "photography", percentage: 10 },
  { key: "music", percentage: 5 },
  { key: "decoration", percentage: 8 },
  { key: "dress", percentage: 6 },
  { key: "transport", percentage: 3 },
  { key: "beauty", percentage: 3 },
  { key: "rings", percentage: 4 },
  { key: "invitations", percentage: 2 },
  { key: "honeymoon", percentage: 3 },
  { key: "misc", percentage: 3 },
];

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);
}

export default function BudgetCalculatorTool() {
  const { t } = useTranslation("marketing");
  const router = useRouter();

  const [totalBudget, setTotalBudget] = useState("15000");
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);

  const budget = parseFloat(totalBudget.replace(/[^\d.]/g, "")) || 0;

  const totalPercentage = useMemo(
    () => categories.reduce((sum, c) => sum + c.percentage, 0),
    [categories]
  );

  function updatePercentage(key: string, delta: number) {
    setCategories((prev) =>
      prev.map((c) =>
        c.key === key
          ? { ...c, percentage: Math.max(0, Math.min(100, c.percentage + delta)) }
          : c
      )
    );
  }

  function reset() {
    setCategories(DEFAULT_CATEGORIES);
  }

  async function handleExport() {
    const lines = [
      `${t("tools.budgetCalculator.pdfTitle")} — ${formatAmount(budget)}\n`,
      ...categories.map((c) => {
        const amount = (budget * c.percentage) / 100;
        const label = t(`tools.budgetCalculator.categories.${c.key}`);
        return `${label}: ${c.percentage}% = ${formatAmount(amount)}`;
      }),
      `\n${t("tools.budgetCalculator.total")}: ${totalPercentage}%`,
    ];
    const content = lines.join("\n");
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;padding:40px 60px;line-height:1.7;color:#1a1a1a}pre{font-family:inherit;white-space:pre-wrap;margin:0}</style></head><body><pre>${content}</pre></body></html>`;
    await exportToPdf(html, t("tools.budgetCalculator.pdfFilename"));
  }

  return (
    <View className="w-full">
      <Seo
        title={t("tools.budgetCalculator.meta.title")}
        description={t("tools.budgetCalculator.meta.description")}
        canonical={t("tools.budgetCalculator.meta.canonical")}
        jsonLd={[
          { "@type": "WebApplication", name: t("tools.budgetCalculator.meta.title"),
            url: t("tools.budgetCalculator.meta.canonical"),
            applicationCategory: "UtilityApplication",
            offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" } },
          { "@type": "BreadcrumbList", itemListElement: [
            { "@type": "ListItem", position: 1, name: "Fiancé", item: "https://fiance.drakkar.software" },
            { "@type": "ListItem", position: 2, name: t("tools.budgetCalculator.meta.title"), item: t("tools.budgetCalculator.meta.canonical") },
          ]},
        ]}
      />
      {/* Header */}
      <View className="w-full py-12 px-6 bg-accent-cream">
        <View style={{ maxWidth: 800, width: "100%", alignSelf: "center" }}>
          <Pressable
            onPress={() => router.push("/feature/budget" as any)}
            className="flex-row items-center gap-1 mb-6 active:opacity-60"
          >
            <ArrowLeft size={14} className="text-typography-500" />
            <Text className="text-sm text-typography-500">{t("tools.backToTools")}</Text>
          </Pressable>
          <Text className="text-3xl font-bold text-typography-900 mb-2">
            {t("tools.budgetCalculator.title")}
          </Text>
          <Text className="text-base text-typography-500">{t("tools.budgetCalculator.subtitle")}</Text>
        </View>
      </View>

      {/* Tool body */}
      <View className="w-full py-8 px-6 bg-white">
        <View style={{ maxWidth: 800, width: "100%", alignSelf: "center" }}>
          {/* Budget input */}
          <View className="bg-accent-cream rounded-2xl p-5 mb-8 flex-row flex-wrap items-center gap-4">
            <View className="flex-1" style={{ minWidth: 200 }}>
              <Text className="text-sm font-semibold text-typography-700 mb-2">
                {t("tools.budgetCalculator.totalBudget")}
              </Text>
              <View className="flex-row items-center gap-2">
                <TextInput
                  value={totalBudget}
                  onChangeText={setTotalBudget}
                  placeholder={t("tools.budgetCalculator.totalBudgetPlaceholder")}
                  keyboardType="numeric"
                  className="bg-white rounded-xl px-3 py-2.5 text-base text-typography-900 border border-accent-rose-light flex-1"
                />
                <Text className="text-base font-semibold text-typography-400">
                  {t("tools.budgetCalculator.currency")}
                </Text>
              </View>
            </View>
            <View className="flex-row gap-2">
              <Pressable
                onPress={handleExport}
                className="bg-accent-gold px-4 py-2.5 rounded-full active:opacity-70"
              >
                <Text className="text-sm font-semibold text-white">{t("tools.budgetCalculator.exportPdf")}</Text>
              </Pressable>
              <Pressable onPress={reset} className="p-2.5 rounded-full border border-accent-rose-light active:opacity-70">
                <RotateCcw size={16} className="text-typography-500" />
              </Pressable>
            </View>
          </View>

          {/* Total indicator */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-base font-semibold text-typography-700">
              {t("tools.budgetCalculator.breakdown")}
            </Text>
            <View className={`px-3 py-1 rounded-full ${Math.abs(totalPercentage - 100) < 1 ? "bg-success-100" : "bg-warning-100"}`}>
              <Text className={`text-sm font-semibold ${Math.abs(totalPercentage - 100) < 1 ? "text-success-700" : "text-warning-700"}`}>
                {t("tools.budgetCalculator.total")}: {totalPercentage}%
              </Text>
            </View>
          </View>

          {/* Category rows */}
          <View className="gap-2">
            {categories.map((cat) => {
              const amount = budget ? (budget * cat.percentage) / 100 : 0;
              return (
                <View key={cat.key} className="bg-accent-cream rounded-xl p-3 flex-row items-center gap-3">
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-sm font-medium text-typography-800">
                        {t(`tools.budgetCalculator.categories.${cat.key}`)}
                      </Text>
                      <Text className="text-sm font-semibold text-typography-600">
                        {budget > 0 ? formatAmount(amount) : `${cat.percentage}%`}
                      </Text>
                    </View>
                    {/* Progress bar */}
                    <View className="h-2 bg-background-100 rounded-full overflow-hidden">
                      <View
                        className="h-full rounded-full bg-primary-400"
                        style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                      />
                    </View>
                  </View>
                  {/* Stepper */}
                  <View className="flex-row items-center gap-1">
                    <Pressable
                      onPress={() => updatePercentage(cat.key, -1)}
                      className="w-7 h-7 bg-white rounded-full items-center justify-center border border-accent-rose-light active:opacity-60"
                    >
                      <Text className="text-sm font-bold text-typography-600">−</Text>
                    </Pressable>
                    <Text className="text-sm font-semibold text-typography-800 w-8 text-center">
                      {cat.percentage}%
                    </Text>
                    <Pressable
                      onPress={() => updatePercentage(cat.key, 1)}
                      className="w-7 h-7 bg-white rounded-full items-center justify-center border border-accent-rose-light active:opacity-60"
                    >
                      <Text className="text-sm font-bold text-typography-600">+</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* App CTA */}
      <View className="w-full py-12 px-6 bg-accent-blush items-center">
        <View style={{ maxWidth: 600, width: "100%", alignItems: "center" }}>
          <Text className="text-xl font-bold text-typography-900 text-center mb-2">
            {t("tools.appCta.title")}
          </Text>
          <Text className="text-sm text-typography-500 text-center mb-5">
            {t("tools.appCta.description")}
          </Text>
          <Pressable
            onPress={() => router.push("/home" as any)}
            className="bg-primary-500 px-8 py-3 rounded-full active:opacity-70"
          >
            <Text className="text-sm font-semibold text-white">{t("tools.appCta.cta")}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
