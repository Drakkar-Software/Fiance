import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native-css/components";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { FileText, Trash2, Pencil } from "lucide-react-native";
import * as Crypto from "expo-crypto";
import { useCommunicationTemplatesStore } from "@/store/useCommunicationTemplatesStore";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { FAB } from "@/components/FAB";
import { ChipSelect, FormActions } from "@/components/FormSection";
import { COMMUNICATION_CHANNEL_LABELS, type CommunicationChannel } from "@fiance/sdk";
import type { CommunicationTemplate } from "@/db/schema";

const CHANNELS: CommunicationChannel[] = ["EMAIL", "POSTAL", "SMS", "WHATSAPP", "OTHER"];

interface FormState {
  name: string;
  channel: CommunicationChannel;
  subject: string;
  body: string;
}

function emptyForm(): FormState {
  return { name: "", channel: "EMAIL", subject: "", body: "" };
}

export default function CommunicationTemplatesScreen() {
  const { t } = useTranslation("guests");
  const templates = useCommunicationTemplatesStore((s) => s.communicationTemplates);
  const addCommunicationTemplate = useCommunicationTemplatesStore((s) => s.addCommunicationTemplate);
  const updateCommunicationTemplate = useCommunicationTemplatesStore((s) => s.updateCommunicationTemplate);
  const removeCommunicationTemplate = useCommunicationTemplatesStore((s) => s.removeCommunicationTemplate);

  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const resetForm = () => {
    setShowAdd(false);
    setEditingId(null);
    setForm(emptyForm());
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.body.trim()) {
      Alert.alert(t("common:error"), t("communications.templates.nameAndBodyRequired"));
      return;
    }
    const now = new Date().toISOString();
    if (editingId) {
      updateCommunicationTemplate(editingId, {
        name: form.name.trim(),
        channel: form.channel,
        subject: form.subject.trim() || null,
        body: form.body.trim(),
      });
    } else {
      addCommunicationTemplate({
        id: Crypto.randomUUID(),
        name: form.name.trim(),
        channel: form.channel,
        subject: form.subject.trim() || null,
        body: form.body.trim(),
        isSystem: false,
        createdAt: now,
        updatedAt: now,
      });
    }
    resetForm();
  };

  const handleEdit = (tpl: CommunicationTemplate) => {
    setEditingId(tpl.id);
    setShowAdd(false);
    setForm({
      name: tpl.name,
      channel: tpl.channel as CommunicationChannel,
      subject: tpl.subject ?? "",
      body: tpl.body,
    });
  };

  const channelLabels = Object.fromEntries(CHANNELS.map((c) => [c, t(COMMUNICATION_CHANNEL_LABELS[c])])) as Record<CommunicationChannel, string>;

  const renderForm = () => (
    <View className="bg-accent-card rounded-2xl p-4 mb-4 border border-primary-200 dark:border-primary-800">
      <Text className="text-base font-semibold text-ink mb-3">
        {editingId ? t("communications.templates.editTemplate") : t("communications.templates.newTemplate")}
      </Text>
      <TextInput
        className="text-base text-ink border-b border-hair pb-2 mb-3"
        placeholder={t("communications.templates.namePlaceholder")}
        placeholderTextColor="#D0D0D8"
        value={form.name}
        onChangeText={(name) => setForm((f) => ({ ...f, name }))}
      />
      <ChipSelect options={CHANNELS} value={form.channel} onChange={(channel) => setForm((f) => ({ ...f, channel }))} labels={channelLabels} />
      <TextInput
        className="text-base text-ink border-b border-hair pb-2 mt-3"
        placeholder={t("communications.subject")}
        placeholderTextColor="#D0D0D8"
        value={form.subject}
        onChangeText={(subject) => setForm((f) => ({ ...f, subject }))}
      />
      <TextInput
        className="text-base text-ink pt-3 mt-3"
        placeholder={t("communications.templates.bodyPlaceholder")}
        placeholderTextColor="#D0D0D8"
        value={form.body}
        onChangeText={(body) => setForm((f) => ({ ...f, body }))}
        multiline
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
      {templates.length === 0 && !showAdd ? (
        <EmptyState
          icon={FileText}
          title={t("communications.templates.empty")}
          description={t("communications.templates.emptyDesc")}
          actionLabel={t("communications.templates.newTemplate")}
          onAction={() => setShowAdd(true)}
        />
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          {showAdd && renderForm()}

          {templates.map((tpl) => {
            if (editingId === tpl.id) return <View key={tpl.id}>{renderForm()}</View>;
            return (
              <View key={tpl.id} className="bg-accent-card rounded-2xl p-4 mb-2.5 border border-hair">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-ink">{tpl.name}</Text>
                    <Text className="text-xs text-mute mt-0.5">
                      {t(COMMUNICATION_CHANNEL_LABELS[tpl.channel as CommunicationChannel])}
                      {tpl.subject ? ` · ${tpl.subject}` : ""}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Pressable onPress={() => handleEdit(tpl)} className="w-8 h-8 items-center justify-center">
                      <Pencil size={15} color="#9CA3AF" />
                    </Pressable>
                    {!tpl.isSystem && (
                      <Pressable onPress={() => setDeleteId(tpl.id)} className="w-8 h-8 items-center justify-center">
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
        title={t("communications.templates.deleteTemplate")}
        message={t("communications.templates.deleteTemplateMsg")}
        confirmLabel={t("common:delete")}
        destructive
        onConfirm={() => {
          if (deleteId) removeCommunicationTemplate(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </View>
  );
}
