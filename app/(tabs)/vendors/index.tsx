import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native-css/components";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Briefcase, Ellipsis } from "lucide-react-native";
import { useVendorsStore } from "@/store/useVendorsStore";
import { VENDOR_TYPE_LABELS, VENDOR_STATUS_COLORS, VENDOR_STATUS_LABELS, VENDOR_TYPE_ICONS } from "@/db/types";
import type { VendorType } from "@/db/types";
import { StatusBadge } from "@/components/StatusBadge";
import { RatingStars } from "@/components/RatingStars";
import { FAB } from "@/components/FAB";
import { EmptyState } from "@/components/EmptyState";
import { FilterTabs } from "@/components/FilterTabs";
import { SearchBar } from "@/components/SearchBar";
import { formatMoney } from "@/components/MoneyDisplay";

const VENDOR_TYPES = Object.keys(VENDOR_TYPE_LABELS) as VendorType[];

export default function VendorsListScreen() {
  const { t } = useTranslation("vendors");
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
    { key: "ALL", label: t("all"), count: vendors.length },
    ...VENDOR_TYPES.map((type) => ({
      key: type,
      label: t(VENDOR_TYPE_LABELS[type]),
      count: vendors.filter((v) => v.type === type).length,
    })).filter((t) => t.count > 0),
  ];

  const handleAdd = () => {
    router.push("/(tabs)/vendors/new");
  };

  return (
    <View className="flex-1 bg-accent-paper dark:bg-gray-950">
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder={t("searchVendor")}
        className="px-4 pt-4"
      />

      {/* Type filter tabs */}
      <View className="mt-3">
        <FilterTabs tabs={tabs} activeKey={activeType} onSelect={setActiveType} />
      </View>

      {/* Vendor list */}
      {filteredVendors.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={t("noVendors")}
          description={t("addFirstVendor")}
          actionLabel={t("addVendor")}
          onAction={handleAdd}
        />
      ) : (
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {filteredVendors.map((vendor) => (
            <Pressable
              key={vendor.id}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/vendors/[type]/[id]",
                  params: { type: vendor.type, id: vendor.id },
                })
              }
              className="bg-accent-card dark:bg-gray-900 rounded-2xl p-4 mb-2.5 border border-gray-100 dark:border-gray-800 active:opacity-80"
            >
              <View className="flex-row items-start">
                <View className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900 items-center justify-center mr-3">
                  {(() => {
                    const Icon = VENDOR_TYPE_ICONS[vendor.type as VendorType] || Ellipsis;
                    return <Icon size={18} color="#b96a4a" />;
                  })()}
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900 dark:text-white">
                    {vendor.name}
                  </Text>
                  <Text className="text-sm text-gray-400 mt-0.5">
                    {t(VENDOR_TYPE_LABELS[vendor.type as VendorType])}
                    {vendor.contactName ? ` · ${vendor.contactName}` : ""}
                  </Text>
                </View>
                <View className="items-end">
                  <StatusBadge
                    label={t(VENDOR_STATUS_LABELS[vendor.status as keyof typeof VENDOR_STATUS_LABELS] || vendor.status || "")}
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
