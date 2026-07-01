import React from "react";
import { View, Text, ScrollView } from "react-native-css/components";
import { usePlanningStore } from "@/store/usePlanningStore";

export default function CategoriesScreen() {
  const categories = usePlanningStore((s) => s.categories);
  const tasks = usePlanningStore((s) => s.tasks);

  return (
    <ScrollView className="flex-1 bg-accent-paper px-4 pt-4">
      {categories.map((cat) => {
        const catTasks = tasks.filter((t) => t.categoryId === cat.id);
        const done = catTasks.filter((t) => t.status === "DONE").length;

        return (
          <View
            key={cat.id}
            className="bg-accent-card rounded-xl p-4 mb-3 border border-hair"
          >
            <View className="flex-row items-center">
              <View
                className="w-4 h-4 rounded-full mr-3"
                style={{ backgroundColor: cat.color || "#9CA3AF" }}
              />
              <Text className="text-base font-semibold text-ink flex-1">
                {cat.name}
              </Text>
              <Text className="text-sm text-mute">
                {done}/{catTasks.length}
              </Text>
            </View>
          </View>
        );
      })}
      <View className="h-24" />
    </ScrollView>
  );
}
