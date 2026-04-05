import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Image } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useIdeasStore } from "@/store/useIdeasStore";
import { IDEA_CATEGORY_LABELS } from "@/db/types";
import type { IdeaCategory } from "@/db/types";
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
        if (
          categoryFilter !== "ALL" &&
          i.category !== categoryFilter
        )
          return false;
        if (
          collectionFilter !== "ALL" &&
          i.collectionId !== collectionFilter
        )
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

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      {/* Search & filters */}
      <View className="px-4 pt-4">
        <View className="flex-row items-center bg-white dark:bg-gray-900 rounded-xl px-3 py-2 mb-3">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-base text-gray-900 dark:text-white"
            placeholder="Rechercher une idée..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
          <Pressable
            onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className="ml-2"
          >
            <Ionicons
              name={showFavoritesOnly ? "heart" : "heart-outline"}
              size={22}
              color={showFavoritesOnly ? "#EF4444" : "#9CA3AF"}
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
            className={`px-3 py-1.5 rounded-full ${
              collectionFilter === "ALL"
                ? "bg-primary-500"
                : "bg-gray-100 dark:bg-gray-800"
            }`}
          >
            <Text
              className={`text-sm ${
                collectionFilter === "ALL"
                  ? "text-white font-medium"
                  : "text-gray-600"
              }`}
            >
              Toutes
            </Text>
          </Pressable>
          {collections.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => setCollectionFilter(c.id)}
              className={`px-3 py-1.5 rounded-full ${
                collectionFilter === c.id
                  ? "bg-primary-500"
                  : "bg-gray-100 dark:bg-gray-800"
              }`}
            >
              <Text
                className={`text-sm ${
                  collectionFilter === c.id
                    ? "text-white font-medium"
                    : "text-gray-600"
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

      {/* Masonry grid */}
      {filteredIdeas.length === 0 ? (
        <EmptyState
          icon="sparkles-outline"
          title="Aucune idée"
          description="Ajoutez vos premières inspirations depuis la galerie ou en collant une URL"
          actionLabel="Ajouter une idée"
          onAction={() =>
            router.push({
              pathname: "/(tabs)/idees/[id]",
              params: { id: "new" },
            })
          }
        />
      ) : (
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            {filteredIdeas.map((idea) => (
              <Pressable
                key={idea.id}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/idees/[id]",
                    params: { id: idea.id },
                  })
                }
                className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm active:opacity-80"
                style={{ width: "48.5%" }}
              >
                {idea.imageUri ? (
                  <Image
                    source={{ uri: idea.imageUri }}
                    className="w-full"
                    style={{ height: 160 }}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    className="w-full items-center justify-center bg-gray-100 dark:bg-gray-800"
                    style={{ height: 120 }}
                  >
                    <Ionicons name="image-outline" size={32} color="#D1D5DB" />
                  </View>
                )}
                <View className="p-2">
                  {idea.title && (
                    <Text
                      className="text-sm font-medium text-gray-900 dark:text-white"
                      numberOfLines={1}
                    >
                      {idea.title}
                    </Text>
                  )}
                  {idea.category && (
                    <Text className="text-xs text-gray-500 mt-0.5">
                      {IDEA_CATEGORY_LABELS[idea.category as IdeaCategory]}
                    </Text>
                  )}
                  <View className="flex-row items-center justify-between mt-1">
                    {idea.tags && (
                      <Text
                        className="text-xs text-primary-400 flex-1"
                        numberOfLines={1}
                      >
                        {JSON.parse(idea.tags).slice(0, 3).join(", ")}
                      </Text>
                    )}
                    {idea.isFavorite && (
                      <Ionicons name="heart" size={14} color="#EF4444" />
                    )}
                  </View>
                </View>
                {/* Color palette */}
                {idea.colorPalette && (
                  <View className="flex-row">
                    {(JSON.parse(idea.colorPalette) as string[]).map(
                      (color, idx) => (
                        <View
                          key={idx}
                          className="flex-1 h-2"
                          style={{ backgroundColor: color }}
                        />
                      )
                    )}
                  </View>
                )}
              </Pressable>
            ))}
          </View>
          <View className="h-24" />
        </ScrollView>
      )}

      <FAB
        onPress={() =>
          router.push({
            pathname: "/(tabs)/idees/[id]",
            params: { id: "new" },
          })
        }
      />
    </View>
  );
}
