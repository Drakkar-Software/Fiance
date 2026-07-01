import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native-css/components";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { UsersRound, Trash2, Pencil, AlertTriangle } from "lucide-react-native";
import * as Crypto from "expo-crypto";
import {
  SeatingConstraintType,
  SEATING_CONSTRAINT_TYPE_LABELS,
  getConstraintViolations,
} from "@fiance/sdk";
import { useSeatingConstraintsStore } from "@/store/useSeatingConstraintsStore";
import { useGuestsStore } from "@/store/useGuestsStore";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { FAB } from "@/components/FAB";
import { ChipSelect, ToggleRow } from "@/components/FormSection";
import { GuestSelectList } from "@/components/GuestSelectList";
import { analytics } from "@/lib/analytics";
import type { SeatingConstraint } from "@/db/schema";

const TYPES = Object.keys(SEATING_CONSTRAINT_TYPE_LABELS) as SeatingConstraintType[];

interface FormState {
  type: SeatingConstraintType;
  label: string;
  isHard: boolean;
  guestIds: string[];
}

function emptyForm(): FormState {
  return { type: "MUST_SIT_TOGETHER", label: "", isHard: true, guestIds: [] };
}

export default function SeatingConstraintsScreen() {
  const { t } = useTranslation("guests");
  const constraints = useSeatingConstraintsStore((s) => s.seatingConstraints);
  const addSeatingConstraint = useSeatingConstraintsStore((s) => s.addSeatingConstraint);
  const updateSeatingConstraint = useSeatingConstraintsStore((s) => s.updateSeatingConstraint);
  const removeSeatingConstraint = useSeatingConstraintsStore((s) => s.removeSeatingConstraint);
  const guests = useGuestsStore((s) => s.guests);

  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const resetForm = () => {
    setShowAdd(false);
    setEditingId(null);
    setForm(emptyForm());
  };

  const guestName = (id: string) => {
    const g = guests.find((x) => x.id === id);
    return g ? `${g.firstName} ${g.lastName}` : "?";
  };

  const handleSave = () => {
    if (form.guestIds.length < 2) {
      Alert.alert(t("common:error"), t("seatingConstraints.minGuestsRequired"));
      return;
    }
    const now = new Date().toISOString();
    if (editingId) {
      updateSeatingConstraint(editingId, {
        type: form.type,
        label: form.label.trim() || null,
        isHard: form.isHard,
        guestIds: form.guestIds,
      });
    } else {
      addSeatingConstraint({
        id: Crypto.randomUUID(),
        type: form.type,
        label: form.label.trim() || null,
        isHard: form.isHard,
        guestIds: form.guestIds,
        createdAt: now,
        updatedAt: now,
      });
      analytics.capture("seating_constraint_created");
    }
    resetForm();
  };

  const handleEdit = (c: SeatingConstraint) => {
    setEditingId(c.id);
    setShowAdd(false);
    setForm({
      type: c.type as SeatingConstraintType,
      label: c.label ?? "",
      isHard: c.isHard ?? false,
      guestIds: c.guestIds,
    });
  };

  const typeLabels = Object.fromEntries(
    TYPES.map((ty) => [ty, t(SEATING_CONSTRAINT_TYPE_LABELS[ty])])
  ) as Record<SeatingConstraintType, string>;

  const renderForm = () => (
    <View className="bg-accent-card rounded-2xl p-4 mb-4 border border-primary-200 dark:border-primary-800">
      <Text className="text-base font-semibold text-ink mb-3">
        {editingId ? t("seatingConstraints.editConstraint") : t("seatingConstraints.newConstraint")}
      </Text>

      <ChipSelect options={TYPES} value={form.type} onChange={(type) => setForm((f) => ({ ...f, type }))} labels={typeLabels} />

      <TextInput
        className="text-base text-ink border-b border-hair pb-2 mt-4"
        placeholder={t("seatingConstraints.labelPlaceholder")}
        placeholderTextColor="#D0D0D8"
        value={form.label}
        onChangeText={(label) => setForm((f) => ({ ...f, label }))}
      />

      <View className="mt-3">
        <ToggleRow
          label={t("seatingConstraints.isHard")}
          value={form.isHard}
          onToggle={() => setForm((f) => ({ ...f, isHard: !f.isHard }))}
        />
      </View>

      <View className="mt-3">
        <Text className="text-xs text-mute mb-2 font-medium">
          {t("seatingConstraints.selectGuests")} ({form.guestIds.length})
        </Text>
        <GuestSelectList
          guests={guests}
          selectedIds={new Set(form.guestIds)}
          onToggle={(id) =>
            setForm((f) => ({
              ...f,
              guestIds: f.guestIds.includes(id) ? f.guestIds.filter((g) => g !== id) : [...f.guestIds, id],
            }))
          }
          searchPlaceholder={t("searchGuest")}
        />
      </View>

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

  return (
    <View className="relative flex-1 bg-accent-paper">
      {constraints.length === 0 && !showAdd ? (
        <EmptyState
          icon={UsersRound}
          title={t("seatingConstraints.empty")}
          description={t("seatingConstraints.emptyDesc")}
          actionLabel={t("seatingConstraints.newConstraint")}
          onAction={() => setShowAdd(true)}
        />
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          {showAdd && renderForm()}

          {constraints.map((c) => {
            if (editingId === c.id) return <View key={c.id}>{renderForm()}</View>;
            const violations = getConstraintViolations(c, guests);
            const hasViolation = violations.length > 0;
            return (
              <View key={c.id} className="bg-accent-card rounded-2xl p-4 mb-2.5 border border-hair">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-1.5">
                      <Text className="text-base font-semibold text-ink">
                        {c.label || t(SEATING_CONSTRAINT_TYPE_LABELS[c.type as SeatingConstraintType])}
                      </Text>
                      {hasViolation && <AlertTriangle size={14} color={c.isHard ? "#EF4444" : "#c9922f"} />}
                    </View>
                    <Text className="text-xs text-mute mt-0.5">
                      {t(SEATING_CONSTRAINT_TYPE_LABELS[c.type as SeatingConstraintType])} · {c.guestIds.map(guestName).join(", ")}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Pressable onPress={() => handleEdit(c)} className="w-8 h-8 items-center justify-center">
                      <Pencil size={15} color="#9CA3AF" />
                    </Pressable>
                    <Pressable onPress={() => setDeleteId(c.id)} className="w-8 h-8 items-center justify-center">
                      <Trash2 size={15} color="#EF4444" />
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })}

          <View className="h-24" />
        </ScrollView>
      )}

      <FAB onPress={() => { resetForm(); setShowAdd(true); }} />

      <ConfirmSheet
        visible={!!deleteId}
        title={t("seatingConstraints.deleteConstraint")}
        message={t("seatingConstraints.deleteConstraintMsg")}
        confirmLabel={t("common:delete")}
        destructive
        onConfirm={() => {
          if (deleteId) removeSeatingConstraint(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </View>
  );
}
