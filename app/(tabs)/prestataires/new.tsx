import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter, Stack } from "expo-router";
import {
  VENDOR_TYPE_LABELS,
  VENDOR_TYPE_ICONS,
  BUDGET_CATEGORIES,
} from "@/db/types";
import type { VendorType } from "@/db/types";

export default function NewVendorPickerScreen() {
  const router = useRouter();

  const handleSelect = (type: VendorType) => {
    router.push({
      pathname: "/(tabs)/prestataires/[type]/[id]",
      params: { type, id: "new" },
    });
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      <Stack.Screen options={{ title: "Nouveau prestataire" }} />
      <ScrollView
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(BUDGET_CATEGORIES).map(([category, types]) => (
          <View key={category} className="mb-5">
            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 ml-1">
              {category}
            </Text>
            <View className="flex-row flex-wrap" style={{ gap: 10 }}>
              {types.map((type) => {
                const Icon = VENDOR_TYPE_ICONS[type];
                return (
                  <Pressable
                    key={type}
                    onPress={() => handleSelect(type)}
                    className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 active:opacity-80 items-center justify-center"
                    style={{ width: "47%" }}
                  >
                    <View className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-900 items-center justify-center mb-2">
                      <Icon size={22} color="#EC4899" />
                    </View>
                    <Text
                      className="text-sm font-medium text-gray-900 dark:text-white text-center"
                      numberOfLines={2}
                    >
                      {VENDOR_TYPE_LABELS[type]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
