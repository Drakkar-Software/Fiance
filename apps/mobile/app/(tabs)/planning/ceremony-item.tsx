import React, { useState } from "react";
import { View, Text, ScrollView, TextInput } from "react-native-css/components";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import * as Crypto from "expo-crypto";
import { CEREMONY_ITEM_KIND_LABELS } from "@fiance/sdk";
import type { CeremonyItemKind } from "@fiance/sdk";
import { useCeremonyStore } from "@/store/useCeremonyStore";
import { useWeddingEventsStore } from "@/store/useWeddingEventsStore";
import { useGuestsStore } from "@/store/useGuestsStore";
import { useWeddingPartyStore } from "@/store/useWeddingPartyStore";
import { analytics } from "@/lib/analytics";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { SectionTitle, FormCard, InputRow, ChipSelect } from "@/components/FormSection";
import { DeleteButton } from "@/components/DeleteButton";
import { SaveHeaderButton } from "@/components/SaveHeaderButton";
import { HorizontalChipSelect } from "@/components/HorizontalChipSelect";
import { PageHeader } from "@/components/PageHeader";
import type { CeremonyItem } from "@/db/schema";

const KINDS = Object.keys(CEREMONY_ITEM_KIND_LABELS) as CeremonyItemKind[];

export default function CeremonyItemScreen() {
  const { t } = useTranslation("planning");
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const items = useCeremonyStore((s) => s.ceremonyItems);
  const addCeremonyItem = useCeremonyStore((s) => s.addCeremonyItem);
  const updateCeremonyItem = useCeremonyStore((s) => s.updateCeremonyItem);
  const removeCeremonyItem = useCeremonyStore((s) => s.removeCeremonyItem);
  const weddingEvents = useWeddingEventsStore((s) => s.weddingEvents);
  const guests = useGuestsStore((s) => s.guests);
  const roles = useWeddingPartyStore((s) => s.weddingRoles);

  const isNew = id === "new";
  const existing = items.find((i) => i.id === id);

  const [kind, setKind] = useState<CeremonyItemKind>((existing?.kind as CeremonyItemKind) || "READING");
  const [title, setTitle] = useState(existing?.title || "");
  const [reference, setReference] = useState(existing?.reference || "");
  const [content, setContent] = useState(existing?.content || "");
  const [eventId, setEventId] = useState(existing?.eventId || "");
  const [roleId, setRoleId] = useState(existing?.roleId || "");
  const [guestId, setGuestId] = useState(existing?.guestId || "");
  const [performerName, setPerformerName] = useState(existing?.performerName || "");
  const [notes, setNotes] = useState(existing?.notes || "");
  const [showDelete, setShowDelete] = useState(false);

  const kindLabels = Object.fromEntries(
    KINDS.map((k) => [k, t(CEREMONY_ITEM_KIND_LABELS[k])])
  ) as Record<CeremonyItemKind, string>;

  const canSave = title.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    const now = new Date().toISOString();
    const data: Partial<CeremonyItem> = {
      kind,
      title: title.trim(),
      reference: reference.trim() || null,
      content: content.trim() || null,
      eventId: eventId || null,
      roleId: roleId || null,
      guestId: guestId || null,
      performerName: performerName.trim() || null,
      notes: notes.trim() || null,
    };
    if (isNew) {
      addCeremonyItem({
        ...data,
        id: Crypto.randomUUID(),
        sortOrder: items.length + 1,
        createdAt: now,
        updatedAt: now,
      } as CeremonyItem);
      analytics.capture("ceremony_item_added");
    } else {
      updateCeremonyItem(id!, data);
    }
    router.back();
  };

  const handleDelete = () => {
    removeCeremonyItem(id!);
    analytics.capture("ceremony_item_deleted");
    setShowDelete(false);
    router.back();
  };

  return (
    <View className="flex-1 bg-accent-paper">
      <Stack.Screen
        options={{
          title: title || t("ceremony.newItem"),
          headerRight: () => (
            <SaveHeaderButton label={t("common:save")} enabled={canSave} onPress={handleSave} />
          ),
        }}
      />
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <PageHeader eyebrow={t("ceremony.title")} title={title || t("ceremony.newItem")} titleSize={26} />

        <SectionTitle>{t("ceremony.kindLabel")}</SectionTitle>
        <ChipSelect options={KINDS} value={kind} onChange={setKind} labels={kindLabels} />

        <SectionTitle>{t("ceremony.information")}</SectionTitle>
        <FormCard>
          <InputRow label={t("ceremony.itemTitle")} value={title} onChangeText={setTitle} />
          <InputRow
            label={t("ceremony.reference")}
            value={reference}
            onChangeText={setReference}
            placeholder={t("ceremony.referencePlaceholder")}
          />
          <Text className="text-xs text-mute mb-1 mt-3 font-medium">{t("ceremony.content")}</Text>
          <TextInput
            className="text-base text-ink min-h-[100px]"
            value={content}
            onChangeText={setContent}
            placeholder={t("ceremony.contentPlaceholder")}
            placeholderTextColor="#D0D0D8"
            multiline
            textAlignVertical="top"
          />
        </FormCard>

        {weddingEvents.length > 0 && (
          <>
            <SectionTitle>{t("ceremony.linkedEvent")}</SectionTitle>
            <HorizontalChipSelect
              options={[{ key: "", label: t("common:none") }, ...weddingEvents.map((e) => ({ key: e.id, label: e.title }))]}
              activeKey={eventId}
              onSelect={setEventId}
            />
          </>
        )}

        {roles.length > 0 && (
          <>
            <SectionTitle>{t("ceremony.linkedRole")}</SectionTitle>
            <HorizontalChipSelect
              options={[{ key: "", label: t("common:none") }, ...roles.map((r) => ({ key: r.id, label: r.name }))]}
              activeKey={roleId}
              onSelect={setRoleId}
            />
          </>
        )}

        {guests.length > 0 && (
          <>
            <SectionTitle>{t("ceremony.performerGuest")}</SectionTitle>
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

        <SectionTitle>{t("ceremony.performerName")}</SectionTitle>
        <FormCard>
          <InputRow
            label={t("ceremony.performerName")}
            value={performerName}
            onChangeText={setPerformerName}
            placeholder={t("ceremony.performerNamePlaceholder")}
          />
        </FormCard>

        <SectionTitle>{t("notes")}</SectionTitle>
        <FormCard>
          <TextInput
            className="text-base text-ink min-h-[60px]"
            value={notes}
            onChangeText={setNotes}
            placeholder={t("ceremony.notesPlaceholder")}
            placeholderTextColor="#D0D0D8"
            multiline
            textAlignVertical="top"
          />
        </FormCard>

        {!isNew && <DeleteButton label={t("ceremony.deleteItem")} onPress={() => setShowDelete(true)} />}

        <View className="h-24" />
      </ScrollView>

      <ConfirmSheet
        visible={showDelete}
        title={t("ceremony.deleteItemConfirm")}
        message={t("ceremony.irreversible")}
        confirmLabel={t("common:delete")}
        destructive
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </View>
  );
}

export async function generateStaticParams() { return []; }
