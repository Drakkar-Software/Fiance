import React, { useState } from "react";
import { View, Text, ScrollView, TextInput } from "react-native-css/components";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import * as Crypto from "expo-crypto";
import { useSpeechesMusicStore } from "@/store/useSpeechesMusicStore";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useGuestsStore } from "@/store/useGuestsStore";
import { useWeddingPartyStore } from "@/store/useWeddingPartyStore";
import { analytics } from "@/lib/analytics";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { SectionTitle, FormCard, InputRow } from "@/components/FormSection";
import { DeleteButton } from "@/components/DeleteButton";
import { SaveHeaderButton } from "@/components/SaveHeaderButton";
import { HorizontalChipSelect } from "@/components/HorizontalChipSelect";
import { PageHeader } from "@/components/PageHeader";
import type { Speech } from "@/db/schema";

export default function SpeechScreen() {
  const { t } = useTranslation("planning");
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const speeches = useSpeechesMusicStore((s) => s.speeches);
  const addSpeech = useSpeechesMusicStore((s) => s.addSpeech);
  const updateSpeech = useSpeechesMusicStore((s) => s.updateSpeech);
  const removeSpeech = useSpeechesMusicStore((s) => s.removeSpeech);
  const dayOfItems = usePlanningStore((s) => s.dayOfItems);
  const guests = useGuestsStore((s) => s.guests);
  const roles = useWeddingPartyStore((s) => s.weddingRoles);

  const isNew = id === "new";
  const existing = speeches.find((s) => s.id === id);

  const [title, setTitle] = useState(existing?.title || "");
  const [guestId, setGuestId] = useState(existing?.guestId || "");
  const [speakerName, setSpeakerName] = useState(existing?.speakerName || "");
  const [roleId, setRoleId] = useState(existing?.roleId || "");
  const [durationMin, setDurationMin] = useState(existing?.durationMin != null ? String(existing.durationMin) : "");
  const [dayOfItemId, setDayOfItemId] = useState(existing?.dayOfItemId || "");
  const [content, setContent] = useState(existing?.content || "");
  const [showDelete, setShowDelete] = useState(false);

  const canSave = title.trim().length > 0 || speakerName.trim().length > 0 || guestId.length > 0;

  const handleSave = () => {
    if (!canSave) return;
    const now = new Date().toISOString();
    const parsedDuration = durationMin.trim() ? Number(durationMin.trim()) : null;
    const data: Partial<Speech> = {
      title: title.trim() || null,
      guestId: guestId || null,
      speakerName: speakerName.trim() || null,
      roleId: roleId || null,
      durationMin: parsedDuration != null && !Number.isNaN(parsedDuration) ? parsedDuration : null,
      dayOfItemId: dayOfItemId || null,
      content: content.trim() || null,
    };
    if (isNew) {
      addSpeech({
        ...data,
        id: Crypto.randomUUID(),
        sortOrder: speeches.length + 1,
        createdAt: now,
        updatedAt: now,
      } as Speech);
      analytics.capture("speech_added");
    } else {
      updateSpeech(id!, data);
    }
    router.back();
  };

  const handleDelete = () => {
    removeSpeech(id!);
    analytics.capture("speech_deleted");
    setShowDelete(false);
    router.back();
  };

  return (
    <View className="flex-1 bg-accent-paper">
      <Stack.Screen
        options={{
          title: title || t("speeches.newSpeech"),
          headerRight: () => (
            <SaveHeaderButton label={t("common:save")} enabled={canSave} onPress={handleSave} />
          ),
        }}
      />
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <PageHeader eyebrow={t("speeches.tab")} title={title || t("speeches.newSpeech")} titleSize={26} />

        <SectionTitle>{t("speeches.information")}</SectionTitle>
        <FormCard>
          <InputRow label={t("speeches.speechTitle")} value={title} onChangeText={setTitle} placeholder={t("speeches.speechTitlePlaceholder")} />
          <InputRow
            label={t("speeches.durationLabel")}
            value={durationMin}
            onChangeText={setDurationMin}
            keyboardType="numeric"
            placeholder={t("speeches.durationPlaceholder")}
          />
        </FormCard>

        {guests.length > 0 && (
          <>
            <SectionTitle>{t("speeches.speakerGuest")}</SectionTitle>
            <HorizontalChipSelect
              options={[
                { key: "", label: t("common:none") },
                ...guests.map((g) => ({ key: g.id, label: `${g.firstName} ${g.lastName}`.trim() })),
              ]}
              activeKey={guestId}
              onSelect={setGuestId}
            />
          </>
        )}

        {roles.length > 0 && (
          <>
            <SectionTitle>{t("speeches.linkedRole")}</SectionTitle>
            <HorizontalChipSelect
              options={[{ key: "", label: t("common:none") }, ...roles.map((r) => ({ key: r.id, label: r.name }))]}
              activeKey={roleId}
              onSelect={setRoleId}
            />
          </>
        )}

        <SectionTitle>{t("speeches.speakerName")}</SectionTitle>
        <FormCard>
          <InputRow
            label={t("speeches.speakerName")}
            value={speakerName}
            onChangeText={setSpeakerName}
            placeholder={t("speeches.speakerNamePlaceholder")}
          />
        </FormCard>

        {dayOfItems.length > 0 && (
          <>
            <SectionTitle>{t("speeches.linkedDayOfItem")}</SectionTitle>
            <HorizontalChipSelect
              options={[
                { key: "", label: t("common:none") },
                ...dayOfItems.map((d) => ({ key: d.id, label: `${d.title} · ${d.time}` })),
              ]}
              activeKey={dayOfItemId}
              onSelect={setDayOfItemId}
            />
          </>
        )}

        <SectionTitle>{t("speeches.content")}</SectionTitle>
        <FormCard>
          <TextInput
            className="text-base text-ink min-h-[120px]"
            value={content}
            onChangeText={setContent}
            placeholder={t("speeches.contentPlaceholder")}
            placeholderTextColor="#D0D0D8"
            multiline
            textAlignVertical="top"
          />
        </FormCard>

        {!isNew && <DeleteButton label={t("speeches.deleteSpeech")} onPress={() => setShowDelete(true)} />}

        <View className="h-24" />
      </ScrollView>

      <ConfirmSheet
        visible={showDelete}
        title={t("speeches.deleteSpeechConfirm")}
        message={t("speeches.irreversible")}
        confirmLabel={t("common:delete")}
        destructive
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </View>
  );
}

export async function generateStaticParams() { return []; }
