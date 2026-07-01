import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native-css/components";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { Users, Trash2, Pencil } from "lucide-react-native";
import * as Crypto from "expo-crypto";
import {
  GuestRole,
  GUEST_ROLE_LABELS,
  GUEST_ROLE_CATEGORY,
  GUEST_ROLE_CATEGORY_LABELS,
  type GuestRoleCategory,
} from "@fiance/sdk";
import { useWeddingPartyStore } from "@/store/useWeddingPartyStore";
import { useGuestsStore } from "@/store/useGuestsStore";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { FAB } from "@/components/FAB";
import { ChipSelect, ToggleRow } from "@/components/FormSection";
import { GuestSelectList } from "@/components/GuestSelectList";
import { analytics } from "@/lib/analytics";
import type { WeddingRoleAssignment } from "@/db/schema";

const ROLES = Object.keys(GUEST_ROLE_LABELS) as GuestRole[];
const CATEGORY_ORDER: GuestRoleCategory[] = ["ceremony", "party", "other"];

interface FormState {
  role: GuestRole;
  useExisting: boolean;
  guestId: string | null;
  displayName: string;
  phone: string;
  email: string;
}

function emptyForm(): FormState {
  return { role: "WITNESS", useExisting: true, guestId: null, displayName: "", phone: "", email: "" };
}

export default function WeddingPartyScreen() {
  const { t } = useTranslation("guests");
  const assignments = useWeddingPartyStore((s) => s.weddingRoleAssignments);
  const addRoleAssignment = useWeddingPartyStore((s) => s.addRoleAssignment);
  const updateRoleAssignment = useWeddingPartyStore((s) => s.updateRoleAssignment);
  const removeRoleAssignment = useWeddingPartyStore((s) => s.removeRoleAssignment);
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

  const guestName = (guestId: string | null) =>
    guestId ? guests.find((g) => g.id === guestId)?.firstName + " " + guests.find((g) => g.id === guestId)?.lastName : null;

  const grouped = useMemo(() => {
    const byCategory: Record<GuestRoleCategory, WeddingRoleAssignment[]> = { ceremony: [], party: [], other: [] };
    for (const a of assignments) {
      const cat = GUEST_ROLE_CATEGORY[a.role as GuestRole] ?? "other";
      byCategory[cat].push(a);
    }
    return byCategory;
  }, [assignments]);

  const handleSave = () => {
    if (form.useExisting && !form.guestId) {
      Alert.alert(t("common:error"), t("weddingParty.selectGuestRequired"));
      return;
    }
    if (!form.useExisting && !form.displayName.trim()) {
      Alert.alert(t("common:error"), t("weddingParty.displayNameRequired"));
      return;
    }
    const now = new Date().toISOString();
    if (editingId) {
      updateRoleAssignment(editingId, {
        role: form.role,
        guestId: form.useExisting ? form.guestId : null,
        displayName: form.useExisting ? "" : form.displayName.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
      });
    } else {
      addRoleAssignment({
        id: Crypto.randomUUID(),
        role: form.role,
        guestId: form.useExisting ? form.guestId : null,
        displayName: form.useExisting ? "" : form.displayName.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        notes: null,
        sortOrder: assignments.length + 1,
        createdAt: now,
        updatedAt: now,
      });
      analytics.capture("wedding_role_assigned");
    }
    resetForm();
  };

  const handleEdit = (a: WeddingRoleAssignment) => {
    setEditingId(a.id);
    setShowAdd(false);
    setForm({
      role: a.role as GuestRole,
      useExisting: !!a.guestId,
      guestId: a.guestId,
      displayName: a.displayName,
      phone: a.phone ?? "",
      email: a.email ?? "",
    });
  };

  const roleLabels = Object.fromEntries(ROLES.map((r) => [r, t(GUEST_ROLE_LABELS[r])])) as Record<GuestRole, string>;

  const renderForm = () => (
    <View className="bg-accent-card rounded-2xl p-4 mb-4 border border-primary-200 dark:border-primary-800">
      <Text className="text-base font-semibold text-ink mb-3">
        {editingId ? t("weddingParty.editRole") : t("weddingParty.newRole")}
      </Text>

      <Text className="text-xs text-mute mb-2 font-medium">{t("weddingParty.role_label")}</Text>
      <ChipSelect options={ROLES} value={form.role} onChange={(role) => setForm((f) => ({ ...f, role }))} labels={roleLabels} />

      <View className="mt-4">
        <ToggleRow
          label={t("weddingParty.existingGuest")}
          value={form.useExisting}
          onToggle={() => setForm((f) => ({ ...f, useExisting: !f.useExisting, guestId: null, displayName: "" }))}
        />
      </View>

      {form.useExisting ? (
        <View className="mt-3">
          <GuestSelectList
            guests={guests}
            selectedIds={new Set(form.guestId ? [form.guestId] : [])}
            onToggle={(id) => setForm((f) => ({ ...f, guestId: f.guestId === id ? null : id }))}
            searchPlaceholder={t("searchGuest")}
          />
        </View>
      ) : (
        <View className="mt-3 gap-3">
          <TextInput
            className="text-base text-ink border-b border-hair pb-2"
            placeholder={t("weddingParty.displayNamePlaceholder")}
            placeholderTextColor="#D0D0D8"
            value={form.displayName}
            onChangeText={(displayName) => setForm((f) => ({ ...f, displayName }))}
          />
          <TextInput
            className="text-base text-ink border-b border-hair pb-2"
            placeholder={t("phone")}
            placeholderTextColor="#D0D0D8"
            value={form.phone}
            onChangeText={(phone) => setForm((f) => ({ ...f, phone }))}
            keyboardType="phone-pad"
          />
          <TextInput
            className="text-base text-ink border-b border-hair pb-2"
            placeholder={t("email")}
            placeholderTextColor="#D0D0D8"
            value={form.email}
            onChangeText={(email) => setForm((f) => ({ ...f, email }))}
            keyboardType="email-address"
          />
        </View>
      )}

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
      {assignments.length === 0 && !showAdd ? (
        <EmptyState
          icon={Users}
          title={t("weddingParty.empty")}
          description={t("weddingParty.emptyDesc")}
          actionLabel={t("weddingParty.addRole")}
          onAction={() => setShowAdd(true)}
        />
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          {showAdd && renderForm()}

          {CATEGORY_ORDER.map((cat) => {
            const items = grouped[cat];
            if (items.length === 0) return null;
            return (
              <View key={cat} className="mb-5">
                <Text className="text-xs font-semibold text-mute mb-2 uppercase tracking-wider">
                  {t(GUEST_ROLE_CATEGORY_LABELS[cat])}
                </Text>
                {items.map((a) =>
                  editingId === a.id ? (
                    <View key={a.id}>{renderForm()}</View>
                  ) : (
                    <View key={a.id} className="bg-accent-card rounded-2xl p-4 mb-2.5 border border-hair flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-ink">
                          {a.guestId ? guestName(a.guestId) : a.displayName}
                        </Text>
                        <Text className="text-xs text-mute mt-0.5">{t(GUEST_ROLE_LABELS[a.role as GuestRole])}</Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Pressable onPress={() => handleEdit(a)} className="w-8 h-8 items-center justify-center">
                          <Pencil size={15} color="#9CA3AF" />
                        </Pressable>
                        <Pressable onPress={() => setDeleteId(a.id)} className="w-8 h-8 items-center justify-center">
                          <Trash2 size={15} color="#EF4444" />
                        </Pressable>
                      </View>
                    </View>
                  )
                )}
              </View>
            );
          })}

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
          if (deleteId) removeRoleAssignment(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </View>
  );
}

