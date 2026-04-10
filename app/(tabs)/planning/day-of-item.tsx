import React, { useState } from "react";
import { View, Text, ScrollView, TextInput } from "react-native-css/components";
import { Alert } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import * as Crypto from "expo-crypto";
import { usePlanningStore } from "@/store/usePlanningStore";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { SectionTitle, FormCard, InputRow, DateRow, TimeRow, ToggleRow } from "@/components/FormSection";
import { DeleteButton } from "@/components/DeleteButton";
import { SaveHeaderButton } from "@/components/SaveHeaderButton";
import { useWeddingStore } from "@/store/useWeddingStore";
import type { DayOfItem } from "@/db/schema";

export default function DayOfItemScreen() {
  const { t } = useTranslation("planning");
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const items = usePlanningStore((s) => s.dayOfItems);
  const addItem = usePlanningStore((s) => s.addDayOfItem);
  const updateItem = usePlanningStore((s) => s.updateDayOfItem);
  const removeItem = usePlanningStore((s) => s.removeDayOfItem);

  const weddingDate = useWeddingStore((s) => s.wedding?.weddingDate);
  const isNew = id === "new";
  const existing = items.find((i) => i.id === id);

  const [title, setTitle] = useState(existing?.title || "");
  const [date, setDate] = useState(existing?.date || weddingDate || "");
  const [time, setTime] = useState(existing?.time || "");
  const [endTime, setEndTime] = useState(existing?.endTime || "");
  const [location, setLocation] = useState(existing?.location || "");
  const [responsible, setResponsible] = useState(existing?.responsible || "");
  const [notes, setNotes] = useState(existing?.notes || "");
  const [isPublic, setIsPublic] = useState(existing?.isPublic ?? false);
  const [showDelete, setShowDelete] = useState(false);

  const canSave = title.trim().length > 0 && time.trim().length > 0;

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
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      <Stack.Screen
        options={{
          title: isNew ? t("newMoment") : title || t("dayOf"),
          headerRight: () => (
            <SaveHeaderButton label={t("common:save")} enabled={canSave} onPress={handleSave} />
          ),
        }}
      />
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <SectionTitle>{t("information")}</SectionTitle>
        <FormCard>
          <InputRow label={t("momentLabel")} value={title} onChangeText={setTitle} placeholder={t("churchPlaceholder")} />
          <DateRow label={t("dateLabel")} value={date} onChange={setDate} />
          <TimeRow label={t("timeLabel")} value={time} onChange={setTime} placeholder="13:00" />
          <TimeRow label={t("endTimeLabel")} value={endTime} onChange={setEndTime} placeholder="13:30" />
          <InputRow label={t("locationLabel")} value={location} onChangeText={setLocation} placeholder={t("venuePlaceholder")} />
          <InputRow label={t("responsible")} value={responsible} onChangeText={setResponsible} placeholder={t("responsiblePlaceholder")} />
          <ToggleRow label={t("publicOnTimeline")} value={isPublic} onToggle={() => setIsPublic(!isPublic)} />
        </FormCard>

        <SectionTitle>{t("notes")}</SectionTitle>
        <FormCard>
          <TextInput
            className="text-base text-gray-900 dark:text-white min-h-[80px]"
            placeholder={t("detailsPlaceholder")}
            placeholderTextColor="#D0D0D8"
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
          />
        </FormCard>

        {!isNew && (
          <DeleteButton label={t("deleteMoment")} onPress={() => setShowDelete(true)} />
        )}

        <View className="h-8" />
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
