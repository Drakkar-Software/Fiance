import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, Pressable, Alert } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import * as Crypto from "expo-crypto";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useVendorsStore } from "@/store/useVendorsStore";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { SectionTitle, FormCard, InputRow } from "@/components/FormSection";
import type { AgendaEvent } from "@/db/schema";

export default function AgendaEventScreen() {
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

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Erreur", "Le titre est obligatoire");
      return;
    }
    if (!date.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(date.trim()) || isNaN(new Date(date.trim()).getTime())) {
      Alert.alert("Erreur", "La date est obligatoire au format AAAA-MM-JJ");
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
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      <Stack.Screen
        options={{
          title: isNew ? "Nouveau rendez-vous" : title || "Rendez-vous",
          headerRight: () => (
            <Pressable onPress={handleSave} className="mr-2">
              <Text className="text-primary-500 font-semibold text-base">
                Enregistrer
              </Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <SectionTitle>Informations</SectionTitle>
        <FormCard>
          <InputRow label="Titre *" value={title} onChangeText={setTitle} placeholder="Visite du lieu" />
          <InputRow label="Date *" value={date} onChangeText={setDate} placeholder="2026-03-15" />
          <InputRow label="Heure de début" value={time} onChangeText={setTime} placeholder="14:00" />
          <InputRow label="Heure de fin" value={endTime} onChangeText={setEndTime} placeholder="15:30" />
          <InputRow label="Lieu" value={location} onChangeText={setLocation} placeholder="Adresse ou nom du lieu" />
        </FormCard>

        {vendors.length > 0 && (
          <>
            <SectionTitle>Prestataire lié</SectionTitle>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-5"
              contentContainerStyle={{ gap: 8 }}
            >
              <Pressable
                onPress={() => setVendorId("")}
                className={`px-3.5 py-2 rounded-full border ${
                  !vendorId
                    ? "bg-primary-500 border-primary-500"
                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                }`}
              >
                <Text className={`text-sm ${!vendorId ? "text-white font-medium" : "text-gray-500"}`}>
                  Aucun
                </Text>
              </Pressable>
              {vendors.map((v) => (
                <Pressable
                  key={v.id}
                  onPress={() => setVendorId(v.id)}
                  className={`px-3.5 py-2 rounded-full border ${
                    vendorId === v.id
                      ? "bg-primary-500 border-primary-500"
                      : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <Text className={`text-sm ${vendorId === v.id ? "text-white font-medium" : "text-gray-500"}`}>
                    {v.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        )}

        <SectionTitle>Notes</SectionTitle>
        <FormCard>
          <TextInput
            className="text-base text-gray-900 dark:text-white min-h-[80px]"
            placeholder="Notes libres..."
            placeholderTextColor="#D0D0D8"
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
          />
        </FormCard>

        {!isNew && (
          <Pressable
            onPress={() => setShowDelete(true)}
            className="bg-red-50 dark:bg-red-950 rounded-2xl p-4 mb-8 items-center border border-red-100 dark:border-red-900"
          >
            <Text className="text-red-500 font-semibold text-sm">
              Supprimer ce rendez-vous
            </Text>
          </Pressable>
        )}

        <View className="h-8" />
      </ScrollView>

      <ConfirmSheet
        visible={showDelete}
        title="Supprimer ce rendez-vous ?"
        message="Cette action est irréversible."
        confirmLabel="Supprimer"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </View>
  );
}
