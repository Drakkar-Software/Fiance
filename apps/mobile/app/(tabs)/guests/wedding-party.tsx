import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native-css/components";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { Users, Trash2, Pencil } from "lucide-react-native";
import * as Crypto from "expo-crypto";
import type { WeddingRole } from "@fiance/sdk";
import { DEFAULT_WEDDING_ROLES } from "@fiance/sdk";
import { useWeddingPartyStore } from "@/store/useWeddingPartyStore";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { FAB } from "@/components/FAB";
import { FormActions } from "@/components/FormSection";
import { analytics } from "@/lib/analytics";

export default function WeddingPartyScreen() {
  const { t } = useTranslation("guests");
  const weddingRoles = useWeddingPartyStore((s) => s.weddingRoles);
  const addWeddingRole = useWeddingPartyStore((s) => s.addWeddingRole);
  const updateWeddingRole = useWeddingPartyStore((s) => s.updateWeddingRole);
  const removeWeddingRole = useWeddingPartyStore((s) => s.removeWeddingRole);
  const seedDefaultRoles = useWeddingPartyStore((s) => s.seedDefaultRoles);
  const assignments = useWeddingPartyStore((s) => s.weddingRoleAssignments);

  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const resetForm = () => {
    setShowAdd(false);
    setEditingId(null);
    setName("");
  };

  const missingDefaults = useMemo(
    () => DEFAULT_WEDDING_ROLES.filter((d) => !weddingRoles.some((r) => r.name === d)),
    [weddingRoles],
  );

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert(t("common:error"), t("weddingParty.roleNameRequired"));
      return;
    }
    if (editingId) {
      updateWeddingRole(editingId, { name: name.trim() });
    } else {
      const now = new Date().toISOString();
      addWeddingRole({
        id: Crypto.randomUUID(),
        name: name.trim(),
        sortOrder: weddingRoles.length + 1,
        createdAt: now,
        updatedAt: now,
      });
      analytics.capture("wedding_role_created");
    }
    resetForm();
  };

  const handleEdit = (role: WeddingRole) => {
    setEditingId(role.id);
    setShowAdd(false);
    setName(role.name);
  };

  const renderForm = () => (
    <View className="bg-accent-card rounded-2xl p-4 mb-4 border border-primary-200 dark:border-primary-800">
      <Text className="text-base font-semibold text-ink mb-3">
        {editingId ? t("weddingParty.editRole") : t("weddingParty.newRole")}
      </Text>
      <TextInput
        className="text-base text-ink border-b border-hair pb-2"
        placeholder={t("weddingParty.roleNamePlaceholder")}
        placeholderTextColor="#D0D0D8"
        value={name}
        onChangeText={setName}
        autoFocus
      />
      <View className="mt-4">
        <FormActions
          saveLabel={editingId ? t("common:save") : t("common:create")}
          cancelLabel={t("common:cancel")}
          onSave={handleSave}
          onCancel={resetForm}
        />
      </View>
    </View>
  );

  return (
    <View className="relative flex-1 bg-accent-paper">
      {weddingRoles.length === 0 && !showAdd ? (
        <EmptyState
          icon={Users}
          title={t("weddingParty.empty")}
          description={t("weddingParty.emptyDesc")}
          actionLabel={t("weddingParty.createDefaults")}
          onAction={seedDefaultRoles}
        />
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          {showAdd && renderForm()}

          {weddingRoles.map((role) => {
            const guestCount = assignments.filter((a) => a.roleId === role.id).length;
            if (editingId === role.id) {
              return <View key={role.id}>{renderForm()}</View>;
            }
            return (
              <View key={role.id} className="bg-accent-card rounded-2xl p-4 mb-2.5 border border-hair flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-ink">{role.name}</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  {guestCount > 0 && (
                    <View className="px-2.5 py-1 rounded-full bg-accent-paper mr-1">
                      <Text className="text-xs font-semibold text-mute">{guestCount}</Text>
                    </View>
                  )}
                  <Pressable onPress={() => handleEdit(role)} className="w-8 h-8 items-center justify-center">
                    <Pencil size={15} color="#9CA3AF" />
                  </Pressable>
                  <Pressable onPress={() => setDeleteId(role.id)} className="w-8 h-8 items-center justify-center">
                    <Trash2 size={15} color="#EF4444" />
                  </Pressable>
                </View>
              </View>
            );
          })}

          {missingDefaults.length > 0 && (
            <Pressable onPress={seedDefaultRoles} className="mt-2 active:opacity-60">
              <Text className="text-xs text-primary-500 font-medium">{t("weddingParty.createDefaults")}</Text>
            </Pressable>
          )}

          <View className="h-24" />
        </ScrollView>
      )}

      <FAB onPress={() => { resetForm(); setShowAdd(true); }} />

      <ConfirmSheet
        visible={!!deleteId}
        title={t("weddingParty.deleteRole")}
        message={t("weddingParty.deleteRoleMsg")}
        confirmLabel={t("common:delete")}
        destructive
        onConfirm={() => {
          if (deleteId) removeWeddingRole(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </View>
  );
}
