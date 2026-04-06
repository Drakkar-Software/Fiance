import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, Pressable, Alert } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import * as Crypto from "expo-crypto";
import { usePlanningStore } from "@/store/usePlanningStore";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { SectionTitle, FormCard, InputRow } from "@/components/FormSection";
import type { DayOfItem } from "@/db/schema";

export default function DayOfItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const items = usePlanningStore((s) => s.dayOfItems);
  const addItem = usePlanningStore((s) => s.addDayOfItem);
  const updateItem = usePlanningStore((s) => s.updateDayOfItem);
  const removeItem = usePlanningStore((s) => s.removeDayOfItem);

  const isNew = id === "new";
  const existing = items.find((i) => i.id === id);

  const [title, setTitle] = useState(existing?.title || "");
  const [time, setTime] = useState(existing?.time || "");
  const [endTime, setEndTime] = useState(existing?.endTime || "");
  const [location, setLocation] = useState(existing?.location || "");
  const [responsible, setResponsible] = useState(existing?.responsible || "");
  const [notes, setNotes] = useState(existing?.notes || "");
  const [showDelete, setShowDelete] = useState(false);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Erreur", "Le titre est obligatoire");
      return;
    }
    if (!time.trim()) {
      Alert.alert("Erreur", "L'heure est obligatoire");
      return;
    }

    const now = new Date().toISOString();
    const maxOrder = items.reduce((max, i) => Math.max(max, i.sortOrder || 0), 0);
    const data: Partial<DayOfItem> = {
      title: title.trim(),
      time: time.trim(),
      endTime: endTime || null,
      location: location || null,
      responsible: responsible || null,
      notes: notes || null,
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
          title: isNew ? "Nouveau moment" : title || "Jour J",
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
          <InputRow label="Moment *" value={title} onChangeText={setTitle} placeholder="Entrée de l'église" />
          <InputRow label="Heure *" value={time} onChangeText={setTime} placeholder="13:00" />
          <InputRow label="Heure de fin" value={endTime} onChangeText={setEndTime} placeholder="13:30" />
          <InputRow label="Lieu" value={location} onChangeText={setLocation} placeholder="Église Saint-Pierre" />
          <InputRow label="Responsable" value={responsible} onChangeText={setResponsible} placeholder="Wedding planner, témoin..." />
        </FormCard>

        <SectionTitle>Notes</SectionTitle>
        <FormCard>
          <TextInput
            className="text-base text-gray-900 dark:text-white min-h-[80px]"
            placeholder="Détails, instructions..."
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
              Supprimer ce moment
            </Text>
          </Pressable>
        )}

        <View className="h-8" />
      </ScrollView>

      <ConfirmSheet
        visible={showDelete}
        title="Supprimer ce moment ?"
        message="Cette action est irréversible."
        confirmLabel="Supprimer"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </View>
  );
}
