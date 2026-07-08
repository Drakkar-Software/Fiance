import React, { useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native-css/components";
import { Platform } from "react-native";
import { LegendList } from "@legendapp/list";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Briefcase, Ellipsis } from "lucide-react-native";
import { useVendorsStore } from "@/store/useVendorsStore";
import { useGuestsStore, computeCounts } from "@/store/useGuestsStore";
import { calculateVendorTotal } from "@/lib/budget";
import { VENDOR_TYPE_LABELS, VENDOR_STATUS_COLORS, VENDOR_STATUS_LABELS } from "@/db/types";
import type { VendorType } from "@/db/types";
import type { Vendor } from "@/db/schema";
import { VENDOR_TYPE_ICONS } from "@/lib/vendor-icons";
import { useIsWideScreen } from "@/lib/useIsWideScreen";
import { StatusBadge } from "@/components/StatusBadge";
import { FAB } from "@/components/FAB";
import { useCan } from "@/lib/permissions/usePermissions";
import { EmptyState } from "@/components/EmptyState";
import { FilterTabs } from "@/components/FilterTabs";
import { SearchBar } from "@/components/SearchBar";
import { formatMoney } from "@/components/MoneyDisplay";
import { PageHeader } from "@/components/PageHeader";

const VENDOR_TYPES = Object.keys(VENDOR_TYPE_LABELS) as VendorType[];

export default function VendorsListScreen() {
  const { t } = useTranslation("vendors");
  const router = useRouter();
  const isWide = useIsWideScreen();
  const canEdit = useCan("vendors");
  const vendors = useVendorsStore((s) => s.vendors);
  const quotePricings = useVendorsStore((s) => s.quotePricings);
  const guests = useGuestsStore((s) => s.guests);
  const [activeType, setActiveType] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  // Per-vendor display total: dynamic vendors show their computed (guest-based + fixed) total,
  // others their base price. Recomputes only when vendors / pricings / guest counts change.
  const totalById = useMemo(() => {
    const counts = computeCounts(guests);
    const map: Record<string, number> = {};
    for (const v of vendors) {
      map[v.id] = calculateVendorTotal(
        v,
        counts,
        quotePricings.filter((p) => p.vendorId === v.id)
      );
    }
    return map;
  }, [vendors, quotePricings, guests]);

  const bookedVendors = vendors.filter((v) => v.status === "BOOKED");
  const bookedPct = vendors.length > 0 ? Math.round((bookedVendors.length / vendors.length) * 100) : 0;

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
    <View className="relative flex-1 bg-accent-paper">
      {Platform.OS === 'web' && (
        <PageHeader
          eyebrow={t("common:tabs.vendors")}
          title={bookedVendors.length}
          tagline={t("pageTagline", { total: vendors.length })}
          titleSize={44}
        />
      )}
      {/* Vendor list */}
      <LegendList
        data={filteredVendors}
        renderItem={({ item: vendor }) => (
          <View className="px-4">
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/vendors/[type]/[id]",
                  params: { type: vendor.type, id: vendor.id },
                })
              }
              className="bg-accent-card rounded-2xl p-4 mb-2.5 border border-hair active:opacity-80"
            >
              <View className="flex-row items-start">
                <View className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900 items-center justify-center mr-3">
                  {(() => {
                    const Icon = VENDOR_TYPE_ICONS[vendor.type as VendorType] || Ellipsis;
                    return <Icon size={18} color="#b96a4a" />;
                  })()}
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-ink">
                    {vendor.name}
                  </Text>
                  <Text className="text-sm text-mute mt-0.5">
                    {t(VENDOR_TYPE_LABELS[vendor.type as VendorType])}
                    {vendor.contactName ? ` · ${vendor.contactName}` : ""}
                  </Text>
                </View>
                <View className="items-end">
                  <StatusBadge
                    label={t(VENDOR_STATUS_LABELS[vendor.status as keyof typeof VENDOR_STATUS_LABELS] || vendor.status || "")}
                    color={VENDOR_STATUS_COLORS[vendor.status as keyof typeof VENDOR_STATUS_COLORS] || "#9CA3AF"}
                  />
                  {totalById[vendor.id] > 0 && (
                    <Text className="text-sm font-semibold text-ink mt-1.5">
                      {formatMoney(totalById[vendor.id])}
                    </Text>
                  )}
                </View>
              </View>
            </Pressable>
          </View>
        )}
        keyExtractor={(vendor: Vendor) => vendor.id}
        extraData={totalById}
        estimatedItemSize={88}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <SearchBar
              value={search}
              onChangeText={setSearch}
              placeholder={t("searchVendor")}
              className="px-4 pt-2"
            />
            <View className="mt-3 pb-3">
              <FilterTabs tabs={tabs} activeKey={activeType} onSelect={setActiveType} />
            </View>
          </>
        }
        ListEmptyComponent={
          <EmptyState
            icon={Briefcase}
            title={t("noVendors")}
            description={t("addFirstVendor")}
            actionLabel={canEdit ? t("addVendor") : undefined}
            onAction={canEdit ? handleAdd : undefined}
          />
        }
        ListFooterComponent={<View className="h-24" />}
      />

      {isWide && canEdit && <FAB onPress={handleAdd} />}
    </View>
  );
}
