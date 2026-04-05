import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ChevronUp, ChevronDown } from "lucide-react-native";
import { format, differenceInDays } from "date-fns";
import { useBudgetSummary } from "@/store/useBudgetStore";
import { useVendorsStore } from "@/store/useVendorsStore";
import { VENDOR_STATUS_LABELS, VENDOR_STATUS_COLORS } from "@/db/types";
import type { VendorStatus } from "@/db/types";
import { ProgressBar } from "@/components/ProgressBar";
import { MoneyDisplay, formatMoney } from "@/components/MoneyDisplay";
import { StatusBadge } from "@/components/StatusBadge";

export default function BudgetScreen() {
  const router = useRouter();
  const budget = useBudgetSummary();
  const vendors = useVendorsStore((s) => s.vendors);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

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
          type: "Acompte",
          amount: v.depositAmount,
          dueDate: v.depositDueDate,
        });
      }
      if (v.balanceDueDate) {
        const balance = (v.basePrice || 0) - (v.depositAmount || 0);
        if (balance > 0) {
          payments.push({
            vendorName: v.name,
            type: "Solde",
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
      className="flex-1 bg-gray-50 dark:bg-gray-950"
      showsVerticalScrollIndicator={false}
    >
      {/* Global summary */}
      <View className="bg-white dark:bg-gray-900 mx-4 mt-4 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-base font-semibold text-gray-900 dark:text-white">
            Budget global
          </Text>
          {budget.isEstimate && (
            <View className="bg-blue-50 dark:bg-blue-900 px-2.5 py-1 rounded-full">
              <Text className="text-xs text-blue-600 dark:text-blue-300 font-medium">
                Estimation
              </Text>
            </View>
          )}
        </View>

        <View className="flex-row justify-between mb-1.5">
          <Text className="text-sm text-gray-400">Budget cible</Text>
          <MoneyDisplay amount={budget.budgetTarget} size="sm" />
        </View>
        <View className="flex-row justify-between mb-1.5">
          <Text className="text-sm text-gray-400">Total engagé</Text>
          <MoneyDisplay amount={budget.totalEngaged} size="sm" />
        </View>
        <View className="flex-row justify-between mb-4">
          <Text className="text-sm text-gray-400">Total confirmé</Text>
          <MoneyDisplay amount={budget.totalConfirmed} size="sm" />
        </View>

        <ProgressBar
          value={budget.totalEngaged}
          max={budget.budgetTarget}
          colorScheme="budget"
          showPercentage
        />

        <View className="flex-row justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Reste à engager
          </Text>
          <Text
            className={`text-xl font-bold ${
              budget.remaining >= 0 ? "text-emerald-500" : "text-red-500"
            }`}
          >
            {formatMoney(budget.remaining)}
          </Text>
        </View>
      </View>

      {/* Deposits summary */}
      <View className="bg-white dark:bg-gray-900 mx-4 mt-3 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
        <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Acomptes
        </Text>
        <View className="flex-row justify-between mb-2">
          <Text className="text-sm text-gray-400">Versés</Text>
          <Text className="text-sm font-semibold text-emerald-500">
            {formatMoney(budget.depositsPaid)}
          </Text>
        </View>
        <View className="flex-row justify-between mb-3">
          <Text className="text-sm text-gray-400">Total prévu</Text>
          <Text className="text-sm font-semibold text-gray-900 dark:text-white">
            {formatMoney(budget.depositsTotal)}
          </Text>
        </View>
        <ProgressBar
          value={budget.depositsPaid}
          max={budget.depositsTotal}
          showPercentage={false}
        />
      </View>

      {/* Categories breakdown */}
      <View className="px-4 mt-6 mb-3 flex-row items-center">
        <Text className="text-base font-bold text-gray-900 dark:text-white">
          Par catégorie
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

          return (
            <View key={cat.categoryName} className="mx-4 mb-2">
              <Pressable
                onPress={() =>
                  setExpandedCategory(isExpanded ? null : cat.categoryName)
                }
                className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-base font-medium text-gray-900 dark:text-white">
                      {cat.categoryName}
                    </Text>
                    <Text className="text-xs text-gray-400 mt-0.5">
                      {cat.vendors.length} prestataire
                      {cat.vendors.length > 1 ? "s" : ""} · {catPercent}% du
                      budget
                    </Text>
                  </View>
                  <View className="items-end mr-2">
                    <Text className="text-base font-bold text-gray-900 dark:text-white">
                      {formatMoney(cat.totalEngaged)}
                    </Text>
                    <Text className="text-xs text-emerald-500">
                      {formatMoney(cat.totalConfirmed)} confirmé
                    </Text>
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
                    max={budget.budgetTarget > 0 ? budget.budgetTarget : 1}
                    showPercentage={false}
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
                        pathname: "/(tabs)/prestataires/[type]/[id]",
                        params: { type: vendor.type, id: vendor.id },
                      })
                    }
                    className="bg-gray-50 dark:bg-gray-800 mx-2 mt-1.5 rounded-xl p-3 active:opacity-80"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-gray-900 dark:text-white">
                          {vendor.name}
                        </Text>
                        <View className="flex-row items-center gap-2 mt-1">
                          <StatusBadge
                            label={
                              VENDOR_STATUS_LABELS[
                                vendor.status as VendorStatus
                              ] || ""
                            }
                            color={
                              VENDOR_STATUS_COLORS[
                                vendor.status as VendorStatus
                              ] || "#9CA3AF"
                            }
                          />
                          {vendor.depositPaid && (
                            <Text className="text-xs text-emerald-500 font-medium">
                              Acompte versé
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
          <Text className="text-xs text-gray-400 mb-2 uppercase tracking-wider">
            Catégories sans prestataire
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {budget.categories
              .filter((c) => c.vendors.length === 0)
              .map((c) => (
                <View
                  key={c.categoryName}
                  className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-full"
                >
                  <Text className="text-sm text-gray-400">
                    {c.categoryName}
                  </Text>
                </View>
              ))}
          </View>
        </View>
      )}

      {/* Upcoming payments */}
      {upcomingPayments.length > 0 && (
        <View className="mx-4 mt-6 mb-4">
          <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
            Paiements à venir
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
                className={`bg-white dark:bg-gray-900 rounded-xl p-3.5 mb-2 border active:opacity-80 ${
                  isUrgent
                    ? "border-red-200 dark:border-red-800"
                    : "border-gray-100 dark:border-gray-800"
                }`}
                style={isUrgent ? { borderLeftWidth: 3, borderLeftColor: "#EF4444" } : {}}
              >
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-sm font-medium text-gray-900 dark:text-white">
                      {payment.type} — {payment.vendorName}
                    </Text>
                    <Text className="text-xs text-gray-400 mt-0.5">
                      {format(new Date(payment.dueDate), "dd/MM/yyyy")}
                      {days >= 0 ? ` · dans ${days}j` : " · passé"}
                    </Text>
                  </View>
                  <Text className="text-base font-bold text-gray-900 dark:text-white">
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
