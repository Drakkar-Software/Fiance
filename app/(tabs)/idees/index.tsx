import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Pressable,
  TextInput,
  Image,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { Search, Heart, Sparkles, Image as ImageIcon, Link } from "lucide-react-native";
import { useIdeasStore } from "@/store/useIdeasStore";
import { IDEA_CATEGORY_LABELS } from "@/db/types";
import type { IdeaCategory } from "@/db/types";
import type { Idea } from "@/db/schema";
import { FilterTabs } from "@/components/FilterTabs";
import { FAB } from "@/components/FAB";
import { EmptyState } from "@/components/EmptyState";

export default function IdeasScreen() {
  const router = useRouter();
  const ideas = useIdeasStore((s) => s.ideas);
  const collections = useIdeasStore((s) => s.collections);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [collectionFilter, setCollectionFilter] = useState("ALL");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const filteredIdeas = useMemo(() => {
    return ideas
      .filter((i) => {
        if (showFavoritesOnly && !i.isFavorite) return false;
        if (categoryFilter !== "ALL" && i.category !== categoryFilter)
          return false;
        if (collectionFilter !== "ALL" && i.collectionId !== collectionFilter)
          return false;
        if (search) {
          const q = search.toLowerCase();
          return (
            i.title?.toLowerCase().includes(q) ||
            i.notes?.toLowerCase().includes(q) ||
            (i.tags && i.tags.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
  }, [ideas, search, categoryFilter, collectionFilter, showFavoritesOnly]);

  const categoryTabs = [
    { key: "ALL", label: "Toutes" },
    ...Object.entries(IDEA_CATEGORY_LABELS).map(([key, label]) => ({
      key,
      label,
      count: ideas.filter((i) => i.category === key).length,
    })),
  ];

  const navigateToIdea = (id: string) =>
    router.push({ pathname: "/(tabs)/idees/[id]", params: { id } });

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      {/* Search & filters */}
      <View className="px-4 pt-4">
        <View className="flex-row items-center bg-white dark:bg-gray-900 rounded-xl px-3.5 py-2.5 mb-3 border border-gray-100 dark:border-gray-800">
          <Search size={18} color="#C0C0C8" />
          <TextInput
            className="flex-1 ml-2.5 text-base text-gray-900 dark:text-white"
            placeholder="Rechercher une idée..."
            placeholderTextColor="#C0C0C8"
            value={search}
            onChangeText={setSearch}
          />
          <Pressable
            onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className="ml-2 w-8 h-8 items-center justify-center"
          >
            <Heart
              size={20}
              color={showFavoritesOnly ? "#EF4444" : "#C0C0C8"}
              fill={showFavoritesOnly ? "#EF4444" : "transparent"}
            />
          </Pressable>
        </View>
      </View>

      {/* Collection filter */}
      {collections.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-2"
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          <Pressable
            onPress={() => setCollectionFilter("ALL")}
            className={`px-3.5 py-1.5 rounded-full border ${
              collectionFilter === "ALL"
                ? "bg-primary-500 border-primary-500"
                : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
            }`}
          >
            <Text
              className={`text-sm ${
                collectionFilter === "ALL"
                  ? "text-white font-medium"
                  : "text-gray-500"
              }`}
            >
              Toutes
            </Text>
          </Pressable>
          {collections.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => setCollectionFilter(c.id)}
              className={`px-3.5 py-1.5 rounded-full border ${
                collectionFilter === c.id
                  ? "bg-primary-500 border-primary-500"
                  : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
              }`}
            >
              <Text
                className={`text-sm ${
                  collectionFilter === c.id
                    ? "text-white font-medium"
                    : "text-gray-500"
                }`}
              >
                {c.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Category tabs */}
      <FilterTabs
        tabs={categoryTabs}
        activeKey={categoryFilter}
        onSelect={setCategoryFilter}
      />

      {/* Card list */}
      {filteredIdeas.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Aucune idée"
          description="Ajoutez vos premières inspirations"
          actionLabel="Ajouter une idée"
          onAction={() => navigateToIdea("new")}
        />
      ) : (
        <FlatList
          data={filteredIdeas}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 96 }}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View className="h-3" />}
          renderItem={({ item }) => (
            <IdeaCard idea={item} onPress={() => navigateToIdea(item.id)} />
          )}
        />
      )}

      <FAB onPress={() => navigateToIdea("new")} />
    </View>
  );
}

function IdeaCard({ idea, onPress }: { idea: Idea; onPress: () => void }) {
  const tags = idea.tags ? (JSON.parse(idea.tags) as string[]) : [];
  const displayUrl = idea.sourceUrl
    ? idea.sourceUrl.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]
    : null;

  return (
    <Pressable
      onPress={onPress}
      className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 active:opacity-80"
    >
      <View className="p-4">
        {/* Top row: thumbnail + title */}
        <View className="flex-row">
          {idea.imageUri ? (
            <Image
              source={{ uri: idea.imageUri }}
              className="w-16 h-16 rounded-xl"
              resizeMode="cover"
            />
          ) : (
            <View className="w-16 h-16 rounded-xl bg-accent-cream dark:bg-gray-800 items-center justify-center">
              <ImageIcon size={24} color="#E8D5C0" />
            </View>
          )}
          <View className="flex-1 ml-3 justify-center">
            <View className="flex-row items-center justify-between">
              <Text
                className="text-base font-semibold text-gray-900 dark:text-white flex-1 mr-2"
                numberOfLines={1}
              >
                {idea.title || "Sans titre"}
              </Text>
              {idea.isFavorite && (
                <Heart size={16} color="#EF4444" fill="#EF4444" />
              )}
            </View>
            {idea.category && (
              <View className="self-start mt-1 px-2 py-0.5 rounded-full bg-accent-cream dark:bg-gray-800">
                <Text className="text-xs text-gray-500">
                  {IDEA_CATEGORY_LABELS[idea.category as IdeaCategory]}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Notes preview */}
        {idea.notes && (
          <Text
            className="text-sm text-gray-500 dark:text-gray-400 mt-3 leading-5"
            numberOfLines={3}
          >
            {idea.notes}
          </Text>
        )}

        {/* Source URL */}
        {displayUrl && (
          <Pressable
            onPress={() => Linking.openURL(idea.sourceUrl!)}
            className="flex-row items-center mt-2.5"
          >
            <Link size={14} color="#EC4899" />
            <Text className="text-sm text-primary-400 ml-1.5" numberOfLines={1}>
              {displayUrl}
            </Text>
          </Pressable>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <View className="flex-row flex-wrap gap-1.5 mt-2.5">
            {tags.slice(0, 5).map((tag, idx) => (
              <View
                key={idx}
                className="px-2 py-0.5 rounded-full bg-primary-50 dark:bg-gray-800"
              >
                <Text className="text-xs text-primary-500">{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Color palette bar */}
      {idea.colorPalette && (
        <View className="flex-row">
          {(JSON.parse(idea.colorPalette) as string[]).map((color, idx) => (
            <View
              key={idx}
              className="flex-1 h-1.5"
              style={{ backgroundColor: color }}
            />
          ))}
        </View>
      )}
    </Pressable>
  );
}
