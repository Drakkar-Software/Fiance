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

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      {/* Search & filters */}
      <View className="px-4 pt-4">
        <View className="flex-row items-center bg-white dark:bg-gray-900 rounded-xl px-3.5 py-2.5 mb-3 border border-gray-100 dark:border-gray-800">
          <Ionicons name="search" size={18} color="#C0C0C8" />
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
            <Ionicons
              name={showFavoritesOnly ? "heart" : "heart-outline"}
              size={20}
              color={showFavoritesOnly ? "#EF4444" : "#C0C0C8"}
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

      {/* Masonry grid */}
      {filteredIdeas.length === 0 ? (
        <EmptyState
          icon="sparkles-outline"
          title="Aucune idée"
          description="Ajoutez vos premières inspirations"
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
          <View className="flex-row flex-wrap" style={{ gap: 10 }}>
            {filteredIdeas.map((idea) => (
              <Pressable
                key={idea.id}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/idees/[id]",
                    params: { id: idea.id },
                  })
                }
                className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 active:opacity-80"
                style={{ width: "48%" }}
              >
                {idea.imageUri ? (
                  <Image
                    source={{ uri: idea.imageUri }}
                    className="w-full"
                    style={{ height: 150 }}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    className="w-full items-center justify-center bg-accent-cream dark:bg-gray-800"
                    style={{ height: 110 }}
                  >
                    <Ionicons name="image-outline" size={28} color="#E8D5C0" />
                  </View>
                )}
                <View className="p-2.5">
                  {idea.title && (
                    <Text
                      className="text-sm font-medium text-gray-900 dark:text-white"
                      numberOfLines={1}
                    >
                      {idea.title}
                    </Text>
                  )}
                  {idea.category && (
                    <Text className="text-xs text-gray-400 mt-0.5">
                      {IDEA_CATEGORY_LABELS[idea.category as IdeaCategory]}
                    </Text>
                  )}
                  <View className="flex-row items-center justify-between mt-1.5">
                    {idea.tags && (
                      <Text
                        className="text-xs text-primary-400 flex-1"
                        numberOfLines={1}
                      >
                        {JSON.parse(idea.tags).slice(0, 2).join(", ")}
                      </Text>
                    )}
                    {idea.isFavorite && (
                      <Ionicons name="heart" size={13} color="#EF4444" />
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
                          className="flex-1 h-1.5"
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
