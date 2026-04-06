import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Pressable,
  TextInput,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Search,
  Heart,
  Sparkles,

  Link,
  ChevronDown,
  X,
  Flower2,
  Building2,
  Church,
  Shirt,
  Cake,
  Camera,
  MapPin,
  MoreHorizontal,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { useIdeasStore } from "@/store/useIdeasStore";
import { IDEA_CATEGORY_LABELS } from "@/db/types";
import type { IdeaCategory } from "@/db/types";
import type { Idea } from "@/db/schema";
import { FAB } from "@/components/FAB";
import { EmptyState } from "@/components/EmptyState";

function parseCardLinks(sourceUrl: string): string[] {
  try {
    const parsed = JSON.parse(sourceUrl);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return [sourceUrl];
}

// ─── Category metadata ──────────────────────────────────────────────────────

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

const CATEGORIES = Object.keys(IDEA_CATEGORY_LABELS) as IdeaCategory[];

// ─── Main screen ────────────────────────────────────────────────────────────

export default function IdeasScreen() {
  const { t } = useTranslation("ideas");
  const router = useRouter();
  const ideas = useIdeasStore((s) => s.ideas);
  const collections = useIdeasStore((s) => s.collections);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<IdeaCategory | "ALL">(
    "ALL"
  );
  const [collectionFilter, setCollectionFilter] = useState("ALL");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const { width } = useWindowDimensions();
  const numColumns = width >= 600 ? 3 : 2;

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

  // Count ideas per category for badges
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const idea of ideas) {
      if (idea.category) {
        counts[idea.category] = (counts[idea.category] || 0) + 1;
      }
    }
    return counts;
  }, [ideas]);

  const navigateToIdea = useCallback(
    (id: string) =>
      router.push({ pathname: "/(tabs)/ideas/[id]", params: { id } }),
    [router]
  );

  const activeCategory =
    categoryFilter !== "ALL" ? categoryFilter : null;
  const activeCategoryLabel = activeCategory
    ? t(IDEA_CATEGORY_LABELS[activeCategory])
    : null;

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      {/* Search bar */}
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center bg-white dark:bg-gray-900 rounded-xl px-3.5 py-2.5 border border-gray-100 dark:border-gray-800">
          <Search size={18} color="#C0C0C8" />
          <TextInput
            className="flex-1 ml-2.5 text-base text-gray-900 dark:text-white"
            placeholder={t("searchIdea")}
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

      {/* Filter row: category + collection */}
      <View className="px-4 pb-3">
        <View className="flex-row gap-2">
          {/* Category filter button */}
          <Pressable
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            className={`flex-row items-center px-3.5 py-2 rounded-xl border ${
              activeCategory
                ? "border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-900"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
            }`}
          >
            {activeCategory && (
              <View
                className="w-4 h-4 rounded-full mr-2"
                style={{ backgroundColor: CATEGORY_COLORS[activeCategory] }}
              />
            )}
            <Text
              className={`text-sm font-medium mr-1 ${
                activeCategory
                  ? "text-primary-600 dark:text-primary-300"
                  : "text-gray-500"
              }`}
              numberOfLines={1}
            >
              {activeCategoryLabel || t("categoryLabel")}
            </Text>
            <ChevronDown
              size={14}
              color={activeCategory ? "#EC4899" : "#9CA3AF"}
            />
          </Pressable>

          {/* Active category clear button */}
          {activeCategory && (
            <Pressable
              onPress={() => {
                setCategoryFilter("ALL");
                setShowCategoryPicker(false);
              }}
              className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 items-center justify-center"
            >
              <X size={16} color="#9CA3AF" />
            </Pressable>
          )}

          {/* Collection pills (if any) */}
          {collections.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 6, alignItems: "center" }}
              className="flex-1"
            >
              {collections.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() =>
                    setCollectionFilter(
                      collectionFilter === c.id ? "ALL" : c.id
                    )
                  }
                  className={`px-3 py-1.5 rounded-full border ${
                    collectionFilter === c.id
                      ? "bg-primary-500 border-primary-500"
                      : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      collectionFilter === c.id
                        ? "text-white"
                        : "text-gray-500"
                    }`}
                    numberOfLines={1}
                  >
                    {c.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>
      </View>

      {/* Category picker grid */}
      {showCategoryPicker && (
        <View className="px-4 pb-3">
          <View className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-3">
            <View className="flex-row flex-wrap" style={{ gap: 8 }}>
              {CATEGORIES.map((cat) => {
                const Icon = CATEGORY_ICONS[cat];
                const color = CATEGORY_COLORS[cat];
                const isActive = categoryFilter === cat;
                const count = categoryCounts[cat] || 0;

                return (
                  <Pressable
                    key={cat}
                    onPress={() => {
                      setCategoryFilter(isActive ? "ALL" : cat);
                      setShowCategoryPicker(false);
                    }}
                    className={`flex-row items-center px-3 py-2 rounded-xl border ${
                      isActive
                        ? "border-primary-300 dark:border-primary-700"
                        : "border-gray-100 dark:border-gray-800"
                    }`}
                    style={
                      isActive
                        ? { backgroundColor: color + "15" }
                        : { backgroundColor: "transparent" }
                    }
                  >
                    <Icon size={14} color={color} />
                    <Text
                      className="text-xs font-medium ml-1.5"
                      style={{ color: isActive ? color : "#6B7280" }}
                      numberOfLines={1}
                    >
                      {t(IDEA_CATEGORY_LABELS[cat])}
                    </Text>
                    {count > 0 && (
                      <View
                        className="ml-1.5 min-w-[18px] h-[18px] rounded-full items-center justify-center px-1"
                        style={{ backgroundColor: color + "20" }}
                      >
                        <Text
                          className="text-[10px] font-bold"
                          style={{ color }}
                        >
                          {count}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      )}

      {/* Card grid */}
      {filteredIdeas.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title={t("noIdeas")}
          description={t("addFirstIdea")}
          actionLabel={t("addIdea")}
          onAction={() => navigateToIdea("new")}
        />
      ) : (
        <FlatList
          data={filteredIdeas}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          key={numColumns}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 96 }}
          columnWrapperStyle={{ gap: 10 }}
          ItemSeparatorComponent={() => <View className="h-2.5" />}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={{ flex: 1, maxWidth: `${100 / numColumns}%` }}>
              <IdeaCard
                idea={item}
                onPress={() => navigateToIdea(item.id)}
              />
            </View>
          )}
        />
      )}

      <FAB onPress={() => navigateToIdea("new")} />
    </View>
  );
}

// ─── Idea card (compact, grid-friendly) ─────────────────────────────────────

function IdeaCard({ idea, onPress }: { idea: Idea; onPress: () => void }) {
  const { t } = useTranslation("ideas");
  const categoryColor = idea.category
    ? CATEGORY_COLORS[idea.category as IdeaCategory]
    : null;
  const CategoryIcon = idea.category
    ? CATEGORY_ICONS[idea.category as IdeaCategory]
    : null;

  return (
    <Pressable
      onPress={onPress}
      className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 active:opacity-80"
    >
      <View className="p-3">
        {/* Title + favorite */}
        <View className="flex-row items-start justify-between">
          <Text
            className="text-sm font-semibold text-gray-900 dark:text-white flex-1 mr-1"
            numberOfLines={2}
          >
            {idea.title || t("noTitle")}
          </Text>
          {idea.isFavorite && (
            <Heart size={13} color="#EF4444" fill="#EF4444" />
          )}
        </View>

        {/* Category chip */}
        {idea.category && CategoryIcon && categoryColor && (
          <View
            className="flex-row items-center self-start mt-1.5 px-2 py-0.5 rounded-full"
            style={{ backgroundColor: categoryColor + "15" }}
          >
            <CategoryIcon size={10} color={categoryColor} />
            <Text
              className="text-[11px] font-medium ml-1"
              style={{ color: categoryColor }}
              numberOfLines={1}
            >
              {t(IDEA_CATEGORY_LABELS[idea.category as IdeaCategory])}
            </Text>
          </View>
        )}

        {/* Links */}
        {idea.sourceUrl && (() => {
          const links = parseCardLinks(idea.sourceUrl);
          if (links.length === 0) return null;
          return (
            <View className="flex-row items-center mt-1.5">
              <Link size={10} color="#EC4899" />
              <Text
                className="text-[11px] text-primary-400 ml-1"
                numberOfLines={1}
              >
                {links.length === 1
                  ? links[0].replace(/^https?:\/\/(www\.)?/, "").split("/")[0]
                  : `${links.length} liens`}
              </Text>
            </View>
          );
        })()}

        {/* Tags */}
        {idea.tags && (
          <Text
            className="text-[11px] text-gray-400 mt-1.5"
            numberOfLines={1}
          >
            {(JSON.parse(idea.tags) as string[]).slice(0, 3).join(" · ")}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
