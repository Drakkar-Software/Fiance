import React, { useState, useMemo } from "react";
import { Platform } from "react-native";
import { View, Text, Pressable, TextInput } from "react-native-css/components";
import { useTranslation } from "react-i18next";
import { ArrowLeft, RotateCcw, Download } from "lucide-react-native";
import { Display } from "@/components/Display";
import { MarketingLink } from "@/components/marketing/MarketingLink";
import { Seo } from "@/components/Seo";
import { exportToPdf } from "@fiance/ui/utils/file-export";
import { localizedSeo, localizedUrl, localizedPath } from "@/lib/seo-urls";
import { ConicRing } from "@/components/marketing/ConicRing";

interface Category {
  key: string;
  percentage: number;
  color: string;
}

const DEFAULT_CATEGORIES: Category[] = [
  { key: "venue", percentage: 38, color: "#b96a4a" },
  { key: "catering", percentage: 15, color: "#c9922f" },
  { key: "photography", percentage: 10, color: "#6e7a4a" },
  { key: "music", percentage: 5, color: "#6b8aa3" },
  { key: "decoration", percentage: 8, color: "#cf8a5a" },
  { key: "dress", percentage: 6, color: "#a3502f" },
  { key: "transport", percentage: 3, color: "#8ea36f" },
  { key: "beauty", percentage: 3, color: "#d9a441" },
  { key: "rings", percentage: 4, color: "#7d9bb3" },
  { key: "invitations", percentage: 2, color: "#b58a5a" },
  { key: "honeymoon", percentage: 3, color: "#5f7a52" },
  { key: "misc", percentage: 3, color: "#a49a88" },
];

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);
}

export default function BudgetCalculatorTool() {
  const { t, i18n } = useTranslation("marketing");
  const lang = i18n.language === "en" ? "en" : "fr";
  const seo = localizedSeo(lang, "/tools/budget-calculator");

  const [totalBudget, setTotalBudget] = useState("15000");
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);

  const budget = parseFloat(totalBudget.replace(/[^\d.]/g, "")) || 0;

  const totalPercentage = useMemo(
    () => categories.reduce((sum, c) => sum + c.percentage, 0),
    [categories]
  );
  const isBalanced = Math.abs(totalPercentage - 100) < 1;

  const ringSegments = useMemo(
    () =>
      categories.map((c) => ({
        percent: totalPercentage > 0 ? (c.percentage / totalPercentage) * 100 : 0,
        color: c.color,
      })),
    [categories, totalPercentage]
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
        {...seo}
        jsonLd={[
          { "@type": "WebApplication", name: t("tools.budgetCalculator.meta.title"),
            url: seo.canonical,
            applicationCategory: "UtilityApplication",
            offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" } },
          { "@type": "BreadcrumbList", itemListElement: [
            { "@type": "ListItem", position: 1, name: "Fiancé", item: localizedUrl(lang, "/") },
            { "@type": "ListItem", position: 2, name: t("tools.budgetCalculator.meta.title"), item: seo.canonical },
          ]},
        ]}
      />
      {/* Header */}
      <View className="w-full py-12 px-6 bg-accent-cream">
        <View style={{ maxWidth: 900, width: "100%", alignSelf: "center" }}>
          <MarketingLink
            href={localizedPath(lang, "/feature/budget") as any}
            title={t("tools.backToTools")}
            className="flex-row items-center gap-1 mb-6 active:opacity-60"
          >
            <ArrowLeft size={14} className="text-typography-500" />
            <Text className="text-sm text-typography-500">{t("tools.backToTools")}</Text>
          </MarketingLink>
          <Display as="h1" size={32} weight="700" style={{ marginBottom: 8, lineHeight: 40 }}>
            {t("tools.budgetCalculator.title")}
          </Display>
          <Text className="text-base text-typography-500">{t("tools.budgetCalculator.subtitle")}</Text>
        </View>
      </View>

      {/* Tool body — sticky aside (total + donut + actions) + category panel */}
      <View className="w-full py-8 px-6 bg-white">
        <View
          className="flex-row flex-wrap"
          style={{ maxWidth: 900, width: "100%", alignSelf: "center", gap: 24, alignItems: "flex-start" }}
        >
          {/* Aside */}
          <View
            style={[
              { flexBasis: 300, flexGrow: 1, maxWidth: 340, gap: 14 },
              Platform.OS === "web" ? ({ position: "sticky", top: 88 } as any) : null,
            ]}
          >
            <View className="bg-accent-cream rounded-2xl p-5">
              <Text className="text-sm font-semibold text-typography-700 mb-2">
                {t("tools.budgetCalculator.totalBudget")}
              </Text>
              <View className="flex-row items-center gap-2 mb-5">
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

              <View className="items-center justify-center mb-4" style={{ position: "relative", height: 150 }}>
                <ConicRing size={150} strokeWidth={16} segments={ringSegments} />
                <View style={{ position: "absolute", alignItems: "center" }}>
                  <Text className="text-lg font-bold text-typography-900">{formatAmount(budget)}</Text>
                  <Text className={`text-xs font-semibold ${isBalanced ? "text-success-700" : "text-warning-700"}`}>
                    {totalPercentage}%
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-2">
                <Pressable
                  onPress={handleExport}
                  className="flex-1 flex-row items-center justify-center gap-1.5 bg-accent-gold rounded-full py-3 active:opacity-70"
                >
                  <Download size={14} className="text-white" />
                  <Text className="text-sm font-semibold text-white">{t("tools.budgetCalculator.exportPdf")}</Text>
                </Pressable>
                <Pressable
                  onPress={reset}
                  className="items-center justify-center bg-white rounded-full px-3.5 border border-accent-rose-light active:opacity-70"
                >
                  <RotateCcw size={15} className="text-typography-500" />
                </Pressable>
              </View>
            </View>
            <Text className="text-xs text-typography-400 text-center leading-4">
              {t("tools.budgetCalculator.adjust")}
            </Text>
          </View>

          {/* Category list */}
          <View className="bg-accent-cream rounded-2xl px-4" style={{ flexGrow: 2, flexBasis: 380, minWidth: 280 }}>
            {categories.map((cat, i) => {
              const amount = budget ? (budget * cat.percentage) / 100 : 0;
              return (
                <View
                  key={cat.key}
                  className={`flex-row items-center gap-3 py-3.5 ${i < categories.length - 1 ? "border-b border-accent-rose-light" : ""}`}
                >
                  <View style={{ width: 11, height: 11, borderRadius: 3, backgroundColor: cat.color }} />
                  <View className="flex-1">
                    <View className="flex-row items-baseline justify-between gap-2 mb-1">
                      <Text className="text-sm font-medium text-typography-800">
                        {t(`tools.budgetCalculator.categories.${cat.key}`)}
                      </Text>
                      <Text className="text-sm font-semibold text-typography-900">
                        {budget > 0 ? formatAmount(amount) : `${cat.percentage}%`}
                      </Text>
                    </View>
                    <View className="h-2 bg-background-100 rounded-full overflow-hidden">
                      <View
                        style={{
                          height: "100%",
                          borderRadius: 999,
                          width: `${Math.min(cat.percentage, 100)}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </View>
                  </View>
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
          <Display as="h2" size={22} weight="600" style={{ textAlign: "center", marginBottom: 8 }}>
            {t("tools.appCta.title")}
          </Display>
          <Text className="text-sm text-typography-500 text-center mb-5">
            {t("tools.appCta.description")}
          </Text>
          <MarketingLink
            href="/home"
            title={t("tools.appCta.cta")}
            className="bg-primary-500 px-8 py-3 rounded-full active:opacity-70"
          >
            <Text className="text-sm font-semibold text-white">{t("tools.appCta.cta")}</Text>
          </MarketingLink>
        </View>
      </View>
    </View>
  );
}
