import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { v4 as uuid } from "uuid";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useVendorsStore } from "@/store/useVendorsStore";
import {
  TASK_STATUS_LABELS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
} from "@/db/types";
import type { TaskStatus, Priority } from "@/db/types";
import { StatusBadge } from "@/components/StatusBadge";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { SectionTitle, FormCard } from "@/components/FormSection";
import type { Task } from "@/db/schema";

const STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE", "CANCELLED"];
const PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const tasks = usePlanningStore((s) => s.tasks);
  const categories = usePlanningStore((s) => s.categories);
  const addTask = usePlanningStore((s) => s.addTask);
  const updateTask = usePlanningStore((s) => s.updateTask);
  const removeTask = usePlanningStore((s) => s.removeTask);
  const vendors = useVendorsStore((s) => s.vendors);

  const isNew = id === "new";
  const existing = tasks.find((t) => t.id === id);

  const [title, setTitle] = useState(existing?.title || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [status, setStatus] = useState<TaskStatus>(
    (existing?.status as TaskStatus) || "TODO"
  );
  const [priority, setPriority] = useState<Priority>(
    (existing?.priority as Priority) || "MEDIUM"
  );
  const [categoryId, setCategoryId] = useState(existing?.categoryId || "");
  const [monthsBefore, setMonthsBefore] = useState(
    existing?.monthsBefore?.toString() || ""
  );
  const [vendorId, setVendorId] = useState(existing?.vendorId || "");
  const [notes, setNotes] = useState(existing?.notes || "");
  const [showDelete, setShowDelete] = useState(false);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Erreur", "Le titre est obligatoire");
      return;
    }

    const now = new Date().toISOString();
    const taskData: Partial<Task> = {
      title: title.trim(),
      description: description || null,
      status,
      priority,
      categoryId: categoryId || null,
      monthsBefore: monthsBefore ? parseInt(monthsBefore) : null,
      vendorId: vendorId || null,
      notes: notes || null,
      completedAt: status === "DONE" ? now : null,
      updatedAt: now,
    };

    if (isNew) {
      addTask({
        ...taskData,
        id: uuid(),
        isSystem: false,
        dueDate: null,
        reminderDaysBefore: null,
        createdAt: now,
      } as Task);
    } else {
      updateTask(id!, taskData);
    }
    router.back();
  };

  const handleDelete = () => {
    removeTask(id!);
    setShowDelete(false);
    router.back();
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      <Stack.Screen
        options={{
          title: isNew ? "Nouvelle tâche" : title || "Tâche",
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
        {/* Status */}
        <SectionTitle>Statut</SectionTitle>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-5"
          contentContainerStyle={{ gap: 8 }}
        >
          {STATUSES.map((s) => (
            <Pressable key={s} onPress={() => setStatus(s)}>
              <StatusBadge
                label={TASK_STATUS_LABELS[s]}
                color={status === s ? "#EC4899" : "#D1D5DB"}
                size="md"
              />
            </Pressable>
          ))}
        </ScrollView>

        {/* Title & description */}
        <SectionTitle>Informations</SectionTitle>
        <FormCard>
          <View className="border-b border-gray-50 dark:border-gray-800 pb-3 mb-3">
            <Text className="text-xs text-gray-400 mb-1 font-medium">Titre *</Text>
            <TextInput
              className="text-base text-gray-900 dark:text-white"
              value={title}
              onChangeText={setTitle}
              placeholder="Titre de la tâche"
              placeholderTextColor="#D0D0D8"
            />
          </View>
          <Text className="text-xs text-gray-400 mb-1 font-medium">Description</Text>
          <TextInput
            className="text-base text-gray-900 dark:text-white min-h-[60px]"
            value={description}
            onChangeText={setDescription}
            placeholder="Détails, liens, contacts..."
            placeholderTextColor="#D0D0D8"
            multiline
            textAlignVertical="top"
          />
        </FormCard>

        {/* Priority */}
        <SectionTitle>Priorité</SectionTitle>
        <View className="flex-row gap-2 mb-5">
          {PRIORITIES.map((p) => (
            <Pressable
              key={p}
              onPress={() => setPriority(p)}
              className={`px-3 py-2 rounded-full flex-1 items-center border ${
                priority === p ? "border-transparent" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
              }`}
              style={
                priority === p
                  ? { backgroundColor: PRIORITY_COLORS[p] + "20" }
                  : {}
              }
            >
              <Text
                className="text-sm font-medium"
                style={{
                  color: priority === p ? PRIORITY_COLORS[p] : "#9CA3AF",
                }}
              >
                {PRIORITY_LABELS[p]}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Category */}
        {categories.length > 0 && (
          <>
            <SectionTitle>Catégorie</SectionTitle>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-5"
              contentContainerStyle={{ gap: 8 }}
            >
              <Pressable
                onPress={() => setCategoryId("")}
                className={`px-3.5 py-2 rounded-full border ${
                  !categoryId
                    ? "bg-primary-500 border-primary-500"
                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                }`}
              >
                <Text
                  className={`text-sm ${
                    !categoryId ? "text-white font-medium" : "text-gray-500"
                  }`}
                >
                  Aucune
                </Text>
              </Pressable>
              {categories.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => setCategoryId(c.id)}
                  className="px-3.5 py-2 rounded-full border border-transparent"
                  style={{
                    backgroundColor:
                      categoryId === c.id
                        ? (c.color || "#EC4899") + "25"
                        : "#F3F4F6",
                  }}
                >
                  <Text
                    className="text-sm font-medium"
                    style={{
                      color:
                        categoryId === c.id
                          ? c.color || "#EC4899"
                          : "#6B7280",
                    }}
                  >
                    {c.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        )}

        {/* Relative deadline */}
        <SectionTitle>Échéance relative</SectionTitle>
        <FormCard>
          <View className="flex-row items-center">
            <TextInput
              className="text-base text-gray-900 dark:text-white w-16 text-center border-b border-gray-200 dark:border-gray-700"
              value={monthsBefore}
              onChangeText={setMonthsBefore}
              keyboardType="numeric"
              placeholder="—"
              placeholderTextColor="#D0D0D8"
            />
            <Text className="text-base text-gray-500 dark:text-gray-400 ml-2">
              mois avant le mariage
            </Text>
          </View>
          <Text className="text-xs text-gray-400 mt-2">
            Valeur négative = après le mariage
          </Text>
        </FormCard>

        {/* Linked vendor */}
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
                <Text
                  className={`text-sm ${
                    !vendorId ? "text-white font-medium" : "text-gray-500"
                  }`}
                >
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
                  <Text
                    className={`text-sm ${
                      vendorId === v.id
                        ? "text-white font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {v.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        )}

        {/* Notes */}
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

        {/* Delete */}
        {!isNew && (
          <Pressable
            onPress={() => setShowDelete(true)}
            className="bg-red-50 dark:bg-red-950 rounded-2xl p-4 mb-8 items-center border border-red-100 dark:border-red-900"
          >
            <Text className="text-red-500 font-semibold text-sm">
              Supprimer cette tâche
            </Text>
          </Pressable>
        )}

        <View className="h-8" />
      </ScrollView>

      <ConfirmSheet
        visible={showDelete}
        title="Supprimer cette tâche ?"
        message="Cette action est irréversible."
        confirmLabel="Supprimer"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </View>
  );
}
