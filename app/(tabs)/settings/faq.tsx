import React, { useCallback, useMemo } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native-css/components";
import { useTranslation } from "react-i18next";
import { Plus, Trash2 } from "lucide-react-native";
import { useWeddingStore } from "@/store/useWeddingStore";
import type { FaqItem } from "@/lib/public-page";
import { SectionTitle } from "@/components/FormSection";

export default function FaqScreen() {
  const { t } = useTranslation("settings");
  const wedding = useWeddingStore((s) => s.wedding);
  const updateWedding = useWeddingStore((s) => s.updateWedding);

  const faqItems: FaqItem[] = useMemo(() => {
    if (!wedding?.faq) return [];
    try {
      return JSON.parse(wedding.faq);
    } catch {
      return [];
    }
  }, [wedding?.faq]);

  const saveFaq = useCallback(
    (items: FaqItem[]) => {
      updateWedding({ faq: JSON.stringify(items) });
    },
    [updateWedding]
  );

  const addItem = useCallback(() => {
    saveFaq([...faqItems, { question: "", answer: "" }]);
  }, [faqItems, saveFaq]);

  const updateItem = useCallback(
    (index: number, updates: Partial<FaqItem>) => {
      const updated = faqItems.map((item, i) =>
        i === index ? { ...item, ...updates } : item
      );
      saveFaq(updated);
    },
    [faqItems, saveFaq]
  );

  const removeItem = useCallback(
    (index: number) => {
      saveFaq(faqItems.filter((_, i) => i !== index));
    },
    [faqItems, saveFaq]
  );

  return (
    <ScrollView
      className="flex-1 bg-accent-paper"
      showsVerticalScrollIndicator={false}
    >
      <View className="px-4 pt-4">
        <SectionTitle>{t("faqTitle")}</SectionTitle>
        <Text className="text-sm text-gray-500 dark:text-gray-400 leading-5 mb-3 -mt-1">
          {t("faqSubtitle")}
        </Text>

        {faqItems.map((item, index) => (
          <View
            key={index}
            className="bg-accent-card rounded-2xl p-4 mb-3 border border-gray-100 dark:border-gray-800"
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {t("faqItemLabel", { index: index + 1 })}
              </Text>
              <Pressable
                onPress={() => removeItem(index)}
                className="w-8 h-8 items-center justify-center rounded-lg active:opacity-60"
              >
                <Trash2 size={16} color="#EF4444" />
              </Pressable>
            </View>
            <View className="border-b border-gray-50 dark:border-gray-800 pb-3 mb-3">
              <Text className="text-xs text-gray-400 mb-1 font-medium">
                {t("faqQuestion")}
              </Text>
              <TextInput
                className="text-base text-gray-900 dark:text-white"
                value={item.question}
                onChangeText={(text) => updateItem(index, { question: text })}
                placeholder={t("faqQuestionPlaceholder")}
                placeholderTextColor="#D0D0D8"
              />
            </View>
            <View>
              <Text className="text-xs text-gray-400 mb-1 font-medium">
                {t("faqAnswer")}
              </Text>
              <TextInput
                className="text-base text-gray-900 dark:text-white"
                value={item.answer}
                onChangeText={(text) => updateItem(index, { answer: text })}
                placeholder={t("faqAnswerPlaceholder")}
                placeholderTextColor="#D0D0D8"
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>
        ))}

        <Pressable
          onPress={addItem}
          className="bg-accent-card rounded-2xl p-4 mb-3 border border-dashed border-gray-300 dark:border-gray-700 flex-row items-center justify-center active:opacity-80"
        >
          <Plus size={20} color="#9CA3AF" />
          <Text className="text-base font-medium text-gray-500 dark:text-gray-400 ml-2">
            {t("faqAdd")}
          </Text>
        </Pressable>
      </View>

      <View className="h-8" />
    </ScrollView>
  );
}
