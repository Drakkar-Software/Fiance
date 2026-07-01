import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native-css/components";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { FileCheck2, Trash2, Pencil, CheckCircle2, Circle } from "lucide-react-native";
import * as Crypto from "expo-crypto";
import { LegalMilestoneType, LEGAL_MILESTONE_TYPE_LABELS } from "@fiance/sdk";
import { useLegalStore } from "@/store/useLegalStore";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { FAB } from "@/components/FAB";
import { ChipSelect, DateRow } from "@/components/FormSection";
import { analytics } from "@/lib/analytics";
import type { LegalMilestone } from "@/db/schema";

const TYPES = Object.keys(LEGAL_MILESTONE_TYPE_LABELS) as LegalMilestoneType[];

interface FormState {
  type: LegalMilestoneType;
  title: string;
  dueDate: string;
  location: string;
}

function emptyForm(): FormState {
  return { type: "CUSTOM", title: "", dueDate: "", location: "" };
}

export default function PlanningLegalScreen() {
  const { t } = useTranslation("planning");
  const milestones = useLegalStore((s) => s.legalMilestones);
  const addLegalMilestone = useLegalStore((s) => s.addLegalMilestone);
  const updateLegalMilestone = useLegalStore((s) => s.updateLegalMilestone);
  const removeLegalMilestone = useLegalStore((s) => s.removeLegalMilestone);
  const completeLegalMilestone = useLegalStore((s) => s.completeLegalMilestone);

  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const resetForm = () => {
    setShowAdd(false);
    setEditingId(null);
    setForm(emptyForm());
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      Alert.alert(t("common:error"), t("legal.titleRequired"));
      return;
    }
    const now = new Date().toISOString();
    if (editingId) {
      updateLegalMilestone(editingId, {
        type: form.type,
        title: form.title.trim(),
        dueDate: form.dueDate || null,
        location: form.location.trim() || null,
      });
    } else {
      addLegalMilestone({
        id: Crypto.randomUUID(),
        type: form.type,
        title: form.title.trim(),
        dueDate: form.dueDate || null,
        completedDate: null,
        status: "TODO",
        location: form.location.trim() || null,
        notes: null,
        documentIds: null,
        reminderDaysBefore: null,
        createdAt: now,
        updatedAt: now,
      });
    }
    resetForm();
  };

  const handleEdit = (m: LegalMilestone) => {
    setEditingId(m.id);
    setShowAdd(false);
    setForm({
      type: m.type as LegalMilestoneType,
      title: m.title,
      dueDate: m.dueDate ?? "",
      location: m.location ?? "",
    });
  };

  const toggleDone = (m: LegalMilestone) => {
    if (m.status === "DONE") {
      updateLegalMilestone(m.id, { status: "TODO", completedDate: null });
    } else {
      completeLegalMilestone(m.id, new Date().toISOString().slice(0, 10));
      analytics.capture("legal_milestone_completed");
    }
  };

  const typeLabels = Object.fromEntries(TYPES.map((ty) => [ty, t(LEGAL_MILESTONE_TYPE_LABELS[ty])])) as Record<LegalMilestoneType, string>;

  const renderForm = () => (
    <View className="bg-accent-card rounded-2xl p-4 mb-4 border border-primary-200 dark:border-primary-800">
      <Text className="text-base font-semibold text-ink mb-3">
        {editingId ? t("legal.editMilestone") : t("legal.newMilestone")}
      </Text>

      <TextInput
        className="text-base text-ink border-b border-hair pb-2 mb-4"
        placeholder={t("legal.titlePlaceholder")}
        placeholderTextColor="#D0D0D8"
        value={form.title}
        onChangeText={(title) => setForm((f) => ({ ...f, title }))}
      />

      <ChipSelect options={TYPES} value={form.type} onChange={(type) => setForm((f) => ({ ...f, type }))} labels={typeLabels} />

      <View className="mt-3">
        <DateRow label={t("legal.dueDate")} value={form.dueDate} onChange={(dueDate) => setForm((f) => ({ ...f, dueDate }))} />
      </View>

      <TextInput
        className="text-base text-ink border-b border-hair pb-2 mt-3"
        placeholder={t("legal.locationPlaceholder")}
        placeholderTextColor="#D0D0D8"
        value={form.location}
        onChangeText={(location) => setForm((f) => ({ ...f, location }))}
      />

      <View className="flex-row gap-2 mt-4">
        <Pressable onPress={handleSave} className="flex-1 bg-primary-500 py-2.5 rounded-xl items-center active:bg-primary-600">
          <Text className="text-white font-semibold text-sm">{editingId ? t("common:save") : t("common:create")}</Text>
        </Pressable>
        <Pressable onPress={resetForm} className="flex-1 bg-accent-paper py-2.5 rounded-xl items-center">
          <Text className="text-mute text-sm">{t("common:cancel")}</Text>
        </Pressable>
      </View>
    </View>
  );

  const sorted = [...milestones].sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""));

  return (
    <View className="relative flex-1 bg-accent-paper">
      {milestones.length === 0 && !showAdd ? (
        <EmptyState
          icon={FileCheck2}
          title={t("legal.empty")}
          description={t("legal.emptyDesc")}
          actionLabel={t("legal.newMilestone")}
          onAction={() => setShowAdd(true)}
        />
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          {showAdd && renderForm()}

          {sorted.map((m) => {
            if (editingId === m.id) return <View key={m.id}>{renderForm()}</View>;
            const done = m.status === "DONE";
            return (
              <View key={m.id} className="bg-accent-card rounded-2xl p-4 mb-2.5 border border-hair flex-row items-center">
                <Pressable onPress={() => toggleDone(m)} className="w-8 h-8 items-center justify-center">
                  {done ? <CheckCircle2 size={20} color="#6e7a4a" /> : <Circle size={20} color="#C0C0C8" />}
                </Pressable>
                <View className="flex-1 ml-1">
                  <Text className={`text-base font-semibold ${done ? "text-mute line-through" : "text-ink"}`}>{m.title}</Text>
                  <Text className="text-xs text-mute mt-0.5">
                    {t(LEGAL_MILESTONE_TYPE_LABELS[m.type as LegalMilestoneType])}
                    {m.dueDate ? ` · ${m.dueDate}` : ""}
                    {m.location ? ` · ${m.location}` : ""}
                  </Text>
                </View>
                <Pressable onPress={() => handleEdit(m)} className="w-8 h-8 items-center justify-center">
                  <Pencil size={15} color="#9CA3AF" />
                </Pressable>
                <Pressable onPress={() => setDeleteId(m.id)} className="w-8 h-8 items-center justify-center">
                  <Trash2 size={15} color="#EF4444" />
                </Pressable>
              </View>
            );
          })}

          <View className="h-24" />
        </ScrollView>
      )}

      <FAB onPress={() => { resetForm(); setShowAdd(true); }} />

      <ConfirmSheet
        visible={!!deleteId}
        title={t("legal.deleteMilestone")}
        message={t("legal.deleteMilestoneMsg")}
        confirmLabel={t("common:delete")}
        destructive
        onConfirm={() => {
          if (deleteId) removeLegalMilestone(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </View>
  );
}
