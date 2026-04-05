import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import { Trash2 } from "lucide-react-native";
import * as Crypto from "expo-crypto";
import { useIdeasStore } from "@/store/useIdeasStore";
import { FAB } from "@/components/FAB";
import { ConfirmSheet } from "@/components/ConfirmSheet";

export default function CollectionsScreen() {
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
      Alert.alert("Erreur", "Le nom est obligatoire");
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
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {showAdd && (
          <View className="bg-white dark:bg-gray-900 rounded-xl p-4 mb-4">
            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
              Nouvelle collection
            </Text>
            <TextInput
              className="text-base text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2 mb-3"
              placeholder="Nom de la collection"
              placeholderTextColor="#9CA3AF"
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />
            <TextInput
              className="text-base text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2 mb-3"
              placeholder="Description (optionnelle)"
              placeholderTextColor="#9CA3AF"
              value={newDescription}
              onChangeText={setNewDescription}
            />
            <View className="flex-row gap-2">
              <Pressable
                onPress={handleAdd}
                className="flex-1 bg-primary-500 py-2 rounded-lg items-center"
              >
                <Text className="text-white font-semibold">Créer</Text>
              </Pressable>
              <Pressable
                onPress={() => setShowAdd(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-800 py-2 rounded-lg items-center"
              >
                <Text className="text-gray-600">Annuler</Text>
              </Pressable>
            </View>
          </View>
        )}

        {collections.map((col) => {
          const count = ideas.filter((i) => i.collectionId === col.id).length;
          return (
            <View
              key={col.id}
              className="bg-white dark:bg-gray-900 rounded-xl p-4 mb-3 shadow-sm"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900 dark:text-white">
                    {col.name}
                  </Text>
                  {col.description && (
                    <Text className="text-sm text-gray-500 mt-0.5">
                      {col.description}
                    </Text>
                  )}
                  <Text className="text-sm text-gray-400 mt-1">
                    {count} idée{count !== 1 ? "s" : ""}
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
        title="Supprimer cette collection ?"
        message="Les idées associées ne seront pas supprimées mais seront désassociées."
        confirmLabel="Supprimer"
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
