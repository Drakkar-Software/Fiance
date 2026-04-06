import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Heart,
  Flower2,
  Building2,
  Church,
  Shirt,
  Cake,
  Camera,
  MapPin,
  MoreHorizontal,
  Link as LinkIcon,
  Plus,
  X,
  ExternalLink,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import * as Crypto from "expo-crypto";
import { useIdeasStore } from "@/store/useIdeasStore";
import { useVendorsStore } from "@/store/useVendorsStore";
import { IDEA_CATEGORY_LABELS } from "@/db/types";
import type { IdeaCategory } from "@/db/types";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { SectionTitle, FormCard, InputRow } from "@/components/FormSection";
import { parseLinks, serializeLinks, isValidUrl } from "@/lib/links";
import type { Idea } from "@/db/schema";

const CATEGORIES = Object.keys(IDEA_CATEGORY_LABELS) as IdeaCategory[];

const CATEGORY_ICONS: Record<IdeaCategory, LucideIcon> = {
  TABLE_DECOR: Flower2,
  VENUE_DECOR: Building2,
  CEREMONY_DECOR: Church,
  BOUQUET: Flower2,
  ATTIRE: Shirt,
  CAKE: Cake,
  PHOTO_STYLE: Camera,
  VENUE: MapPin,
  OTHER: MoreHorizontal,
};

const CATEGORY_COLORS: Record<IdeaCategory, string> = {
  TABLE_DECOR: "#84CC16",
  VENUE_DECOR: "#10B981",
  CEREMONY_DECOR: "#8B5CF6",
  BOUQUET: "#EC4899",
  ATTIRE: "#F59E0B",
  CAKE: "#F97316",
  PHOTO_STYLE: "#6366F1",
  VENUE: "#3B82F6",
  OTHER: "#9CA3AF",
};

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
  const linkIdRef = useRef(0);
  const nextLinkId = () => ++linkIdRef.current;
  const [links, setLinks] = useState(() => {
    const parsed = parseLinks(existing?.sourceUrl);
    const vals = parsed.length > 0 ? parsed : [""];
    return vals.map((v) => ({ id: nextLinkId(), value: v }));
  });
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
      .map((s) => s.trim())
      .filter(Boolean);

    const ideaData: Partial<Idea> = {
      title: title || null,
      notes: notes || null,
      sourceUrl: serializeLinks(links.map((l) => l.value)),
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
          title: isNew ? t("newIdea") : title || t("idea"),
          headerRight: () => (
            <View className="flex-row items-center gap-3 mr-2">
              <Pressable onPress={() => setIsFavorite(!isFavorite)}>
                <Heart
                  size={24}
                  color={isFavorite ? "#EF4444" : "#C0C0C8"}
                  fill={isFavorite ? "#EF4444" : "transparent"}
                />
              </Pressable>
              <Pressable
                onPress={handleSave}
                className="bg-primary-500 rounded-full px-4 py-1.5 active:bg-primary-600"
              >
                <Text className="text-white font-semibold text-sm">
                  {t("common:save")}
                </Text>
              </Pressable>
            </View>
          ),
        }}
      />
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* Title & notes */}
        <SectionTitle>{t("information")}</SectionTitle>
        <FormCard>
          <InputRow label={t("title")} value={title} onChangeText={setTitle} />
          <Text className="text-xs text-gray-400 mb-1 mt-3 font-medium">{t("notesLabel")}</Text>
          <TextInput
            className="text-base text-gray-900 dark:text-white min-h-[60px]"
            value={notes}
            onChangeText={setNotes}
            placeholder={t("notesPlaceholder")}
            placeholderTextColor="#D0D0D8"
            multiline
            textAlignVertical="top"
          />
        </FormCard>

        {/* Tags */}
        <SectionTitle>{t("tags")}</SectionTitle>
        <FormCard>
          <TextInput
            className="text-base text-gray-900 dark:text-white"
            value={tagsInput}
            onChangeText={setTagsInput}
            placeholder={t("tagsPlaceholder")}
            placeholderTextColor="#D0D0D8"
          />
        </FormCard>

        {/* Links */}
        <SectionTitle>{t("links")}</SectionTitle>
        <FormCard>
          {links.map((link) => (
            <View key={link.id} className="flex-row items-center mb-2">
              <LinkIcon size={14} color="#EC4899" className="mr-2" />
              <TextInput
                className="flex-1 text-base text-gray-900 dark:text-white mx-2"
                value={link.value}
                onChangeText={(text) => {
                  setLinks((prev) =>
                    prev.map((l) => (l.id === link.id ? { ...l, value: text } : l))
                  );
                }}
                placeholder={t("linkPlaceholder")}
                placeholderTextColor="#D0D0D8"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              {link.value.trim() ? (
                <View className="flex-row items-center gap-2">
                  {isValidUrl(link.value) && (
                    <Pressable
                      onPress={() => Linking.openURL(link.value.trim())}
                      hitSlop={8}
                    >
                      <ExternalLink size={18} color="#EC4899" />
                    </Pressable>
                  )}
                  <Pressable
                    onPress={() => {
                      setLinks((prev) => {
                        const updated = prev.filter((l) => l.id !== link.id);
                        return updated.length > 0 ? updated : [{ id: nextLinkId(), value: "" }];
                      });
                    }}
                    hitSlop={8}
                  >
                    <X size={18} color="#9CA3AF" />
                  </Pressable>
                </View>
              ) : links.length > 1 ? (
                <Pressable
                  onPress={() => {
                    setLinks((prev) => prev.filter((l) => l.id !== link.id));
                  }}
                  hitSlop={8}
                >
                  <X size={18} color="#9CA3AF" />
                </Pressable>
              ) : null}
            </View>
          ))}
          <Pressable
            onPress={() => setLinks((prev) => [...prev, { id: nextLinkId(), value: "" }])}
            className="flex-row items-center mt-1"
          >
            <Plus size={16} color="#EC4899" />
            <Text className="text-primary-500 text-sm font-medium ml-1">
              {t("addLink")}
            </Text>
          </Pressable>
        </FormCard>

        {/* Category */}
        <SectionTitle>{t("categoryLabel")}</SectionTitle>
        <View className="flex-row flex-wrap gap-2 mb-5">
          {CATEGORIES.map((key) => {
            const Icon = CATEGORY_ICONS[key];
            const color = CATEGORY_COLORS[key];
            const isActive = category === key;
            return (
              <Pressable
                key={key}
                onPress={() => setCategory(isActive ? "" : key)}
                className={`flex-row items-center px-3 py-2 rounded-xl border ${
                  isActive
                    ? "border-primary-300 dark:border-primary-700"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                }`}
                style={isActive ? { backgroundColor: color + "15" } : {}}
              >
                <Icon size={14} color={isActive ? color : "#9CA3AF"} />
                <Text
                  className="text-sm font-medium ml-1.5"
                  style={{ color: isActive ? color : "#6B7280" }}
                >
                  {t(IDEA_CATEGORY_LABELS[key])}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Collection */}
        {collections.length > 0 && (
          <>
            <SectionTitle>{t("collection")}</SectionTitle>
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
                  {t("common:noneF")}
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
            <SectionTitle>{t("linkedVendor")}</SectionTitle>
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
                  {t("common:none")}
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
              {t("deleteIdea")}
            </Text>
          </Pressable>
        )}

        <View className="h-8" />
      </ScrollView>

      <ConfirmSheet
        visible={showDelete}
        title={t("deleteIdeaConfirm")}
        message={t("irreversible")}
        confirmLabel={t("common:delete")}
        destructive
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </View>
  );
}
