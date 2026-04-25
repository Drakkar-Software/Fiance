import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native-css/components";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Briefcase } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useVendorsStore } from "@/store/useVendorsStore";
import { VENDOR_TYPE_LABELS, VENDOR_STATUS_LABELS, VENDOR_STATUS_COLORS } from "@/db/types";
import type { VendorType } from "@/db/types";
import { StatusBadge } from "@/components/StatusBadge";
import { FAB } from "@/components/FAB";
import { EmptyState } from "@/components/EmptyState";
import { formatMoney } from "@/components/MoneyDisplay";
import { Display } from "@/components/Display";

export default function VendorTypeListScreen() {
  const { t } = useTranslation("vendors");
  const { type } = useLocalSearchParams<{ type: string }>();
  const router = useRouter();
  const vendors = useVendorsStore((s) =>
    s.vendors.filter((v) => v.type === type)
  );

  const typeName = t(VENDOR_TYPE_LABELS[type as VendorType]) || type;

  return (
    <View className="flex-1 bg-accent-paper">
      <Stack.Screen options={{ title: typeName }} />

      {vendors.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={`Aucun ${typeName.toLowerCase()}`}
          description={`Ajoutez votre premier ${typeName.toLowerCase()}`}
          actionLabel="Ajouter"
          onAction={() =>
            router.push({
              pathname: "/(tabs)/vendors/[type]/[id]",
              params: { type: type!, id: "new" },
            })
          }
        />
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
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
                <StatusBadge
                  label={t(VENDOR_STATUS_LABELS[vendor.status as keyof typeof VENDOR_STATUS_LABELS] || "")}
                  color={VENDOR_STATUS_COLORS[vendor.status as keyof typeof VENDOR_STATUS_COLORS] || "#9CA3AF"}
                />
              </View>
              {(vendor.basePrice != null && vendor.basePrice > 0) && (
                <Display size={18} weight="500" style={{ marginTop: 8 }}>
                  {formatMoney(vendor.basePrice)}
                </Display>
              )}
            </Pressable>
          ))}
          <View className="h-24" />
        </ScrollView>
      )}

      <FAB
        onPress={() =>
          router.push({
            pathname: "/(tabs)/vendors/[type]/[id]",
            params: { type: type!, id: "new" },
          })
        }
      />
    </View>
  );
}
