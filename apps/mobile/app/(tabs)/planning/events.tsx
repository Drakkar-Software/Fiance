import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native-css/components";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { CalendarRange, Trash2, Pencil, Star } from "lucide-react-native";
import * as Crypto from "expo-crypto";
import { WeddingEventType, WEDDING_EVENT_TYPE_LABELS } from "@fiance/sdk";
import { useWeddingEventsStore } from "@/store/useWeddingEventsStore";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { FAB } from "@/components/FAB";
import { ChipSelect, ToggleRow, DateRow, TimeRow, FormActions } from "@/components/FormSection";
import { analytics } from "@/lib/analytics";
import { useCanEditHere } from "@/lib/permissions/useCanEditHere";
import { useShowPaywall } from "@/components/PaywallProvider";
import { QuotaBadge } from "@/components/QuotaBadge";
import { useCanAddMore } from "@/lib/limits";
import { toast } from "@/lib/toast/sonner";
import type { WeddingEvent } from "@/db/schema";

const TYPES = Object.keys(WEDDING_EVENT_TYPE_LABELS) as WeddingEventType[];

interface FormState {
  type: WeddingEventType;
  title: string;
  date: string;
  startTime: string;
  venueName: string;
  address: string;
  isPrimary: boolean;
  isPublic: boolean;
}

function emptyForm(): FormState {
  return { type: "DINNER", title: "", date: "", startTime: "", venueName: "", address: "", isPrimary: false, isPublic: true };
}

export default function PlanningEventsScreen() {
  const { t } = useTranslation("planning");
  const canEdit = useCanEditHere();
  const events = useWeddingEventsStore((s) => s.weddingEvents);
  const addWeddingEvent = useWeddingEventsStore((s) => s.addWeddingEvent);
  const updateWeddingEvent = useWeddingEventsStore((s) => s.updateWeddingEvent);
  const removeWeddingEvent = useWeddingEventsStore((s) => s.removeWeddingEvent);

  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const canAddEvent = useCanAddMore("weddingEvents", events.length);
  const { openPaywall } = useShowPaywall();
  const handleAddEvent = () => {
    if (!canAddEvent) {
      const msg = t("common:premiumLimits.events");
      toast.error(msg);
      openPaywall(msg);
      return;
    }
    resetForm();
    setShowAdd(true);
  };

  const resetForm = () => {
    setShowAdd(false);
    setEditingId(null);
    setForm(emptyForm());
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      Alert.alert(t("common:error"), t("events.titleRequired"));
      return;
    }
    const now = new Date().toISOString();
    const makePrimary = form.isPrimary;
    if (editingId) {
      updateWeddingEvent(editingId, {
        type: form.type,
        title: form.title.trim(),
        date: form.date || now.slice(0, 10),
        startTime: form.startTime || null,
        venueName: form.venueName.trim() || null,
        address: form.address.trim() || null,
        isPrimary: makePrimary,
        isPublic: form.isPublic,
      });
      if (makePrimary) {
        for (const e of events) if (e.id !== editingId && e.isPrimary) updateWeddingEvent(e.id, { isPrimary: false });
      }
    } else {
      const newId = Crypto.randomUUID();
      addWeddingEvent({
        id: newId,
        type: form.type,
        title: form.title.trim(),
        date: form.date || now.slice(0, 10),
        startTime: form.startTime || null,
        endTime: null,
        venueName: form.venueName.trim() || null,
        address: form.address.trim() || null,
        notes: null,
        isPrimary: makePrimary,
        isPublic: form.isPublic,
        sortOrder: events.length + 1,
        createdAt: now,
        updatedAt: now,
      });
      if (makePrimary) {
        for (const e of events) if (e.isPrimary) updateWeddingEvent(e.id, { isPrimary: false });
      }
      analytics.capture("wedding_event_created");
    }
    resetForm();
  };

  const handleEdit = (e: WeddingEvent) => {
    setEditingId(e.id);
    setShowAdd(false);
    setForm({
      type: e.type as WeddingEventType,
      title: e.title,
      date: e.date,
      startTime: e.startTime ?? "",
      venueName: e.venueName ?? "",
      address: e.address ?? "",
      isPrimary: e.isPrimary ?? false,
      isPublic: e.isPublic ?? false,
    });
  };

  const typeLabels = Object.fromEntries(TYPES.map((ty) => [ty, t(WEDDING_EVENT_TYPE_LABELS[ty])])) as Record<WeddingEventType, string>;

  const renderForm = () => (
    <View className="bg-accent-card rounded-2xl p-4 mb-4 border border-primary-200 dark:border-primary-800">
      <Text className="text-base font-semibold text-ink mb-3">
        {editingId ? t("events.editEvent") : t("events.newEvent")}
      </Text>

      <TextInput
        className="text-base text-ink border-b border-hair pb-2 mb-4"
        placeholder={t("events.titlePlaceholder")}
        placeholderTextColor="#D0D0D8"
        value={form.title}
        onChangeText={(title) => setForm((f) => ({ ...f, title }))}
        editable={canEdit}
      />

      <ChipSelect options={TYPES} value={form.type} onChange={(type) => setForm((f) => ({ ...f, type }))} labels={typeLabels} />

      <View className="mt-3">
        <DateRow label={t("dateLabel")} value={form.date} onChange={(date) => setForm((f) => ({ ...f, date }))} />
        <TimeRow label={t("startTime")} value={form.startTime} onChange={(startTime) => setForm((f) => ({ ...f, startTime }))} placeholder="14:00" />
      </View>

      <TextInput
        className="text-base text-ink border-b border-hair pb-2 mt-3"
        placeholder={t("events.venuePlaceholder")}
        placeholderTextColor="#D0D0D8"
        value={form.venueName}
        onChangeText={(venueName) => setForm((f) => ({ ...f, venueName }))}
        editable={canEdit}
      />
      <TextInput
        className="text-base text-ink border-b border-hair pb-2 mt-3"
        placeholder={t("events.addressPlaceholder")}
        placeholderTextColor="#D0D0D8"
        value={form.address}
        onChangeText={(address) => setForm((f) => ({ ...f, address }))}
        editable={canEdit}
      />

      <View className="mt-3">
        <ToggleRow label={t("events.isPrimary")} value={form.isPrimary} onToggle={() => setForm((f) => ({ ...f, isPrimary: !f.isPrimary }))} />
        <ToggleRow label={t("events.isPublic")} value={form.isPublic} onToggle={() => setForm((f) => ({ ...f, isPublic: !f.isPublic }))} />
      </View>

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

  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date) || (a.startTime || "").localeCompare(b.startTime || ""));

  return (
    <View className="relative flex-1 bg-accent-paper">
      {events.length === 0 && !showAdd ? (
        <EmptyState
          icon={CalendarRange}
          title={t("events.empty")}
          description={t("events.emptyDesc")}
          actionLabel={t("events.newEvent")}
          onAction={handleAddEvent}
        />
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          <View className="mb-3">
            <QuotaBadge entityKey="weddingEvents" count={events.length} />
          </View>

          {showAdd && renderForm()}

          {sorted.map((e) => {
            if (editingId === e.id) return <View key={e.id}>{renderForm()}</View>;
            return (
              <View key={e.id} className="bg-accent-card rounded-2xl p-4 mb-2.5 border border-hair">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-1.5">
                      <Text className="text-base font-semibold text-ink">{e.title}</Text>
                      {e.isPrimary && <Star size={13} color="#c9922f" fill="#c9922f" />}
                    </View>
                    <Text className="text-xs text-mute mt-0.5">
                      {t(WEDDING_EVENT_TYPE_LABELS[e.type as WeddingEventType])} · {e.date}
                      {e.startTime ? ` · ${e.startTime}` : ""}
                      {e.venueName ? ` · ${e.venueName}` : ""}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    {canEdit && (
                      <Pressable onPress={() => handleEdit(e)} className="w-8 h-8 items-center justify-center">
                        <Pencil size={15} color="#9CA3AF" />
                      </Pressable>
                    )}
                    {canEdit && (
                      <Pressable onPress={() => setDeleteId(e.id)} className="w-8 h-8 items-center justify-center">
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

      <FAB onPress={handleAddEvent} locked={!canAddEvent} />

      <ConfirmSheet
        visible={!!deleteId}
        title={t("events.deleteEvent")}
        message={t("events.deleteEventMsg")}
        confirmLabel={t("common:delete")}
        destructive
        onConfirm={() => {
          if (deleteId) removeWeddingEvent(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </View>
  );
}
