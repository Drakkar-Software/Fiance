import React, { useMemo } from "react";
import { View, Text, ScrollView, Pressable } from "react-native-css/components";
import { useLocalSearchParams, useRouter } from "expo-router";
import { PageHeader } from "@/components/PageHeader";
import { Briefcase, Lock } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useVendorsStore } from "@/store/useVendorsStore";
import { useGuestsStore, computeCounts } from "@/store/useGuestsStore";
import { calculateVendorTotal } from "@/lib/budget";
import { VENDOR_TYPE_LABELS, VENDOR_STATUS_LABELS, VENDOR_STATUS_COLORS } from "@/db/types";
import type { VendorType } from "@/db/types";
import { StatusBadge } from "@/components/StatusBadge";
import { FAB } from "@/components/FAB";
import { EmptyState } from "@/components/EmptyState";
import { formatMoney } from "@/components/MoneyDisplay";
import { Display } from "@/components/Display";
import { useShowPaywall } from "@/components/PaywallProvider";
import { useCanAddMore, useHasFeature, FREE_LIMITS } from "@/lib/limits";
import { toast } from "@/lib/toast/sonner";

export default function VendorTypeListScreen() {
  const { t } = useTranslation("vendors");
  const { type } = useLocalSearchParams<{ type: string }>();
  const router = useRouter();
  const vendors = useVendorsStore((s) =>
    s.vendors.filter((v) => v.type === type)
  );
  const totalVendorCount = useVendorsStore((s) => s.vendors.length);
  const quotePricings = useVendorsStore((s) => s.quotePricings);
  const guests = useGuestsStore((s) => s.guests);
  const canAddVendor = useCanAddMore("vendors", totalVendorCount);
  const hasQuoteComparison = useHasFeature("quoteComparison");
  const { openPaywall } = useShowPaywall();

  const handleAdd = () => {
    if (!canAddVendor) {
      const msg = t("common:premiumLimits.vendors", { limit: FREE_LIMITS.vendors });
      toast.error(msg);
      openPaywall(msg);
      return;
    }
    router.push({ pathname: "/(tabs)/vendors/[type]/[id]", params: { type: type!, id: "new" } });
  };

  const handleViewComparison = () => {
    if (!hasQuoteComparison) { openPaywall(); return; }
    router.push({ pathname: "/(tabs)/vendors/compare", params: { type: type! } });
  };

  // Computed display total per vendor: dynamic vendors show their guest-based (+ fixed) total,
  // others their base price. Matches the vendors list + budget screen.
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

  const typeName = t(VENDOR_TYPE_LABELS[type as VendorType]) || type;

  return (
    <View className="relative flex-1 bg-accent-paper">
      {vendors.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={`Aucun ${typeName.toLowerCase()}`}
          description={`Ajoutez votre premier ${typeName.toLowerCase()}`}
          actionLabel="Ajouter"
          onAction={handleAdd}
        />
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          <PageHeader
            eyebrow={t(`types.${type}` as any)}
            title={t("kindCount", { count: vendors.length })}
            titleSize={44}
          />
          {vendors.length >= 2 && (
            <Pressable
              onPress={handleViewComparison}
              className="mb-3 flex-row items-center gap-1.5"
            >
              <Text className="text-sm text-primary-500 font-medium">{t("comparison.viewAll")}</Text>
              {!hasQuoteComparison && <Lock size={13} color="#b96a4a" />}
            </Pressable>
          )}
          {vendors.map((vendor) => (
            <Pressable
              key={vendor.id}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/vendors/[type]/[id]",
                  params: { type: vendor.type, id: vendor.id },
                })
              }
              className="bg-accent-card rounded-xl p-4 mb-3 shadow-sm active:opacity-80"
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-ink">
                    {vendor.name}
                  </Text>
                  {vendor.contactName && (
                    <Text className="text-sm text-mute mt-1">
                      {vendor.contactName}
                    </Text>
                  )}
                </View>
                <View className="items-end gap-1">
                  <StatusBadge
                    label={t(VENDOR_STATUS_LABELS[vendor.status as keyof typeof VENDOR_STATUS_LABELS] || "")}
                    color={VENDOR_STATUS_COLORS[vendor.status as keyof typeof VENDOR_STATUS_COLORS] || "#9CA3AF"}
                  />
                  {vendor.isSelected === true && (
                    <StatusBadge label={t("comparison.retainedBadge")} color="#6e7a4a" />
                  )}
                </View>
              </View>
              {totalById[vendor.id] > 0 && (
                <Display size={18} weight="500" style={{ marginTop: 8 }}>
                  {formatMoney(totalById[vendor.id])}
                </Display>
              )}
            </Pressable>
          ))}
          <View className="h-24" />
        </ScrollView>
      )}

      <FAB onPress={handleAdd} locked={!canAddVendor} />
    </View>
  );
}

export async function generateStaticParams() { return []; }
