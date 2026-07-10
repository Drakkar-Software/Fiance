import React, { useState } from "react";
import { View, Text, ScrollView, TextInput } from "react-native-css/components";
import { Alert } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import * as Crypto from "expo-crypto";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useVendorsStore } from "@/store/useVendorsStore";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { SectionTitle, FormCard, InputRow, DateRow, TimeRow } from "@/components/FormSection";
import { DeleteButton } from "@/components/DeleteButton";
import { SaveHeaderButton } from "@/components/SaveHeaderButton";
import { HorizontalChipSelect } from "@/components/HorizontalChipSelect";
import { analytics } from "@/lib/analytics";
import type { AgendaEvent } from "@/db/schema";
import { PageHeader } from "@/components/PageHeader";
import { useCanEditHere } from "@/lib/permissions/useCanEditHere";

export default function AgendaEventScreen() {
  const { t } = useTranslation("planning");
  const canEdit = useCanEditHere();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const events = usePlanningStore((s) => s.agendaEvents);
  const addEvent = usePlanningStore((s) => s.addAgendaEvent);
  const updateEvent = usePlanningStore((s) => s.updateAgendaEvent);
  const removeEvent = usePlanningStore((s) => s.removeAgendaEvent);
  const vendors = useVendorsStore((s) => s.vendors);

  const isNew = id === "new";
  const existing = events.find((e) => e.id === id);

  const [title, setTitle] = useState(existing?.title || "");
  const [date, setDate] = useState(existing?.date || "");
  const [time, setTime] = useState(existing?.time || "");
  const [endTime, setEndTime] = useState(existing?.endTime || "");
  const [location, setLocation] = useState(existing?.location || "");
  const [vendorId, setVendorId] = useState(existing?.vendorId || "");
  const [notes, setNotes] = useState(existing?.notes || "");
  const [showDelete, setShowDelete] = useState(false);

  const canSave = title.trim().length > 0 && date.trim().length > 0 && !isNaN(new Date(date.trim()).getTime());

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert(t("common:error"), t("titleRequired"));
      return;
    }
    if (!date.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(date.trim()) || isNaN(new Date(date.trim()).getTime())) {
      Alert.alert(t("common:error"), t("dateRequired"));
      return;
    }

    const now = new Date().toISOString();
    const data: Partial<AgendaEvent> = {
      title: title.trim(),
      date: date.trim(),
      time: time || null,
      endTime: endTime || null,
      location: location || null,
      vendorId: vendorId || null,
      notes: notes || null,
      updatedAt: now,
    };

    if (isNew) {
      addEvent({ ...data, id: Crypto.randomUUID(), createdAt: now } as AgendaEvent);
      analytics.capture("agenda_event_added");
    } else {
      updateEvent(id!, data);
    }
    router.back();
  };

  const handleDelete = () => {
    removeEvent(id!);
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
          eyebrow={t("eventEyebrow")}
          title={title || t("newAppointment")}
          titleSize={22}
        />
        <SectionTitle>{t("information")}</SectionTitle>
        <FormCard>
          <InputRow label={t("titleLabel")} value={title} onChangeText={setTitle} placeholder={t("visitPlaceholder")} />
          <DateRow label={t("dateLabel")} value={date} onChange={setDate} />
          <TimeRow label={t("startTime")} value={time} onChange={setTime} placeholder="14:00" />
          <TimeRow label={t("endTime")} value={endTime} onChange={setEndTime} placeholder="15:30" />
          <InputRow label={t("location")} value={location} onChangeText={setLocation} placeholder={t("addressPlaceholder")} />
        </FormCard>

        {vendors.length > 0 && (
          <>
            <SectionTitle>{t("linkedVendorSection")}</SectionTitle>
            <HorizontalChipSelect
              options={[
                { key: "", label: t("common:none") },
                ...vendors.map((v) => ({ key: v.id, label: v.name })),
              ]}
              activeKey={vendorId}
              onSelect={setVendorId}
            />
          </>
        )}

        <SectionTitle>{t("notes")}</SectionTitle>
        <FormCard>
          <TextInput
            className="text-base text-ink min-h-[80px]"
            placeholder={t("freeNotes")}
            placeholderTextColor="#D0D0D8"
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
            editable={canEdit}
          />
        </FormCard>

        {!isNew && (
          <DeleteButton label={t("deleteAppointment")} onPress={() => setShowDelete(true)} />
        )}

        <View className="h-24" />
      </ScrollView>

      <ConfirmSheet
        visible={showDelete}
        title={t("deleteAppointmentConfirm")}
        message={t("irreversible")}
        confirmLabel={t("common:delete")}
        destructive
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </View>
  );
}
