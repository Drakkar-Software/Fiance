import React, { useState, useCallback, useMemo } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native-css/components";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ChevronUp, ChevronDown, Target } from "lucide-react-native";
import { format, differenceInDays } from "date-fns";
import { useBudgetSummary } from "@/store/useBudgetStore";
import { useVendorsStore } from "@/store/useVendorsStore";
import { useWeddingStore } from "@/store/useWeddingStore";
import {
  VENDOR_STATUS_LABELS, VENDOR_STATUS_COLORS, BUDGET_CATEGORY_LABELS,
  BUDGET_CATEGORIES, BUDGET_ALLOCATION_TEMPLATES, BUDGET_TEMPLATE_LABELS,
} from "@/db/types";
import type { VendorStatus } from "@/db/types";
import { ProgressBar } from "@/components/ProgressBar";
import { MoneyDisplay, formatMoney } from "@/components/MoneyDisplay";
import { StatusBadge } from "@/components/StatusBadge";
import { InputRow, ChipSelect } from "@/components/FormSection";
import { analytics } from "@/lib/analytics";
import { Display } from "@/components/Display";
import { PageHeader } from "@/components/PageHeader";
import { Sprig } from "@/components/Sprig";

export default function BudgetScreen() {
  const { t } = useTranslation("budget");
  const router = useRouter();
  const budget = useBudgetSummary();
  const vendors = useVendorsStore((s) => s.vendors);
  const wedding = useWeddingStore((s) => s.wedding);
  const updateWedding = useWeddingStore((s) => s.updateWedding);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showTargets, setShowTargets] = useState(false);

  const categoryBudgetsRaw = useWeddingStore((s) => s.wedding?.categoryBudgets);
  const categoryBudgets: Record<string, number> = useMemo(() => {
    if (!categoryBudgetsRaw) return {};
    try { return JSON.parse(categoryBudgetsRaw); } catch { return {}; }
  }, [categoryBudgetsRaw]);

  const setCategoryTarget = useCallback((cat: string, value: string) => {
    const updated = { ...categoryBudgets };
    if (value) updated[cat] = parseFloat(value) || 0;
    else delete updated[cat];
    updateWedding({ categoryBudgets: JSON.stringify(updated) });
  }, [categoryBudgets, updateWedding]);

  const applyTemplate = useCallback((templateKey: string) => {
    const tpl = BUDGET_ALLOCATION_TEMPLATES[templateKey];
    if (!tpl) return;
    const total = tpl.budget;
    const targets: Record<string, number> = {};
    for (const [cat, ratio] of Object.entries(tpl.ratios)) {
      targets[cat] = Math.round(total * ratio);
    }
    _setBudgetTarget(total.toString());
    updateWedding({ budgetTarget: total, categoryBudgets: JSON.stringify(targets) });
    analytics.capture("budget_template_applied", { template: templateKey });
  }, [updateWedding]);

  const [budgetTarget, _setBudgetTarget] = useState(
    wedding?.budgetTarget?.toString() || ""
  );
  const setBudgetTarget = useCallback((value: string) => {
    _setBudgetTarget(value);
    updateWedding({ budgetTarget: value ? parseFloat(value) : null });
  }, []);

  const [currency, _setCurrency] = useState(wedding?.currency || "EUR");
  const setCurrency = useCallback((value: string) => {
    _setCurrency(value);
    updateWedding({ currency: value || "EUR" });
  }, []);

  // Upcoming payments
  const upcomingPayments = vendors
    .filter((v) => {
      if (v.status === "CANCELLED") return false;
      return (
        (v.depositDueDate && !v.depositPaid) ||
        v.balanceDueDate
      );
    })
    .flatMap((v) => {
      const payments = [];
      if (v.depositDueDate && !v.depositPaid && v.depositAmount) {
        payments.push({
          vendorName: v.name,
          type: "depositPayment",
          amount: v.depositAmount,
          dueDate: v.depositDueDate,
        });
      }
      if (v.balanceDueDate) {
        const balance = (v.basePrice || 0) - (v.depositAmount || 0);
        if (balance > 0) {
          payments.push({
            vendorName: v.name,
            type: "balancePayment",
            amount: balance,
            dueDate: v.balanceDueDate,
          });
        }
      }
      return payments;
    })
    .sort(
      (a, b) =>
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );

  return (
    <ScrollView
      className="flex-1 bg-accent-paper"
      showsVerticalScrollIndicator={false}
    >
      <PageHeader
        eyebrow={t("common:tabs.budget")}
        title={formatMoney(budget.totalEngaged)}
        tagline={t("pageTagline")}
        titleSize={44}
      />

      {/* Global summary */}
      <View className="bg-accent-card mx-4 mt-4 rounded-2xl p-5 border border-hair" style={{ overflow: "visible" }}>
        <View style={{ position: "absolute", top: -10, right: 14 }}>
          <Sprig size={20} color="#c9922f" angle={12} />
        </View>
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-base font-semibold text-ink">
            {t("globalBudget")}
          </Text>
          {budget.isEstimate && (
            <View className="bg-blue-50 dark:bg-blue-900 px-2.5 py-1 rounded-full">
              <Text className="text-xs text-blue-600 dark:text-blue-300 font-medium">
                {t("estimate")}
              </Text>
            </View>
          )}
        </View>

        <InputRow
          label={t("targetBudget")}
          value={budgetTarget}
          onChangeText={setBudgetTarget}
          placeholder="30000"
          keyboardType="numeric"
        />
        <View className="mt-1 mb-3">
          <Text className="text-xs text-mute mb-2 font-medium">{t("currency")}</Text>
          <ChipSelect
            options={["EUR", "USD"] as const}
            value={currency as "EUR" | "USD"}
            onChange={setCurrency}
            labels={{ EUR: "€ Euro", USD: "$ Dollar" }}
          />
        </View>
        <View className="flex-row justify-between mb-1.5">
          <Text className="text-sm text-mute">{t("totalCommitted")}</Text>
          <MoneyDisplay amount={budget.totalEngaged} size="sm" />
        </View>
        <View className="flex-row justify-between mb-4">
          <Text className="text-sm text-mute">{t("totalConfirmed")}</Text>
          <MoneyDisplay amount={budget.totalConfirmed} size="sm" />
        </View>

        <ProgressBar
          value={budget.totalEngaged}
          max={budget.budgetTarget}
          colorScheme="budget"
          showPercentage
        />

        <View className="flex-row justify-between mt-4 pt-4 border-t border-hair">
          <Text className="text-sm font-medium text-mute">
            {t("remainingToPay")}
          </Text>
          <Display
            size={22}
            weight="500"
            color={budget.remainingToPay >= 0 ? "#10B981" : "#EF4444"}
          >
            {formatMoney(budget.remainingToPay)}
          </Display>
        </View>
        {budget.budgetTarget > 0 && (
          <View className="flex-row justify-between mt-2">
            <Text className="text-sm text-mute">
              {t("remaining")}
            </Text>
            <Text
              className={`text-sm font-medium ${
                budget.remaining >= 0 ? "text-mute" : "text-red-500"
              }`}
            >
              {formatMoney(budget.remaining)}
            </Text>
          </View>
        )}
      </View>

      {/* Deposits summary */}
      <View className="bg-accent-card mx-4 mt-3 rounded-2xl p-5 border border-hair">
        <Text className="text-base font-semibold text-ink mb-3">
          {t("deposits")}
        </Text>
        <View className="flex-row justify-between mb-2">
          <Text className="text-sm text-mute">{t("paid")}</Text>
          <Text className="text-sm font-semibold text-emerald-500">
            {formatMoney(budget.depositsPaid)}
          </Text>
        </View>
        <View className="flex-row justify-between mb-3">
          <Text className="text-sm text-mute">{t("totalExpected")}</Text>
          <Text className="text-sm font-semibold text-ink">
            {formatMoney(budget.depositsTotal)}
          </Text>
        </View>
        <ProgressBar
          value={budget.depositsPaid}
          max={budget.depositsTotal}
          showPercentage={false}
        />
      </View>

      {/* Category targets */}
      <Pressable
        onPress={() => setShowTargets((v) => !v)}
        className="mx-4 mt-3 bg-accent-card rounded-2xl p-4 border border-hair flex-row items-center justify-between"
      >
        <View className="flex-row items-center gap-2">
          <Target size={17} color="#b96a4a" />
          <Text className="text-base font-semibold text-ink">
            {t("categoryTarget")}
          </Text>
        </View>
        {showTargets ? <ChevronUp size={18} color="#C0C0C8" /> : <ChevronDown size={18} color="#C0C0C8" />}
      </Pressable>

      {showTargets && (
        <View className="mx-4 mt-1 bg-accent-card rounded-2xl p-4 border border-hair">
          {/* Template picker */}
          {budget.budgetTarget > 0 && (
            <View className="mb-4">
              <Text className="text-xs text-mute font-medium mb-2 uppercase tracking-wider">
                {t("useTemplate")}
              </Text>
              <View className="flex-row gap-2">
                {Object.keys(BUDGET_ALLOCATION_TEMPLATES).map((key) => (
                  <Pressable
                    key={key}
                    onPress={() => applyTemplate(key)}
                    className="flex-1 py-3 rounded-xl border border-hair items-center justify-center active:bg-primary-50 dark:active:bg-primary-900"
                  >
                    <Text className="text-xs font-medium text-mute dark:text-mute text-center">
                      {t(BUDGET_TEMPLATE_LABELS[key])}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Per-category targets */}
          {Object.keys(BUDGET_CATEGORIES).map((cat, idx) => {
            const catData = budget.categories.find((c) => c.categoryName === cat);
            const target = categoryBudgets[cat];
            const spent = catData?.totalEngaged ?? 0;
            const isOver = target && spent > target;
            return (
              <View
                key={cat}
                className={`flex-row items-center py-2.5 ${idx < Object.keys(BUDGET_CATEGORIES).length - 1 ? "border-b border-hair" : ""}`}
              >
                <Text className="flex-1 text-sm text-ink-soft">
                  {t(BUDGET_CATEGORY_LABELS[cat])}
                </Text>
                {spent > 0 && (
                  <Text className={`text-xs font-medium mr-2 ${isOver ? "text-red-500" : "text-mute"}`}>
                    {formatMoney(spent)}
                  </Text>
                )}
                <View className="w-24 bg-accent-paper rounded-lg px-2 py-1">
                  <TextInput
                    className="text-sm text-ink text-right"
                    value={target ? target.toString() : ""}
                    onChangeText={(v) => setCategoryTarget(cat, v)}
                    placeholder="—"
                    placeholderTextColor="#C0C0C8"
                    keyboardType="numeric"
                  />
                </View>
                {isOver && (
                  <View className="ml-2 bg-red-50 dark:bg-red-900 px-1.5 py-0.5 rounded-md">
                    <Text className="text-xs text-red-500 font-medium">
                      +{formatMoney(spent - target!)}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Categories breakdown */}
      <View className="px-4 mt-6 mb-3 flex-row items-center">
        <Text className="text-base font-bold text-ink">
          {t("byCategory")}
        </Text>
      </View>

      {budget.categories
        .filter((c) => c.vendors.length > 0)
        .map((cat) => {
          const isExpanded = expandedCategory === cat.categoryName;
          const catPercent =
            budget.budgetTarget > 0
              ? Math.round((cat.totalEngaged / budget.budgetTarget) * 100)
              : 0;
          const hasTarget = cat.targetAmount != null && cat.targetAmount > 0;
          const progressMax = hasTarget ? cat.targetAmount! : (budget.budgetTarget > 0 ? budget.budgetTarget : 1);

          return (
            <View key={cat.categoryName} className="mx-4 mb-2">
              <Pressable
                onPress={() =>
                  setExpandedCategory(isExpanded ? null : cat.categoryName)
                }
                className="bg-accent-card rounded-2xl p-4 border border-hair"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-base font-medium text-ink">
                      {t(BUDGET_CATEGORY_LABELS[cat.categoryName])}
                    </Text>
                    <Text className="text-xs text-mute mt-0.5">
                      {t("vendor", { count: cat.vendors.length })}
                      {hasTarget
                        ? ` · ${formatMoney(cat.totalEngaged)} / ${formatMoney(cat.targetAmount!)}`
                        : ` · ${catPercent}% ${t("ofBudget")}`}
                    </Text>
                  </View>
                  <View className="items-end mr-2">
                    <Text className="text-base font-bold text-ink">
                      {formatMoney(cat.totalEngaged)}
                    </Text>
                    <Text className="text-xs text-emerald-500">
                      {t("confirmedAmount", { amount: formatMoney(cat.totalConfirmed) })}
                    </Text>
                    {cat.overage > 0 && (
                      <Text className="text-xs text-red-500 font-medium">
                        +{formatMoney(cat.overage)}
                      </Text>
                    )}
                  </View>
                  {isExpanded ? (
                    <ChevronUp size={18} color="#C0C0C8" />
                  ) : (
                    <ChevronDown size={18} color="#C0C0C8" />
                  )}
                </View>
                <View className="mt-3">
                  <ProgressBar
                    value={cat.totalEngaged}
                    max={progressMax}
                    colorScheme={hasTarget ? "budget" : "default"}
                    showPercentage={hasTarget}
                  />
                </View>
              </Pressable>

              {/* Expanded vendor list */}
              {isExpanded &&
                cat.vendors.map(({ vendor, calculatedTotal, isBooked }) => (
                  <Pressable
                    key={vendor.id}
                    onPress={() =>
                      router.push({
                        pathname: "/(tabs)/vendors/[type]/[id]",
                        params: { type: vendor.type, id: vendor.id },
                      })
                    }
                    className="bg-accent-paper mx-2 mt-1.5 rounded-xl p-3 active:opacity-80"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-ink">
                          {vendor.name}
                        </Text>
                        <View className="flex-row items-center gap-2 mt-1">
                          <StatusBadge
                            label={
                              t(VENDOR_STATUS_LABELS[
                                vendor.status as VendorStatus
                              ] || "")
                            }
                            color={
                              VENDOR_STATUS_COLORS[
                                vendor.status as VendorStatus
                              ] || "#9CA3AF"
                            }
                          />
                          {vendor.depositPaid && (
                            <Text className="text-xs text-emerald-500 font-medium">
                              {t("depositPaid")}
                            </Text>
                          )}
                        </View>
                      </View>
                      <MoneyDisplay
                        amount={calculatedTotal}
                        size="sm"
                        isDynamic={!!vendor.pricePerPerson}
                      />
                    </View>
                  </Pressable>
                ))}
            </View>
          );
        })}

      {/* Empty categories */}
      {budget.categories.filter((c) => c.vendors.length === 0).length > 0 && (
        <View className="mx-4 mt-4 mb-2">
          <Text className="text-xs text-mute mb-2 uppercase tracking-wider">
            {t("noVendorCategories")}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {budget.categories
              .filter((c) => c.vendors.length === 0)
              .map((c) => (
                <View
                  key={c.categoryName}
                  className="px-3 py-1.5 bg-accent-card border border-hair rounded-full"
                >
                  <Text className="text-sm text-mute">
                    {t(BUDGET_CATEGORY_LABELS[c.categoryName])}
                  </Text>
                </View>
              ))}
          </View>
        </View>
      )}

      {/* Upcoming payments */}
      {upcomingPayments.length > 0 && (
        <View className="mx-4 mt-6 mb-4">
          <Text className="text-base font-bold text-ink mb-3">
            {t("upcomingPayments")}
          </Text>
          {upcomingPayments.slice(0, 10).map((payment, idx) => {
            const days = differenceInDays(
              new Date(payment.dueDate),
              new Date()
            );
            const isUrgent = days >= 0 && days <= 7;

            return (
              <View
                key={idx}
                className={`bg-accent-card rounded-xl p-3.5 mb-2 border active:opacity-80 ${
                  isUrgent
                    ? "border-red-200 dark:border-red-800"
                    : "border-hair"
                }`}
                style={isUrgent ? { borderLeftWidth: 3, borderLeftColor: "#EF4444" } : {}}
              >
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-sm font-medium text-ink">
                      {t(payment.type)} — {payment.vendorName}
                    </Text>
                    <Text className="text-xs text-mute mt-0.5">
                      {format(new Date(payment.dueDate), "dd/MM/yyyy")}
                      {days >= 0 ? ` · ${t("inDays", { days })}` : ` · ${t("pastDue")}`}
                    </Text>
                  </View>
                  <Text className="text-base font-bold text-ink">
                    {formatMoney(payment.amount)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <View className="h-8" />
    </ScrollView>
  );
}
