import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useVendorsStore } from "@/store/useVendorsStore";
import { VENDOR_TYPE_LABELS, VENDOR_STATUS_COLORS, VENDOR_STATUS_LABELS } from "@/db/types";
import type { VendorType } from "@/db/types";
import { StatusBadge } from "@/components/StatusBadge";
import { RatingStars } from "@/components/RatingStars";
import { FAB } from "@/components/FAB";
import { EmptyState } from "@/components/EmptyState";
import { FilterTabs } from "@/components/FilterTabs";
import { formatMoney } from "@/components/MoneyDisplay";

const VENDOR_TYPES = Object.keys(VENDOR_TYPE_LABELS) as VendorType[];

const TYPE_ICONS: Record<VendorType, keyof typeof Ionicons.glyphMap> = {
  CATERER: "restaurant",
  VENUE: "business",
  PHOTOGRAPHER: "camera",
  VIDEOGRAPHER: "videocam",
  DJ: "musical-notes",
  BAND: "musical-notes",
  FLORIST: "flower",
  WEDDING_PLANNER: "clipboard",
  OFFICIANT: "person",
  HAIR_MAKEUP: "cut",
  TRANSPORT: "car",
  SHUTTLE: "bus",
  CAKE: "cafe",
  PHOTO_BOOTH: "aperture",
  KIDS_ENTERTAINER: "happy",
  STATIONERY: "mail",
  FURNITURE_RENTAL: "cube",
  HOTEL: "bed",
  SECURITY: "shield-checkmark",
  OTHER: "ellipsis-horizontal",
};

export default function PrestatairesListScreen() {
  const router = useRouter();
  const vendors = useVendorsStore((s) => s.vendors);
  const [activeType, setActiveType] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const filteredVendors = vendors.filter((v) => {
    if (activeType !== "ALL" && v.type !== activeType) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        v.name.toLowerCase().includes(q) ||
        v.contactName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const tabs = [
    { key: "ALL", label: "Tous", count: vendors.length },
    ...VENDOR_TYPES.map((type) => ({
      key: type,
      label: VENDOR_TYPE_LABELS[type],
      count: vendors.filter((v) => v.type === type).length,
    })).filter((t) => t.count > 0),
  ];

  const handleAdd = () => {
    router.push({
      pathname: "/(tabs)/prestataires/[type]/[id]",
      params: { type: activeType === "ALL" ? "VENUE" : activeType, id: "new" },
    });
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      {/* Search */}
      <View className="px-4 pt-4">
        <View className="flex-row items-center bg-white dark:bg-gray-900 rounded-xl px-3.5 py-2.5 border border-gray-100 dark:border-gray-800">
          <Ionicons name="search" size={18} color="#C0C0C8" />
          <TextInput
            className="flex-1 ml-2.5 text-base text-gray-900 dark:text-white"
            placeholder="Rechercher un prestataire..."
            placeholderTextColor="#C0C0C8"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color="#C0C0C8" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Type filter tabs */}
      <View className="mt-3">
        <FilterTabs tabs={tabs} activeKey={activeType} onSelect={setActiveType} />
      </View>

      {/* Compare button for caterers */}
      {activeType === "CATERER" &&
        vendors.filter((v) => v.type === "CATERER").length >= 2 && (
          <Pressable
            onPress={() => router.push("/(tabs)/prestataires/compare")}
            className="mx-4 mb-3 bg-accent-blush dark:bg-primary-900 rounded-xl p-3 flex-row items-center justify-center border border-primary-200 dark:border-primary-800"
          >
            <Ionicons name="git-compare" size={18} color="#EC4899" />
            <Text className="text-primary-600 dark:text-primary-300 font-semibold text-sm ml-2">
              Comparateur traiteurs
            </Text>
          </Pressable>
        )}

      {/* Vendor list */}
      {filteredVendors.length === 0 ? (
        <EmptyState
          icon="briefcase-outline"
          title="Aucun prestataire"
          description="Ajoutez votre premier prestataire pour commencer"
          actionLabel="Ajouter un prestataire"
          onAction={handleAdd}
        />
      ) : (
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {filteredVendors.map((vendor) => (
            <Pressable
              key={vendor.id}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/prestataires/[type]/[id]",
                  params: { type: vendor.type, id: vendor.id },
                })
              }
              className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-2.5 border border-gray-100 dark:border-gray-800 active:opacity-80"
            >
              <View className="flex-row items-start">
                <View className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900 items-center justify-center mr-3">
                  <Ionicons
                    name={TYPE_ICONS[vendor.type as VendorType] || "ellipsis-horizontal"}
                    size={18}
                    color="#EC4899"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900 dark:text-white">
                    {vendor.name}
                  </Text>
                  <Text className="text-sm text-gray-400 mt-0.5">
                    {VENDOR_TYPE_LABELS[vendor.type as VendorType]}
                    {vendor.contactName ? ` · ${vendor.contactName}` : ""}
                  </Text>
                </View>
                <View className="items-end">
                  <StatusBadge
                    label={VENDOR_STATUS_LABELS[vendor.status as keyof typeof VENDOR_STATUS_LABELS] || vendor.status || ""}
                    color={VENDOR_STATUS_COLORS[vendor.status as keyof typeof VENDOR_STATUS_COLORS] || "#9CA3AF"}
                  />
                  {(vendor.basePrice != null && vendor.basePrice > 0) && (
                    <Text className="text-sm font-semibold text-gray-900 dark:text-white mt-1.5">
                      {formatMoney(vendor.basePrice)}
                    </Text>
                  )}
                </View>
              </View>
              {vendor.rating != null && vendor.rating > 0 && (
                <View className="mt-2.5 ml-13">
                  <RatingStars rating={vendor.rating} size={14} />
                </View>
              )}
            </Pressable>
          ))}
          <View className="h-24" />
        </ScrollView>
      )}

      <FAB onPress={handleAdd} />
    </View>
  );
}
