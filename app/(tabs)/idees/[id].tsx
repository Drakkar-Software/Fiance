import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { v4 as uuid } from "uuid";
import { useIdeasStore } from "@/store/useIdeasStore";
import { useVendorsStore } from "@/store/useVendorsStore";
import { IDEA_CATEGORY_LABELS } from "@/db/types";
import type { IdeaCategory } from "@/db/types";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import type { Idea } from "@/db/schema";

const CATEGORIES = Object.entries(IDEA_CATEGORY_LABELS) as [
  IdeaCategory,
  string
][];

export default function IdeaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const ideas = useIdeasStore((s) => s.ideas);
  const collections = useIdeasStore((s) => s.collections);
  const addIdea = useIdeasStore((s) => s.addIdea);
  const updateIdea = useIdeasStore((s) => s.updateIdea);
  const removeIdea = useIdeasStore((s) => s.removeIdea);
  const vendors = useVendorsStore((s) => s.vendors);

  const isNew = id === "new";
  const existing = ideas.find((i) => i.id === id);

  const [title, setTitle] = useState(existing?.title || "");
  const [notes, setNotes] = useState(existing?.notes || "");
  const [sourceUrl, setSourceUrl] = useState(existing?.sourceUrl || "");
  const [category, setCategory] = useState<IdeaCategory | "">(
    (existing?.category as IdeaCategory) || ""
  );
  const [collectionId, setCollectionId] = useState(
    existing?.collectionId || ""
  );
  const [vendorId, setVendorId] = useState(existing?.vendorId || "");
  const [isFavorite, setIsFavorite] = useState(existing?.isFavorite || false);
  const [tagsInput, setTagsInput] = useState(
    existing?.tags ? JSON.parse(existing.tags).join(", ") : ""
  );
  const [showDelete, setShowDelete] = useState(false);

  const handleSave = () => {
    const now = new Date().toISOString();
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const ideaData: Partial<Idea> = {
      title: title || null,
      notes: notes || null,
      sourceUrl: sourceUrl || null,
      category: category || null,
      collectionId: collectionId || null,
      vendorId: vendorId || null,
      isFavorite,
      tags: tags.length > 0 ? JSON.stringify(tags) : null,
      updatedAt: now,
    };

    if (isNew) {
      addIdea({
        ...ideaData,
        id: uuid(),
        imageUri: null,
        imageThumbnailUri: null,
        colorPalette: null,
        createdAt: now,
      } as Idea);
    } else {
      updateIdea(id!, ideaData);
    }
    router.back();
  };

  const handleDelete = () => {
    removeIdea(id!);
    setShowDelete(false);
    router.back();
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      <Stack.Screen
        options={{
          title: isNew ? "Nouvelle idée" : title || "Idée",
          headerRight: () => (
            <View className="flex-row items-center gap-3 mr-2">
              <Pressable onPress={() => setIsFavorite(!isFavorite)}>
                <Ionicons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={24}
                  color={isFavorite ? "#EF4444" : "#9CA3AF"}
                />
              </Pressable>
              <Pressable onPress={handleSave}>
                <Text className="text-primary-500 font-semibold text-base">
                  Enregistrer
                </Text>
              </Pressable>
            </View>
          ),
        }}
      />
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* Image preview */}
        {existing?.imageUri ? (
          <View className="rounded-xl overflow-hidden mb-4">
            <Image
              source={{ uri: existing.imageUri }}
              className="w-full"
              style={{ height: 250 }}
              resizeMode="cover"
            />
            {existing.colorPalette && (
              <View className="flex-row">
                {(JSON.parse(existing.colorPalette) as string[]).map(
                  (color, idx) => (
                    <View
                      key={idx}
                      className="flex-1 h-6"
                      style={{ backgroundColor: color }}
                    />
                  )
                )}
              </View>
            )}
          </View>
        ) : (
          <Pressable className="bg-white dark:bg-gray-900 rounded-xl p-8 mb-4 items-center">
            <Ionicons name="image-outline" size={48} color="#D1D5DB" />
            <Text className="text-gray-400 mt-2">
              Appuyez pour ajouter une image
            </Text>
          </Pressable>
        )}

        {/* Title & notes */}
        <SectionTitle>Informations</SectionTitle>
        <View className="bg-white dark:bg-gray-900 rounded-xl p-4 mb-6">
          <InputRow label="Titre" value={title} onChangeText={setTitle} />
          <InputRow
            label="URL source"
            value={sourceUrl}
            onChangeText={setSourceUrl}
          />
          <Text className="text-sm text-gray-500 mb-1 mt-3">Notes</Text>
          <TextInput
            className="text-base text-gray-900 dark:text-white min-h-[60px]"
            value={notes}
            onChangeText={setNotes}
            placeholder="Description, remarques..."
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Tags */}
        <SectionTitle>Tags</SectionTitle>
        <View className="bg-white dark:bg-gray-900 rounded-xl p-4 mb-6">
          <TextInput
            className="text-base text-gray-900 dark:text-white"
            value={tagsInput}
            onChangeText={setTagsInput}
            placeholder="rustique, verdure, suspendu... (séparés par des virgules)"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Category */}
        <SectionTitle>Catégorie</SectionTitle>
        <View className="flex-row flex-wrap gap-2 mb-6">
          {CATEGORIES.map(([key, label]) => (
            <Pressable
              key={key}
              onPress={() => setCategory(category === key ? "" : key)}
              className={`px-3 py-2 rounded-full ${
                category === key
                  ? "bg-primary-500"
                  : "bg-gray-100 dark:bg-gray-800"
              }`}
            >
              <Text
                className={`text-sm ${
                  category === key
                    ? "text-white font-medium"
                    : "text-gray-600"
                }`}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Collection */}
        {collections.length > 0 && (
          <>
            <SectionTitle>Collection</SectionTitle>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-6"
              contentContainerStyle={{ gap: 8 }}
            >
              <Pressable
                onPress={() => setCollectionId("")}
                className={`px-3 py-2 rounded-full ${
                  !collectionId
                    ? "bg-primary-500"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                <Text
                  className={`text-sm ${
                    !collectionId ? "text-white font-medium" : "text-gray-600"
                  }`}
                >
                  Aucune
                </Text>
              </Pressable>
              {collections.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => setCollectionId(c.id)}
                  className={`px-3 py-2 rounded-full ${
                    collectionId === c.id
                      ? "bg-primary-500"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      collectionId === c.id
                        ? "text-white font-medium"
                        : "text-gray-600"
                    }`}
                  >
                    {c.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        )}

        {/* Linked vendor */}
        {vendors.length > 0 && (
          <>
            <SectionTitle>Prestataire associé</SectionTitle>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-6"
              contentContainerStyle={{ gap: 8 }}
            >
              <Pressable
                onPress={() => setVendorId("")}
                className={`px-3 py-2 rounded-full ${
                  !vendorId
                    ? "bg-primary-500"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                <Text
                  className={`text-sm ${
                    !vendorId ? "text-white font-medium" : "text-gray-600"
                  }`}
                >
                  Aucun
                </Text>
              </Pressable>
              {vendors.map((v) => (
                <Pressable
                  key={v.id}
                  onPress={() => setVendorId(v.id)}
                  className={`px-3 py-2 rounded-full ${
                    vendorId === v.id
                      ? "bg-primary-500"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      vendorId === v.id
                        ? "text-white font-medium"
                        : "text-gray-600"
                    }`}
                  >
                    {v.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        )}

        {/* Delete */}
        {!isNew && (
          <Pressable
            onPress={() => setShowDelete(true)}
            className="bg-red-50 dark:bg-red-950 rounded-xl p-4 mb-8 items-center"
          >
            <Text className="text-red-500 font-semibold">
              Supprimer cette idée
            </Text>
          </Pressable>
        )}

        <View className="h-8" />
      </ScrollView>

      <ConfirmSheet
        visible={showDelete}
        title="Supprimer cette idée ?"
        message="Cette action est irréversible."
        confirmLabel="Supprimer"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="text-sm font-medium text-gray-500 mb-2 uppercase">
      {children}
    </Text>
  );
}

function InputRow({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
}) {
  return (
    <View className="border-b border-gray-100 dark:border-gray-800 py-3">
      <Text className="text-sm text-gray-500 mb-1">{label}</Text>
      <TextInput
        className="text-base text-gray-900 dark:text-white"
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );
}
