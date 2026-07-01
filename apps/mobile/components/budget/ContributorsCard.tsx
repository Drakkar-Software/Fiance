import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native-css/components";
import { useTranslation } from "react-i18next";
import { Users, ChevronUp, ChevronDown, Plus, X } from "lucide-react-native";
import * as Crypto from "expo-crypto";
import { Sheet } from "@fiance/ui/components";
import {
  parseContributorAllocations,
  calculateContributorTotal,
  resolveAllocationAmount,
} from "@fiance/sdk";
import { InputRow, ChipSelect } from "@/components/FormSection";
import { Avatar } from "@/components/Avatar";
import { Chip } from "@/components/Chip";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { MoneyDisplay, formatMoney } from "@/components/MoneyDisplay";
import { useContributorsStore } from "@/store/useContributorsStore";
import { BUDGET_CATEGORIES, BUDGET_CATEGORY_LABELS } from "@/db/types";
import type { Contributor } from "@/db/schema";
import type { BudgetCategoryItem } from "@/store/useBudgetStore";

interface ContributorsCardProps {
  target: number;
  categories: BudgetCategoryItem[];
  categoryBudgets: Record<string, number>;
}

export function ContributorsCard({ target, categories, categoryBudgets }: ContributorsCardProps) {
  const { t } = useTranslation("budget");
  const contributors = useContributorsStore((s) => s.contributors);
  const addContributor = useContributorsStore((s) => s.addContributor);
  const updateContributor = useContributorsStore((s) => s.updateContributor);
  const removeContributor = useContributorsStore((s) => s.removeContributor);

  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState<Contributor | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Per-category euro base for allocations: prefer the category's own target, fall back
  // to what's already committed there so a % still resolves to something meaningful.
  const categoryAmounts = useMemo(() => {
    const amounts: Record<string, number> = {};
    for (const key of Object.keys(BUDGET_CATEGORIES)) {
      const catData = categories.find((c) => c.categoryName === key);
      amounts[key] = categoryBudgets[key] ?? catData?.totalEngaged ?? 0;
    }
    return amounts;
  }, [categories, categoryBudgets]);

  const contributorTotals = useMemo(
    () =>
      contributors.map((contributor) => ({
        contributor,
        amount: calculateContributorTotal(contributor, target, categoryAmounts),
      })),
    [contributors, target, categoryAmounts]
  );

  const covered = contributorTotals.reduce((sum, c) => sum + c.amount, 0);
  const remaining = target - covered;
  const coveredPercent = target > 0 ? Math.round((covered / target) * 100) : 0;
  const exceeds = target > 0 && covered > target;

  const openAdd = () => {
    setEditing(null);
    setShowForm(true);
  };
  const openEdit = (contributor: Contributor) => {
    setEditing(contributor);
    setShowForm(true);
  };

  return (
    <>
      <View className="mx-4 mt-3">
        <Pressable
          onPress={() => setExpanded((v) => !v)}
          className="bg-accent-card rounded-2xl p-4 border border-hair flex-row items-center justify-between"
        >
          <View className="flex-row items-center gap-2 flex-1 mr-2">
            <Users size={17} color="#b96a4a" />
            <View className="flex-1">
              <Text className="text-base font-semibold text-ink">{t("contributors.title")}</Text>
              <Text className="text-xs text-mute mt-0.5">{t("contributors.subtitle")}</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            {target > 0 && contributors.length > 0 && (
              <View className="bg-accent-olive-soft px-2.5 py-1 rounded-full">
                <Text className="text-xs text-accent-olive font-medium">
                  {t("contributors.covered", { percent: coveredPercent })}
                </Text>
              </View>
            )}
            <Pressable
              onPress={openAdd}
              className="flex-row items-center bg-primary-500 px-3 py-1.5 rounded-full active:opacity-80"
            >
              <Plus size={14} color="#fff" />
              <Text className="text-white text-xs font-semibold ml-1">{t("common:add")}</Text>
            </Pressable>
            {expanded ? (
              <ChevronUp size={18} color="#C0C0C8" />
            ) : (
              <ChevronDown size={18} color="#C0C0C8" />
            )}
          </View>
        </Pressable>

        {expanded && (
          <View className="mt-1 bg-accent-card rounded-2xl p-4 border border-hair">
            {contributors.length === 0 ? (
              <View className="border border-dashed border-hair rounded-xl py-6 items-center px-4">
                <Text className="text-sm text-mute text-center">{t("contributors.empty")}</Text>
              </View>
            ) : (
              <>
                {contributorTotals.map(({ contributor, amount }, idx) => (
                  <Pressable
                    key={contributor.id}
                    onPress={() => openEdit(contributor)}
                    className={`flex-row items-center py-2.5 ${
                      idx < contributorTotals.length - 1 ? "border-b border-hair" : ""
                    }`}
                  >
                    <Avatar ini={contributor.name.slice(0, 2)} size={32} />
                    <View className="flex-1 ml-3">
                      <Text className="text-sm font-medium text-ink">{contributor.name}</Text>
                      <View className="flex-row flex-wrap gap-1 mt-1.5">
                        {parseContributorAllocations(contributor.allocations).map((allocation, i) => (
                          <Chip key={i}>
                            {`${allocation.share}% ${
                              allocation.scope === "global"
                                ? t("contributors.global")
                                : t(BUDGET_CATEGORY_LABELS[allocation.scope] || "")
                            }`}
                          </Chip>
                        ))}
                      </View>
                    </View>
                    <MoneyDisplay amount={amount} size="sm" />
                  </Pressable>
                ))}

                {target > 0 && (
                  <View className="mt-3 pt-3 border-t border-hair">
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-mute">{t("contributors.coveredAmount")}</Text>
                      <Text className="text-sm font-semibold text-ink">{formatMoney(covered)}</Text>
                    </View>
                    <View className="flex-row justify-between mt-1">
                      <Text className="text-sm text-mute">{t("contributors.remainingToFinance")}</Text>
                      <Text
                        className={`text-sm font-medium ${
                          remaining >= 0 ? "text-mute" : "text-red-500"
                        }`}
                      >
                        {formatMoney(Math.max(remaining, 0))}
                      </Text>
                    </View>
                    {exceeds && (
                      <Text className="text-xs text-red-500 font-medium mt-1.5">
                        {t("contributors.exceeds")}
                      </Text>
                    )}
                  </View>
                )}
              </>
            )}
          </View>
        )}
      </View>

      <ContributorSheet
        visible={showForm}
        contributor={editing}
        onDismiss={() => setShowForm(false)}
        onSave={(data) => {
          if (editing) {
            updateContributor(editing.id, data);
          } else {
            const now = new Date().toISOString();
            addContributor({ id: Crypto.randomUUID(), ...data, createdAt: now, updatedAt: now });
          }
          setShowForm(false);
        }}
        onDelete={
          editing
            ? () => {
                setDeleteId(editing.id);
                setShowForm(false);
              }
            : undefined
        }
        categoryAmounts={categoryAmounts}
        globalTarget={target}
      />

      <ConfirmSheet
        visible={!!deleteId}
        title={t("contributors.deleteTitle")}
        message=""
        confirmLabel={t("common:delete")}
        destructive
        onConfirm={() => {
          if (deleteId) removeContributor(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}

interface ContributorFormData {
  name: string;
  allocations: string | null;
}

/** Allocation row while being edited: `share` stays a raw string bound to the input,
 * only parsed to a number for the live preview and on save — mirrors how every other
 * numeric field in this app (targetBudget, gift price, ...) avoids round-tripping a
 * parsed number back through the controlled `value`, which drops digits mid-typing. */
interface AllocationDraft {
  scope: string;
  share: string;
}

function ContributorSheet({
  visible,
  contributor,
  onDismiss,
  onSave,
  onDelete,
  categoryAmounts,
  globalTarget,
}: {
  visible: boolean;
  contributor: Contributor | null;
  onDismiss: () => void;
  onSave: (data: ContributorFormData) => void;
  onDelete?: () => void;
  categoryAmounts: Record<string, number>;
  globalTarget: number;
}) {
  const { t } = useTranslation("budget");
  const [name, setName] = useState("");
  const [rows, setRows] = useState<AllocationDraft[]>([{ scope: "global", share: "" }]);

  // Reset local form state whenever the sheet opens (create, or edit of a given contributor).
  useEffect(() => {
    if (!visible) return;
    setName(contributor?.name ?? "");
    const parsed = contributor ? parseContributorAllocations(contributor.allocations) : [];
    setRows(
      parsed.length > 0
        ? parsed.map((a) => ({ scope: a.scope, share: a.share ? a.share.toString() : "" }))
        : [{ scope: "global", share: "" }]
    );
  }, [visible, contributor]);

  const scopeOptions = useMemo(() => ["global", ...Object.keys(BUDGET_CATEGORIES)], []);
  const scopeLabels = useMemo(() => {
    const labels: Record<string, string> = { global: t("contributors.global") };
    for (const key of Object.keys(BUDGET_CATEGORIES)) {
      labels[key] = t(BUDGET_CATEGORY_LABELS[key] || "");
    }
    return labels;
  }, [t]);

  const updateRow = (index: number, updates: Partial<AllocationDraft>) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...updates } : r)));
  };
  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };
  const addRow = () => setRows((prev) => [...prev, { scope: "global", share: "" }]);

  const canSave = name.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    const cleanRows = rows
      .map((r) => ({ scope: r.scope, share: parseFloat(r.share) || 0 }))
      .filter((r) => r.share > 0);
    onSave({
      name: name.trim(),
      allocations: cleanRows.length > 0 ? JSON.stringify(cleanRows) : null,
    });
  };

  return (
    <Sheet visible={visible} onDismiss={onDismiss}>
      <View className="bg-accent-card rounded-t-3xl px-5 pt-5 pb-8">
        <Text className="text-lg font-bold text-ink mb-3">
          {contributor ? t("contributors.editTitle") : t("contributors.addTitle")}
        </Text>
        <ScrollView style={{ maxHeight: 460 }} showsVerticalScrollIndicator={false} nestedScrollEnabled>
          <InputRow
            label={t("contributors.name")}
            value={name}
            onChangeText={setName}
            placeholder={t("contributors.namePlaceholder")}
          />

          <View className="pt-3">
            <Text className="text-xs text-mute mb-2 font-medium">{t("contributors.allocations")}</Text>
            {rows.map((row, index) => {
              const amount = resolveAllocationAmount(
                { scope: row.scope, share: parseFloat(row.share) || 0 },
                globalTarget,
                categoryAmounts
              );
              return (
                <View key={index} className="mt-1">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xs text-mute font-medium">{formatMoney(amount)}</Text>
                    {rows.length > 1 && (
                      <Pressable onPress={() => removeRow(index)} hitSlop={8}>
                        <X size={16} color="#EF4444" />
                      </Pressable>
                    )}
                  </View>
                  <ChipSelect
                    options={scopeOptions}
                    value={row.scope}
                    onChange={(v) => updateRow(index, { scope: v })}
                    labels={scopeLabels}
                  />
                  <InputRow
                    label={t("contributors.share")}
                    value={row.share}
                    onChangeText={(v) => updateRow(index, { share: v })}
                    keyboardType="numeric"
                    placeholder="50"
                  />
                </View>
              );
            })}
            <Pressable onPress={addRow} className="flex-row items-center mt-1">
              <Plus size={16} color="#b96a4a" />
              <Text className="text-primary-500 text-sm font-medium ml-1">
                {t("contributors.addAllocation")}
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        <View className="flex-row gap-2 mt-4">
          <Pressable
            onPress={onDismiss}
            className="flex-1 bg-accent-paper py-3 rounded-2xl items-center"
          >
            <Text className="text-mute font-medium">{t("common:cancel")}</Text>
          </Pressable>
          <Pressable
            onPress={handleSave}
            disabled={!canSave}
            className={`flex-1 py-3 rounded-2xl items-center ${
              canSave ? "bg-primary-500 active:opacity-80" : "bg-accent-paper opacity-50"
            }`}
          >
            <Text className={`font-semibold ${canSave ? "text-white" : "text-mute"}`}>
              {t("common:save")}
            </Text>
          </Pressable>
        </View>
        {onDelete && (
          <Pressable onPress={onDelete} className="items-center mt-3">
            <Text className="text-red-500 text-sm font-medium">{t("common:delete")}</Text>
          </Pressable>
        )}
      </View>
    </Sheet>
  );
}
