import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Switch } from "react-native-css/components";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { Tag, Trash2, Pencil, Moon } from "lucide-react-native";
import * as Crypto from "expo-crypto";
import { useInvitationTypesStore } from "@/store/useInvitationTypesStore";
import { useGuestsStore } from "@/store/useGuestsStore";
import { FAB } from "@/components/FAB";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { FormActions } from "@/components/FormSection";
import { useCanEditHere } from "@/lib/permissions/useCanEditHere";
import { theme as GP } from "@/lib/theme";
import { analytics } from "@/lib/analytics";
import type { InvitationTypeEntity } from "@/db/schema";

function NeedsSleepingToggle({
  value,
  onChange,
  description,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  description: string;
}) {
  const { t } = useTranslation("guests");
  return (
    <View className="mt-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Moon size={14} color="#6B7280" />
          <Text className="text-sm font-medium text-ink-soft">
            {t("needsSleeping")}
          </Text>
        </View>
        <Switch
          value={value}
          onValueChange={onChange}
          trackColor={{ false: "#E5E7EB", true: GP.claySoft }}
          thumbColor={value ? GP.clay : "#FFFFFF"}
        />
      </View>
      <Text className="text-xs text-mute dark:text-mute mt-1.5 leading-4">
        {description}
      </Text>
    </View>
  );
}

export default function InvitationTypesScreen() {
  const { t } = useTranslation("guests");
  const canEdit = useCanEditHere();
  const invitationTypes = useInvitationTypesStore((s) => s.invitationTypes);
  const addInvitationType = useInvitationTypesStore((s) => s.addInvitationType);
  const updateInvitationType = useInvitationTypesStore((s) => s.updateInvitationType);
  const removeInvitationType = useInvitationTypesStore((s) => s.removeInvitationType);
  const guests = useGuestsStore((s) => s.guests);

  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newNeedsSleeping, setNewNeedsSleeping] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState("");
  const [editingNeedsSleeping, setEditingNeedsSleeping] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const resetForm = () => {
    setShowAdd(false);
    setNewLabel("");
    setNewNeedsSleeping(false);
    setEditingId(null);
    setEditingLabel("");
    setEditingNeedsSleeping(false);
  };

  const handleAdd = () => {
    if (!newLabel.trim()) {
      Alert.alert(t("common:error"), t("invitationTypeNameRequired"));
      return;
    }
    const now = new Date().toISOString();
    addInvitationType({
      id: Crypto.randomUUID(),
      label: newLabel.trim(),
      isDefault: false,
      needsSleeping: newNeedsSleeping,
      createdAt: now,
      updatedAt: now,
    } as InvitationTypeEntity);
    analytics.capture("invitation_type_added");
    resetForm();
  };

  const handleEdit = (type: InvitationTypeEntity) => {
    setEditingId(type.id);
    setEditingLabel(type.label);
    setEditingNeedsSleeping(type.needsSleeping ?? false);
    setShowAdd(false);
  };

  const handleSaveEdit = () => {
    if (!editingLabel.trim() || !editingId) return;
    updateInvitationType(editingId, {
      label: editingLabel.trim(),
      needsSleeping: editingNeedsSleeping,
    });
    resetForm();
  };

  const needsSleepingDesc = t("needsSleepingDesc");

  return (
    <View className="relative flex-1 bg-accent-paper">
      {invitationTypes.length === 0 && !showAdd ? (
        <EmptyState
          icon={Tag}
          title={t("noInvitationTypes")}
          description={t("createInvitationTypesDesc")}
          actionLabel={t("newInvitationType")}
          onAction={() => setShowAdd(true)}
        />
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          {/* Add form */}
          {showAdd && (
            <View className="bg-accent-card rounded-2xl p-4 mb-4 border border-primary-200 dark:border-primary-800">
              <Text className="text-base font-semibold text-ink mb-3">
                {t("newInvitationType")}
              </Text>
              <TextInput
                className="text-base text-ink border-b border-hair pb-2"
                placeholder={t("invitationTypeNamePlaceholder")}
                placeholderTextColor="#D0D0D8"
                value={newLabel}
                onChangeText={setNewLabel}
                autoFocus
                editable={canEdit}
              />
              <NeedsSleepingToggle
                value={newNeedsSleeping}
                onChange={setNewNeedsSleeping}
                description={needsSleepingDesc}
              />
              <View className="mt-4">
                <FormActions
                  saveLabel={t("common:create")}
                  cancelLabel={t("common:cancel")}
                  onSave={handleAdd}
                  onCancel={resetForm}
                />
              </View>
            </View>
          )}

          {/* List */}
          {invitationTypes.map((type) => {
            const guestCount = guests.filter((g) => g.invitationType === type.id).length;

            if (editingId === type.id) {
              return (
                <View key={type.id} className="bg-accent-card rounded-2xl p-4 mb-2.5 border border-primary-200 dark:border-primary-800">
                  <Text className="text-sm text-mute mb-2">{type.label}</Text>
                  <TextInput
                    className="text-base text-ink border-b border-hair pb-2"
                    placeholder={t("invitationTypeName")}
                    placeholderTextColor="#D0D0D8"
                    value={editingLabel}
                    onChangeText={setEditingLabel}
                    autoFocus
                    selectTextOnFocus
                    editable={canEdit}
                  />
                  <NeedsSleepingToggle
                    value={editingNeedsSleeping}
                    onChange={setEditingNeedsSleeping}
                    description={needsSleepingDesc}
                  />
                  <View className="mt-4">
                    <FormActions
                      saveLabel={t("common:save")}
                      cancelLabel={t("common:cancel")}
                      onSave={handleSaveEdit}
                      onCancel={resetForm}
                    />
                  </View>
                </View>
              );
            }

            return (
              <View key={type.id} className="bg-accent-card rounded-2xl p-4 mb-2.5 border border-hair">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="w-8 h-8 rounded-lg bg-accent-clay-soft dark:bg-primary-900 items-center justify-center mr-3">
                      <Tag size={15} color={GP.clay} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-ink">{type.label}</Text>
                      {type.needsSleeping && (
                        <View className="flex-row items-center gap-1 mt-0.5">
                          <Moon size={10} color="#9CA3AF" />
                          <Text className="text-xs text-mute">{t("needsSleeping")}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View className="flex-row items-center gap-1">
                    {guestCount > 0 && (
                      <View className="px-2.5 py-1 rounded-full bg-accent-paper mr-1">
                        <Text className="text-xs font-semibold text-mute">{guestCount}</Text>
                      </View>
                    )}
                    {canEdit && (
                      <Pressable onPress={() => handleEdit(type)} className="w-8 h-8 items-center justify-center">
                        <Pencil size={15} color="#9CA3AF" />
                      </Pressable>
                    )}
                    {!type.isDefault && canEdit && (
                      <Pressable onPress={() => setDeleteId(type.id)} className="w-8 h-8 items-center justify-center">
                        <Trash2 size={15} color="#EF4444" />
                      </Pressable>
                    )}
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
        title={t("deleteInvitationType")}
        message={t("deleteInvitationTypeMsg")}
        confirmLabel={t("common:delete")}
        destructive
        onConfirm={() => {
          if (deleteId) removeInvitationType(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </View>
  );
}
