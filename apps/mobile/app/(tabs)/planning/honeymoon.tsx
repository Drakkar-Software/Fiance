import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native-css/components";
import { useTranslation } from "react-i18next";
import * as Crypto from "expo-crypto";
import { Palmtree } from "lucide-react-native";
import { useHoneymoonStore } from "@/store/useHoneymoonStore";
import { EmptyState } from "@/components/EmptyState";
import { DateRow, FormCard, InputRow, SectionTitle } from "@/components/FormSection";
import { formatMoney } from "@/components/MoneyDisplay";
import { Display } from "@/components/Display";
import { analytics } from "@/lib/analytics";
import { useCanEditHere } from "@/lib/permissions/useCanEditHere";

export default function PlanningHoneymoonScreen() {
  const { t } = useTranslation("planning");
  const canEdit = useCanEditHere();
  const plan = useHoneymoonStore((s) => s.honeymoonPlans[0] ?? null);
  const setHoneymoonPlan = useHoneymoonStore((s) => s.setHoneymoonPlan);
  const updateHoneymoonPlan = useHoneymoonStore((s) => s.updateHoneymoonPlan);

  const [destination, setDestination] = useState(plan?.destination ?? "");
  const [startDate, setStartDate] = useState(plan?.startDate ?? "");
  const [endDate, setEndDate] = useState(plan?.endDate ?? "");
  const [budgetTarget, setBudgetTarget] = useState(plan?.budgetTarget?.toString() ?? "");
  const [spentAmount, setSpentAmount] = useState(plan?.spentAmount?.toString() ?? "");
  const [notes, setNotes] = useState(plan?.notes ?? "");

  const handleCreate = () => {
    const now = new Date().toISOString();
    setHoneymoonPlan({
      id: Crypto.randomUUID(),
      destination: null,
      startDate: null,
      endDate: null,
      budgetTarget: null,
      spentAmount: null,
      notes: null,
      itinerary: null,
      createdAt: now,
      updatedAt: now,
    });
    analytics.capture("honeymoon_plan_created");
  };

  const handleSave = () => {
    updateHoneymoonPlan({
      destination: destination.trim() || null,
      startDate: startDate || null,
      endDate: endDate || null,
      budgetTarget: budgetTarget ? parseFloat(budgetTarget) : null,
      spentAmount: spentAmount ? parseFloat(spentAmount) : null,
      notes: notes.trim() || null,
    });
  };

  if (!plan) {
    return (
      <View className="flex-1 bg-accent-paper">
        <EmptyState
          icon={Palmtree}
          title={t("honeymoon.empty")}
          description={t("honeymoon.emptyDesc")}
          actionLabel={canEdit ? t("honeymoon.newPlan") : undefined}
          onAction={canEdit ? handleCreate : undefined}
        />
      </View>
    );
  }

  const remaining = (plan.budgetTarget ?? 0) - (plan.spentAmount ?? 0);

  return (
    <ScrollView className="flex-1 bg-accent-paper px-4 pt-4" showsVerticalScrollIndicator={false}>
      {plan.budgetTarget != null && (
        <View className="bg-primary-50 dark:bg-primary-950 rounded-2xl p-4 mb-4 border border-primary-100 dark:border-primary-900 flex-row justify-between items-center">
          <View>
            <Text className="text-sm text-mute">{t("honeymoon.remaining")}</Text>
            <Display size={22} weight="500" color="#b96a4a">{formatMoney(remaining)}</Display>
          </View>
          <Text className="text-xs text-mute">
            {formatMoney(plan.spentAmount ?? 0)} / {formatMoney(plan.budgetTarget)}
          </Text>
        </View>
      )}

      <SectionTitle>{t("honeymoon.details")}</SectionTitle>
      <FormCard>
        <InputRow label={t("honeymoon.destination")} value={destination} onChangeText={setDestination} />
        <DateRow label={t("honeymoon.startDate")} value={startDate} onChange={setStartDate} />
        <DateRow label={t("honeymoon.endDate")} value={endDate} onChange={setEndDate} />
        <InputRow label={t("honeymoon.budgetTarget")} value={budgetTarget} onChangeText={setBudgetTarget} keyboardType="numeric" />
        <InputRow label={t("honeymoon.spentAmount")} value={spentAmount} onChangeText={setSpentAmount} keyboardType="numeric" />
      </FormCard>

      <SectionTitle>{t("honeymoon.notes")}</SectionTitle>
      <FormCard>
        <TextInput
          className="text-base text-ink-soft min-h-[80px]"
          placeholder={t("honeymoon.notesPlaceholder")}
          placeholderTextColor="#D0D0D8"
          value={notes}
          onChangeText={setNotes}
          multiline
          textAlignVertical="top"
          editable={canEdit}
        />
      </FormCard>

      {canEdit && (
        <Pressable onPress={handleSave} className="bg-primary-500 py-3 rounded-xl items-center mt-2 mb-8 active:bg-primary-600">
          <Text className="text-white font-semibold text-sm">{t("common:save")}</Text>
        </Pressable>
      )}
      <View className="h-24" />
    </ScrollView>
  );
}
