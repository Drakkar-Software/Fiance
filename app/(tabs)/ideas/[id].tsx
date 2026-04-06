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
import { useTranslation } from "react-i18next";
import { Heart, Image as ImageIcon } from "lucide-react-native";
import * as Crypto from "expo-crypto";
import { useIdeasStore } from "@/store/useIdeasStore";
import { useVendorsStore } from "@/store/useVendorsStore";
import { IDEA_CATEGORY_LABELS } from "@/db/types";
import type { IdeaCategory } from "@/db/types";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { SectionTitle, FormCard, InputRow } from "@/components/FormSection";
import type { Idea } from "@/db/schema";

const CATEGORIES = Object.entries(IDEA_CATEGORY_LABELS) as [
  IdeaCategory,
  string
][];

export default function IdeaDetailScreen() {
  const { t } = useTranslation("ideas");
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
  const [collectionId, setCollectionId] = useState(existing?.collectionId || "");
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
        id: Crypto.randomUUID(),
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
                <Heart
                  size={24}
                  color={isFavorite ? "#EF4444" : "#C0C0C8"}
                  fill={isFavorite ? "#EF4444" : "transparent"}
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
          <View className="rounded-2xl overflow-hidden mb-5 border border-gray-100 dark:border-gray-800">
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
                      className="flex-1 h-5"
                      style={{ backgroundColor: color }}
                    />
                  )
                )}
              </View>
            )}
          </View>
        ) : (
          <Pressable className="bg-accent-cream dark:bg-gray-900 rounded-2xl p-8 mb-5 items-center border border-gray-100 dark:border-gray-800">
            <ImageIcon size={40} color="#E8D5C0" />
            <Text className="text-gray-400 mt-2 text-sm">
              Appuyez pour ajouter une image
            </Text>
          </Pressable>
        )}

        {/* Title & notes */}
        <SectionTitle>Informations</SectionTitle>
        <FormCard>
          <InputRow label="Titre" value={title} onChangeText={setTitle} />
          <InputRow label="URL source" value={sourceUrl} onChangeText={setSourceUrl} />
          <Text className="text-xs text-gray-400 mb-1 mt-3 font-medium">Notes</Text>
          <TextInput
            className="text-base text-gray-900 dark:text-white min-h-[60px]"
            value={notes}
            onChangeText={setNotes}
            placeholder="Description, remarques..."
            placeholderTextColor="#D0D0D8"
            multiline
            textAlignVertical="top"
          />
        </FormCard>

        {/* Tags */}
        <SectionTitle>Tags</SectionTitle>
        <FormCard>
          <TextInput
            className="text-base text-gray-900 dark:text-white"
            value={tagsInput}
            onChangeText={setTagsInput}
            placeholder="rustique, verdure, suspendu..."
            placeholderTextColor="#D0D0D8"
          />
        </FormCard>

        {/* Category */}
        <SectionTitle>Catégorie</SectionTitle>
        <View className="flex-row flex-wrap gap-2 mb-5">
          {CATEGORIES.map(([key, label]) => (
            <Pressable
              key={key}
              onPress={() => setCategory(category === key ? "" : key)}
              className={`px-3.5 py-2 rounded-full border ${
                category === key
                  ? "bg-primary-500 border-primary-500"
                  : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
              }`}
            >
              <Text
                className={`text-sm ${
                  category === key
                    ? "text-white font-medium"
                    : "text-gray-500"
                }`}
              >
                {t(label)}
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
              className="mb-5"
              contentContainerStyle={{ gap: 8 }}
            >
              <Pressable
                onPress={() => setCollectionId("")}
                className={`px-3.5 py-2 rounded-full border ${
                  !collectionId
                    ? "bg-primary-500 border-primary-500"
                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                }`}
              >
                <Text
                  className={`text-sm ${
                    !collectionId ? "text-white font-medium" : "text-gray-500"
                  }`}
                >
                  Aucune
                </Text>
              </Pressable>
              {collections.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => setCollectionId(c.id)}
                  className={`px-3.5 py-2 rounded-full border ${
                    collectionId === c.id
                      ? "bg-primary-500 border-primary-500"
                      : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      collectionId === c.id
                        ? "text-white font-medium"
                        : "text-gray-500"
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

        {/* Delete */}
        {!isNew && (
          <Pressable
            onPress={() => setShowDelete(true)}
            className="bg-red-50 dark:bg-red-950 rounded-2xl p-4 mb-8 items-center border border-red-100 dark:border-red-900"
          >
            <Text className="text-red-500 font-semibold text-sm">
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
