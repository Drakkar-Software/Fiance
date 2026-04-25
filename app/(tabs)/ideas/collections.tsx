import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native-css/components";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react-native";
import * as Crypto from "expo-crypto";
import { useIdeasStore } from "@/store/useIdeasStore";
import { FAB } from "@/components/FAB";
import { ConfirmSheet } from "@/components/ConfirmSheet";

export default function CollectionsScreen() {
  const { t } = useTranslation("ideas");
  const collections = useIdeasStore((s) => s.collections);
  const ideas = useIdeasStore((s) => s.ideas);
  const addCollection = useIdeasStore((s) => s.addCollection);
  const removeCollection = useIdeasStore((s) => s.removeCollection);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newName.trim()) {
      Alert.alert(t("common:error"), t("nameRequired"));
      return;
    }
    const now = new Date().toISOString();
    addCollection({
      id: Crypto.randomUUID(),
      name: newName.trim(),
      description: newDescription || null,
      coverIdeaId: null,
      sortOrder: collections.length,
      createdAt: now,
      updatedAt: now,
    });
    setNewName("");
    setNewDescription("");
    setShowAdd(false);
  };

  return (
    <View className="flex-1 bg-accent-paper">
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {showAdd && (
          <View className="bg-accent-card rounded-xl p-4 mb-4">
            <Text className="text-base font-semibold text-ink mb-3">
              {t("newCollection")}
            </Text>
            <TextInput
              className="text-base text-ink border-b border-hair pb-2 mb-3"
              placeholder={t("collectionName")}
              placeholderTextColor="#9CA3AF"
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />
            <TextInput
              className="text-base text-ink border-b border-hair pb-2 mb-3"
              placeholder={t("collectionDesc")}
              placeholderTextColor="#9CA3AF"
              value={newDescription}
              onChangeText={setNewDescription}
            />
            <View className="flex-row gap-2">
              <Pressable
                onPress={handleAdd}
                className="flex-1 bg-primary-500 py-2 rounded-lg items-center"
              >
                <Text className="text-white font-semibold">{t("common:create")}</Text>
              </Pressable>
              <Pressable
                onPress={() => setShowAdd(false)}
                className="flex-1 bg-accent-paper py-2 rounded-lg items-center"
              >
                <Text className="text-mute">{t("common:cancel")}</Text>
              </Pressable>
            </View>
          </View>
        )}

        {collections.map((col) => {
          const count = ideas.filter((i) => i.collectionId === col.id).length;
          return (
            <View
              key={col.id}
              className="bg-accent-card rounded-xl p-4 mb-3 shadow-sm"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-ink">
                    {col.name}
                  </Text>
                  {col.description && (
                    <Text className="text-sm text-mute mt-0.5">
                      {col.description}
                    </Text>
                  )}
                  <Text className="text-sm text-mute mt-1">
                    {t("idea", { count })}
                  </Text>
                </View>
                <Pressable onPress={() => setDeleteId(col.id)}>
                  <Trash2 size={18} color="#EF4444" />
                </Pressable>
              </View>
            </View>
          );
        })}
        <View className="h-24" />
      </ScrollView>

      <FAB onPress={() => setShowAdd(true)} />

      <ConfirmSheet
        visible={!!deleteId}
        title={t("deleteCollection")}
        message={t("deleteCollectionMsg")}
        confirmLabel={t("common:delete")}
        destructive
        onConfirm={() => {
          if (deleteId) removeCollection(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </View>
  );
}
