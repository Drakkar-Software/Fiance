import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, TextInput, Pressable } from "react-native-css/components";
import { Alert } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import * as Crypto from "expo-crypto";
import { Users, Check, Lock } from "lucide-react-native";
import { SheetScaffold } from "@fiance/ui/components";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useWeddingPartyStore } from "@/store/useWeddingPartyStore";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { SectionTitle, FormCard, InputRow, DateRow, TimeRow, ToggleRow } from "@/components/FormSection";
import { DeleteButton } from "@/components/DeleteButton";
import { SaveHeaderButton } from "@/components/SaveHeaderButton";
import { useWeddingStore } from "@/store/useWeddingStore";
import { analytics } from "@/lib/analytics";
import { useCanEditHere } from "@/lib/permissions/useCanEditHere";
import { useHasFeature } from "@/lib/limits";
import { useShowPaywall } from "@/components/PaywallProvider";
import { isDayOfMultiDay } from "@fiance/sdk";
import type { DayOfItem } from "@/db/schema";
import { PageHeader } from "@/components/PageHeader";

/** Row that opens a bottom sheet to pick a wedding-party role (mirrors DateRow/TimeRow's tap-to-open pattern). */
function RoleRow({
  label,
  noneLabel,
  roles,
  value,
  onChange,
}: {
  label: string;
  noneLabel: string;
  roles: { id: string; name: string }[];
  value: string;
  onChange: (roleId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = roles.find((r) => r.id === value);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className="flex-row items-center justify-between border-b border-outline-50 py-3"
      >
        <View className="flex-1">
          <Text className="text-xs text-typography-400 mb-1 font-medium">{label}</Text>
          <Text className={`text-base ${selected ? "text-typography-900" : "text-typography-300"}`}>
            {selected ? selected.name : noneLabel}
          </Text>
        </View>
        <Users size={18} className="text-typography-400" />
      </Pressable>

      <SheetScaffold visible={open} onDismiss={() => setOpen(false)} title={label} scrollable>
        <Pressable
          onPress={() => {
            onChange("");
            setOpen(false);
          }}
          className={`flex-row items-center justify-between py-3 px-2.5 mb-1 rounded-xl border ${
            !value ? "bg-primary-50 border-primary-200" : "border-transparent"
          }`}
        >
          <Text className={!value ? "text-primary-600 font-medium" : "text-typography-700"}>{noneLabel}</Text>
          {!value && <Check size={18} color="#b96a4a" />}
        </Pressable>
        {roles.map((r) => {
          const active = r.id === value;
          return (
            <Pressable
              key={r.id}
              onPress={() => {
                onChange(r.id);
                setOpen(false);
              }}
              className={`flex-row items-center justify-between py-3 px-2.5 mb-1 rounded-xl border ${
                active ? "bg-primary-50 border-primary-200" : "border-transparent"
              }`}
            >
              <Text className={active ? "text-primary-600 font-medium" : "text-typography-700"}>{r.name}</Text>
              {active && <Check size={18} color="#b96a4a" />}
            </Pressable>
          );
        })}
      </SheetScaffold>
    </>
  );
}

export default function DayOfItemScreen() {
  const { t } = useTranslation("planning");
  const canEdit = useCanEditHere();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const items = usePlanningStore((s) => s.dayOfItems);
  const addItem = usePlanningStore((s) => s.addDayOfItem);
  const updateItem = usePlanningStore((s) => s.updateDayOfItem);
  const removeItem = usePlanningStore((s) => s.removeDayOfItem);
  const roles = useWeddingPartyStore((s) => s.weddingRoles);

  const weddingDate = useWeddingStore((s) => s.wedding?.weddingDate);
  const isNew = id === "new";
  const existing = items.find((i) => i.id === id);

  const [title, setTitle] = useState(existing?.title || "");
  const [date, setDate] = useState(existing?.date || weddingDate || "");
  const [time, setTime] = useState(existing?.time || "");
  const [endTime, setEndTime] = useState(existing?.endTime || "");
  const [location, setLocation] = useState(existing?.location || "");
  const [responsible, setResponsible] = useState(existing?.responsible || "");
  const [roleId, setRoleId] = useState(existing?.roleId || "");
  const [notes, setNotes] = useState(existing?.notes || "");
  const [isPublic, setIsPublic] = useState(existing?.isPublic ?? false);
  const [showDelete, setShowDelete] = useState(false);

  const canSave = title.trim().length > 0 && time.trim().length > 0;

  // Whether this item, once saved with its current date, joins a collection
  // that spans more than one distinct date. Free tier only publishes the
  // earliest day on the public page.
  const hasPublicMultiDay = useHasFeature("publicMultiDay");
  const { openPaywall } = useShowPaywall();
  const isMultiDay = useMemo(
    () => isDayOfMultiDay(items, id, date, weddingDate),
    [items, id, date, weddingDate]
  );

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert(t("common:error"), t("titleRequired"));
      return;
    }
    if (!time.trim()) {
      Alert.alert(t("common:error"), t("timeRequired"));
      return;
    }

    const now = new Date().toISOString();
    const maxOrder = items.reduce((max, i) => Math.max(max, i.sortOrder || 0), 0);
    const data: Partial<DayOfItem> = {
      title: title.trim(),
      date: date || null,
      time: time.trim(),
      endTime: endTime || null,
      location: location || null,
      responsible: responsible || null,
      roleId: roleId || null,
      notes: notes || null,
      isPublic,
      updatedAt: now,
    };

    if (isNew) {
      addItem({
        ...data,
        id: Crypto.randomUUID(),
        sortOrder: maxOrder + 1,
        createdAt: now,
      } as DayOfItem);
      analytics.capture("day_of_item_added");
    } else {
      updateItem(id!, data);
    }
    router.back();
  };

  const handleDelete = () => {
    removeItem(id!);
    setShowDelete(false);
    router.back();
  };

  return (
    <View className="flex-1 bg-accent-paper">
      <Stack.Screen
        options={{
          title: title || "",
          headerRight: () => (
            <SaveHeaderButton label={t("common:save")} enabled={canSave} onPress={handleSave} />
          ),
        }}
      />
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <PageHeader
          eyebrow={t("dayOfEyebrow")}
          title={title || t("newMoment")}
          titleSize={22}
        />
        <SectionTitle>{t("information")}</SectionTitle>
        <FormCard>
          <InputRow label={t("momentLabel")} value={title} onChangeText={setTitle} placeholder={t("churchPlaceholder")} />
          <DateRow label={t("dateLabel")} value={date} onChange={setDate} />
          <TimeRow label={t("timeLabel")} value={time} onChange={setTime} placeholder="13:00" />
          <TimeRow label={t("endTimeLabel")} value={endTime} onChange={setEndTime} placeholder="13:30" />
          <InputRow label={t("locationLabel")} value={location} onChangeText={setLocation} placeholder={t("venuePlaceholder")} />
          <InputRow label={t("responsible")} value={responsible} onChangeText={setResponsible} placeholder={t("responsiblePlaceholder")} />
          {roles.length > 0 && (
            <RoleRow
              label={t("linkedRole")}
              noneLabel={t("common:none")}
              roles={roles}
              value={roleId}
              onChange={setRoleId}
            />
          )}
          <ToggleRow label={t("publicOnTimeline")} value={isPublic} onToggle={() => setIsPublic(!isPublic)} />
        </FormCard>

        {isPublic && isMultiDay && !hasPublicMultiDay && (
          <Pressable
            onPress={() => openPaywall(t("settings:multiDayLockedHint"))}
            className="flex-row items-start gap-2 mb-3 -mt-1 px-3.5 py-3 rounded-xl bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 active:opacity-70"
          >
            <Lock size={14} color="#b96a4a" style={{ marginTop: 1 }} />
            <Text className="flex-1 text-xs text-primary-600 dark:text-primary-300 leading-4">
              {t("settings:multiDayLockedHint")}
            </Text>
          </Pressable>
        )}

        <SectionTitle>{t("notes")}</SectionTitle>
        <FormCard>
          <TextInput
            className="text-base text-ink min-h-[80px]"
            placeholder={t("detailsPlaceholder")}
            placeholderTextColor="#D0D0D8"
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
            editable={canEdit}
          />
        </FormCard>

        {!isNew && (
          <DeleteButton label={t("deleteMoment")} onPress={() => setShowDelete(true)} />
        )}

        <View className="h-24" />
      </ScrollView>

      <ConfirmSheet
        visible={showDelete}
        title={t("deleteMomentConfirm")}
        message={t("irreversible")}
        confirmLabel={t("common:delete")}
        destructive
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </View>
  );
}
