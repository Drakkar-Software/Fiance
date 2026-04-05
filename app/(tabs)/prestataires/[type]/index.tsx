import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useVendorsStore } from "@/store/useVendorsStore";
import { VENDOR_TYPE_LABELS, VENDOR_STATUS_LABELS, VENDOR_STATUS_COLORS } from "@/db/types";
import type { VendorType } from "@/db/types";
import { StatusBadge } from "@/components/StatusBadge";
import { FAB } from "@/components/FAB";
import { EmptyState } from "@/components/EmptyState";
import { formatMoney } from "@/components/MoneyDisplay";

export default function VendorTypeListScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const router = useRouter();
  const vendors = useVendorsStore((s) =>
    s.vendors.filter((v) => v.type === type)
  );

  const typeName = VENDOR_TYPE_LABELS[type as VendorType] || type;

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      <Stack.Screen options={{ title: typeName }} />

      {vendors.length === 0 ? (
        <EmptyState
          icon="briefcase-outline"
          title={`Aucun ${typeName.toLowerCase()}`}
          description={`Ajoutez votre premier ${typeName.toLowerCase()}`}
          actionLabel="Ajouter"
          onAction={() =>
            router.push({
              pathname: "/(tabs)/prestataires/[type]/[id]",
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
                  pathname: "/(tabs)/prestataires/[type]/[id]",
                  params: { type: vendor.type, id: vendor.id },
                })
              }
              className="bg-white dark:bg-gray-900 rounded-xl p-4 mb-3 shadow-sm active:opacity-80"
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900 dark:text-white">
                    {vendor.name}
                  </Text>
                  {vendor.contactName && (
                    <Text className="text-sm text-gray-500 mt-1">
                      {vendor.contactName}
                    </Text>
                  )}
                </View>
                <StatusBadge
                  label={VENDOR_STATUS_LABELS[vendor.status as keyof typeof VENDOR_STATUS_LABELS] || ""}
                  color={VENDOR_STATUS_COLORS[vendor.status as keyof typeof VENDOR_STATUS_COLORS] || "#9CA3AF"}
                />
              </View>
              {(vendor.basePrice != null && vendor.basePrice > 0) && (
                <Text className="text-lg font-bold text-gray-900 dark:text-white mt-2">
                  {formatMoney(vendor.basePrice)}
                </Text>
              )}
            </Pressable>
          ))}
          <View className="h-24" />
        </ScrollView>
      )}

      <FAB
        onPress={() =>
          router.push({
            pathname: "/(tabs)/prestataires/[type]/[id]",
            params: { type: type!, id: "new" },
          })
        }
      />
    </View>
  );
}
