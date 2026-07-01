import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native-css/components";
import { Alert } from "react-native";
import { useRouter, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { Mail, Trash2, Pencil, ChevronRight, FileText } from "lucide-react-native";
import * as Crypto from "expo-crypto";
import { useCommunicationsStore } from "@/store/useCommunicationsStore";
import { useCommunicationTemplatesStore } from "@/store/useCommunicationTemplatesStore";
import { useGuestsStore } from "@/store/useGuestsStore";
import { useWeddingStore } from "@/store/useWeddingStore";
import { FAB } from "@/components/FAB";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { FormCard, DateRow, InputRow, ChipSelect, FormActions } from "@/components/FormSection";
import { StackMenu } from "@/components/StackMenu";
import { theme as GP } from "@/lib/theme";
import { analytics } from "@/lib/analytics";
import { renderTemplate, COMMUNICATION_CHANNEL_LABELS, type CommunicationChannel } from "@fiance/sdk";
import type { Communication } from "@/db/schema";

type FormState = { label: string; date: string; notes: string; channel: CommunicationChannel; subject: string; body: string; templateId: string };
const EMPTY_FORM: FormState = { label: "", date: "", notes: "", channel: "EMAIL", subject: "", body: "", templateId: "" };
const CHANNELS: CommunicationChannel[] = ["EMAIL", "POSTAL", "SMS", "WHATSAPP", "OTHER"];

export default function CommunicationsScreen() {
  const { t } = useTranslation("guests");
  const router = useRouter();
  const communications = useCommunicationsStore((s) => s.communications);
  const addCommunication = useCommunicationsStore((s) => s.addCommunication);
  const updateCommunication = useCommunicationsStore((s) => s.updateCommunication);
  const removeCommunication = useCommunicationsStore((s) => s.removeCommunication);
  const guests = useGuestsStore((s) => s.guests);
  const templates = useCommunicationTemplatesStore((s) => s.communicationTemplates);
  const wedding = useWeddingStore((s) => s.wedding);

  const applyTemplate = (form: FormState, templateId: string): FormState => {
    const template = templates.find((tpl) => tpl.id === templateId);
    if (!template) return { ...form, templateId };
    const rendered = renderTemplate(template, null, wedding ?? null);
    analytics.capture("communication_template_used");
    return {
      ...form,
      templateId,
      channel: template.channel as CommunicationChannel,
      subject: rendered.subject ?? form.subject,
      body: rendered.body,
    };
  };

  const [showAdd, setShowAdd] = useState(false);
  const [newForm, setNewForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const resetForm = () => {
    setShowAdd(false);
    setNewForm(EMPTY_FORM);
    setEditingId(null);
    setEditForm(EMPTY_FORM);
  };

  const handleAdd = () => {
    if (!newForm.label.trim()) {
      Alert.alert(t("common:error"), t("communicationNameRequired"));
      return;
    }
    const now = new Date().toISOString();
    addCommunication({
      id: Crypto.randomUUID(),
      label: newForm.label.trim(),
      date: newForm.date || null,
      notes: newForm.notes.trim() || null,
      recipients: [],
      channel: newForm.channel,
      subject: newForm.subject.trim() || null,
      body: newForm.body.trim() || null,
      templateId: newForm.templateId || null,
      createdAt: now,
      updatedAt: now,
    } as Communication);
    analytics.capture("communication_added");
    resetForm();
  };

  const handleEdit = (comm: Communication) => {
    setEditingId(comm.id);
    setEditForm({
      label: comm.label,
      date: comm.date ?? "",
      notes: comm.notes ?? "",
      channel: (comm.channel as CommunicationChannel) || "EMAIL",
      subject: comm.subject ?? "",
      body: comm.body ?? "",
      templateId: comm.templateId ?? "",
    });
    setShowAdd(false);
  };

  const handleSaveEdit = () => {
    if (!editForm.label.trim() || !editingId) return;
    updateCommunication(editingId, {
      label: editForm.label.trim(),
      date: editForm.date || null,
      notes: editForm.notes.trim() || null,
      channel: editForm.channel,
      subject: editForm.subject.trim() || null,
      body: editForm.body.trim() || null,
      templateId: editForm.templateId || null,
    });
    resetForm();
  };

  return (
    <View className="relative flex-1 bg-accent-paper">
      <Stack.Screen
        options={{
          headerRight: () => (
            <StackMenu
              items={[
                {
                  label: t("communications.templatesScreen"),
                  icon: FileText,
                  onPress: () => router.push("/(tabs)/guests/communications/templates"),
                },
              ]}
            />
          ),
        }}
      />
      {communications.length === 0 && !showAdd ? (
        <EmptyState
          icon={Mail}
          title={t("noCommunications")}
          description={t("createCommunicationsDesc")}
          actionLabel={t("newCommunication")}
          onAction={() => setShowAdd(true)}
        />
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          {showAdd && (
            <View className="bg-accent-card rounded-2xl p-4 mb-4 border border-primary-200 dark:border-primary-800">
              <Text className="text-base font-semibold text-ink mb-3">{t("newCommunication")}</Text>
              <TextInput
                className="text-base text-ink border-b border-hair pb-2 mb-2"
                placeholder={t("communicationNamePlaceholder")}
                placeholderTextColor="#D0D0D8"
                value={newForm.label}
                onChangeText={(v) => setNewForm((f) => ({ ...f, label: v }))}
                autoFocus
              />
              {templates.length > 0 && (
                <View className="mb-3">
                  <Text className="text-xs text-mute mb-2 font-medium">{t("communications.useTemplate")}</Text>
                  <ChipSelect
                    options={["", ...templates.map((tpl) => tpl.id)]}
                    value={newForm.templateId}
                    onChange={(id) => setNewForm((f) => applyTemplate(f, id))}
                    labels={Object.fromEntries([["", t("none")], ...templates.map((tpl) => [tpl.id, tpl.name])])}
                  />
                </View>
              )}
              <View className="mb-3">
                <ChipSelect
                  options={CHANNELS}
                  value={newForm.channel}
                  onChange={(channel) => setNewForm((f) => ({ ...f, channel }))}
                  labels={Object.fromEntries(CHANNELS.map((c) => [c, t(COMMUNICATION_CHANNEL_LABELS[c])])) as Record<CommunicationChannel, string>}
                />
              </View>
              <FormCard>
                <DateRow
                  label={t("communicationDate")}
                  value={newForm.date}
                  onChange={(v) => setNewForm((f) => ({ ...f, date: v }))}
                />
                <InputRow
                  label={t("communications.subject")}
                  value={newForm.subject}
                  onChangeText={(v) => setNewForm((f) => ({ ...f, subject: v }))}
                />
                <InputRow
                  label={t("communications.body")}
                  value={newForm.body}
                  onChangeText={(v) => setNewForm((f) => ({ ...f, body: v }))}
                  multiline
                />
                <InputRow
                  label={t("notes")}
                  value={newForm.notes}
                  onChangeText={(v) => setNewForm((f) => ({ ...f, notes: v }))}
                  placeholder={t("freeNotes")}
                  multiline
                />
              </FormCard>
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

          {communications.map((comm) => {
            const total = guests.length;
            const received = comm.recipients.length;

            if (editingId === comm.id) {
              return (
                <View key={comm.id} className="bg-accent-card rounded-2xl p-4 mb-2.5 border border-primary-200 dark:border-primary-800">
                  <Text className="text-sm text-mute mb-2">{comm.label}</Text>
                  <TextInput
                    className="text-base text-ink border-b border-hair pb-2 mb-2"
                    placeholder={t("communicationName")}
                    placeholderTextColor="#D0D0D8"
                    value={editForm.label}
                    onChangeText={(v) => setEditForm((f) => ({ ...f, label: v }))}
                    autoFocus
                    selectTextOnFocus
                  />
                  {templates.length > 0 && (
                    <View className="mb-3">
                      <Text className="text-xs text-mute mb-2 font-medium">{t("communications.useTemplate")}</Text>
                      <ChipSelect
                        options={["", ...templates.map((tpl) => tpl.id)]}
                        value={editForm.templateId}
                        onChange={(id) => setEditForm((f) => applyTemplate(f, id))}
                        labels={Object.fromEntries([["", t("none")], ...templates.map((tpl) => [tpl.id, tpl.name])])}
                      />
                    </View>
                  )}
                  <View className="mb-3">
                    <ChipSelect
                      options={CHANNELS}
                      value={editForm.channel}
                      onChange={(channel) => setEditForm((f) => ({ ...f, channel }))}
                      labels={Object.fromEntries(CHANNELS.map((c) => [c, t(COMMUNICATION_CHANNEL_LABELS[c])])) as Record<CommunicationChannel, string>}
                    />
                  </View>
                  <FormCard>
                    <DateRow
                      label={t("communicationDate")}
                      value={editForm.date}
                      onChange={(v) => setEditForm((f) => ({ ...f, date: v }))}
                    />
                    <InputRow
                      label={t("communications.subject")}
                      value={editForm.subject}
                      onChangeText={(v) => setEditForm((f) => ({ ...f, subject: v }))}
                    />
                    <InputRow
                      label={t("communications.body")}
                      value={editForm.body}
                      onChangeText={(v) => setEditForm((f) => ({ ...f, body: v }))}
                      multiline
                    />
                    <InputRow
                      label={t("notes")}
                      value={editForm.notes}
                      onChangeText={(v) => setEditForm((f) => ({ ...f, notes: v }))}
                      placeholder={t("freeNotes")}
                      multiline
                    />
                  </FormCard>
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
              <Pressable
                key={comm.id}
                onPress={() => router.push({ pathname: "/(tabs)/guests/communication/[id]", params: { id: comm.id } })}
                className="bg-accent-card rounded-2xl p-4 mb-2.5 border border-hair active:opacity-80"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="w-8 h-8 rounded-lg bg-accent-clay-soft dark:bg-primary-900 items-center justify-center mr-3">
                      <Mail size={15} color={GP.clay} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-ink">{comm.label}</Text>
                      <View className="flex-row items-center gap-1.5 mt-0.5">
                        {comm.date ? <Text className="text-xs text-mute">{comm.date}</Text> : null}
                        {comm.channel ? (
                          <View className="px-1.5 py-0.5 rounded bg-accent-clay-soft dark:bg-primary-900">
                            <Text className="text-[10px] font-semibold text-primary-600">
                              {t(COMMUNICATION_CHANNEL_LABELS[comm.channel as CommunicationChannel])}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      {comm.subject ? (
                        <Text className="text-xs text-mute mt-0.5" numberOfLines={1}>{comm.subject}</Text>
                      ) : null}
                    </View>
                  </View>
                  <View className="flex-row items-center gap-1">
                    {total > 0 && (
                      <View className="px-2.5 py-1 rounded-full bg-accent-paper mr-1">
                        <Text className="text-xs font-semibold text-mute">{received}/{total}</Text>
                      </View>
                    )}
                    <Pressable onPress={() => handleEdit(comm)} className="w-8 h-8 items-center justify-center">
                      <Pencil size={15} color="#9CA3AF" />
                    </Pressable>
                    <Pressable onPress={() => setDeleteId(comm.id)} className="w-8 h-8 items-center justify-center">
                      <Trash2 size={15} color="#EF4444" />
                    </Pressable>
                    <ChevronRight size={15} color="#9CA3AF" />
                  </View>
                </View>
                {comm.notes ? (
                  <Text className="text-xs text-mute mt-1.5 ml-11" numberOfLines={1}>{comm.notes}</Text>
                ) : null}
              </Pressable>
            );
          })}

          <View className="h-24" />
        </ScrollView>
      )}

      <FAB onPress={() => { resetForm(); setShowAdd(true); }} />

      <ConfirmSheet
        visible={!!deleteId}
        title={t("deleteCommunication")}
        message={t("deleteCommunicationMsg")}
        confirmLabel={t("common:delete")}
        destructive
        onConfirm={() => {
          if (deleteId) removeCommunication(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </View>
  );
}
