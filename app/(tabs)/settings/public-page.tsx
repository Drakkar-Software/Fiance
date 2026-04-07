import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Share,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, Globe, Clock, MapPin } from "lucide-react-native";
import { safeFormat, getDateLocale } from "@/i18n/dateFnsLocale";
import { TimelineItem } from "@/components/TimelineItem";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { useWeddingStore } from "@/store/useWeddingStore";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";
import { deriveAuthToken, buildWeddingPageUrl } from "@/lib/identity";
import { recalculateDueDates } from "@/lib/planning";
import { rescheduleAllNotifications } from "@/lib/notifications";
import type { FaqItem } from "@/lib/public-page";
import {
  SectionTitle,
  FormCard,
  InputRow,
  DateRow,
} from "@/components/FormSection";

export default function PublicPageScreen() {
  const router = useRouter();
  const { t } = useTranslation("settings");
  const wedding = useWeddingStore((s) => s.wedding);
  const updateWedding = useWeddingStore((s) => s.updateWedding);
  const registry = useWeddingRegistryStore((s) => s.registry);
  const activeEntry = registry?.weddings.find(
    (w) => w.id === registry.activeWeddingId
  );

  // Wedding fields
  const [partner1, _setPartner1] = useState(wedding?.partner1Name || "");
  const setPartner1 = useCallback((value: string) => {
    _setPartner1(value);
    updateWedding({ partner1Name: value || null });
  }, []);

  const [partner2, _setPartner2] = useState(wedding?.partner2Name || "");
  const setPartner2 = useCallback((value: string) => {
    _setPartner2(value);
    updateWedding({ partner2Name: value || null });
  }, []);

  const [weddingDate, _setWeddingDate] = useState(wedding?.weddingDate || "");
  const setWeddingDate = useCallback((value: string) => {
    _setWeddingDate(value);
    updateWedding({ weddingDate: value || null });
  }, []);

  const [venueName, _setVenueName] = useState(wedding?.venueName || "");
  const setVenueName = useCallback((value: string) => {
    _setVenueName(value);
    updateWedding({ venueName: value || null });
  }, []);

  const [description, _setDescription] = useState(wedding?.description || "");
  const setDescription = useCallback((value: string) => {
    _setDescription(value);
    updateWedding({ description: value || null });
  }, []);

  // Recalculate task due dates when wedding date changes
  const tasks = usePlanningStore((s) => s.tasks);
  const setTasks = usePlanningStore((s) => s.setTasks);
  useEffect(() => {
    if (weddingDate && weddingDate !== wedding?.weddingDate) {
      const updated = recalculateDueDates(tasks, weddingDate);
      setTasks(updated);
      if (useSettingsStore.getState().notificationsEnabled) {
        rescheduleAllNotifications(updated, usePlanningStore.getState().agendaEvents)
          .catch((err) => console.warn("[notifications] Reschedule failed:", err));
      }
    }
  }, [weddingDate]);

  // FAQ
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

  const addFaqItem = useCallback(() => {
    saveFaq([...faqItems, { question: "", answer: "" }]);
  }, [faqItems, saveFaq]);

  const updateFaqItem = useCallback(
    (index: number, updates: Partial<FaqItem>) => {
      const updated = faqItems.map((item, i) =>
        i === index ? { ...item, ...updates } : item
      );
      saveFaq(updated);
    },
    [faqItems, saveFaq]
  );

  const removeFaqItem = useCallback(
    (index: number) => {
      saveFaq(faqItems.filter((_, i) => i !== index));
    },
    [faqItems, saveFaq]
  );

  // Timeline preview — public day-of items
  const dayOfItems = usePlanningStore((s) => s.dayOfItems);
  const publicDayOfItems = useMemo(
    () =>
      dayOfItems
        .filter((item) => item.isPublic)
        .sort((a, b) => {
          const da = (a.date || weddingDate || "").localeCompare(b.date || weddingDate || "");
          if (da !== 0) return da;
          return (a.time || "").localeCompare(b.time || "");
        }),
    [dayOfItems, weddingDate]
  );

  const groupedPreview = useMemo(() => {
    const groups: Record<string, typeof publicDayOfItems> = {};
    publicDayOfItems.forEach((item) => {
      const dateStr = item.date || weddingDate || "";
      const key = dateStr
        ? safeFormat(new Date(dateStr + "T00:00:00"), "EEEE d MMMM yyyy", { locale: getDateLocale() })
        : t("common:noDate");
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [publicDayOfItems, weddingDate]);
  const isMultiDay = Object.keys(groupedPreview).length > 1;

  // Share
  const handleShare = useCallback(async () => {
    const password = activeEntry?.seedPhrase;
    if (!password) return;
    try {
      const authToken = await deriveAuthToken(password);
      const userId = authToken.slice(0, 16);
      const url = buildWeddingPageUrl(userId);
      await Share.share({ message: t("sharePublicPageMsg", { url }) });
    } catch {}
  }, [activeEntry?.seedPhrase, t]);

  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-gray-950"
      showsVerticalScrollIndicator={false}
    >
      {/* Wedding info */}
      <View className="px-4 pt-4">
        <SectionTitle>{t("publicPageInfo")}</SectionTitle>
        <Text className="text-sm text-gray-500 dark:text-gray-400 leading-5 mb-3 -mt-1">
          {t("publicPageInfoDesc")}
        </Text>
        <FormCard>
          <InputRow label={t("partner1")} value={partner1} onChangeText={setPartner1} placeholder={t("partnerPlaceholder")} />
          <InputRow label={t("partner2")} value={partner2} onChangeText={setPartner2} placeholder={t("partnerPlaceholder")} />
          <DateRow label={t("weddingDate")} value={weddingDate} onChange={setWeddingDate} />
          <InputRow label={t("mainVenue")} value={venueName} onChangeText={setVenueName} placeholder={t("venuePlaceholder")} />
          <InputRow label={t("description")} value={description} onChangeText={setDescription} placeholder={t("descriptionPlaceholder")} multiline />
        </FormCard>
      </View>

      {/* FAQ */}
      <View className="px-4">
        <SectionTitle>{t("faqTitle")}</SectionTitle>
        <Text className="text-sm text-gray-500 dark:text-gray-400 leading-5 mb-3 -mt-1">
          {t("faqSubtitle")}
        </Text>

        {faqItems.map((item, index) => (
          <View
            key={index}
            className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-3 border border-gray-100 dark:border-gray-800"
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {t("faqItemLabel", { index: index + 1 })}
              </Text>
              <Pressable
                onPress={() => removeFaqItem(index)}
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
                onChangeText={(text) => updateFaqItem(index, { question: text })}
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
                onChangeText={(text) => updateFaqItem(index, { answer: text })}
                placeholder={t("faqAnswerPlaceholder")}
                placeholderTextColor="#D0D0D8"
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>
        ))}

        <Pressable
          onPress={addFaqItem}
          className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-3 border border-dashed border-gray-300 dark:border-gray-700 flex-row items-center justify-center active:opacity-80"
        >
          <Plus size={20} color="#9CA3AF" />
          <Text className="text-base font-medium text-gray-500 dark:text-gray-400 ml-2">
            {t("faqAdd")}
          </Text>
        </Pressable>
      </View>

      {/* Timeline preview */}
      <View className="px-4">
        <SectionTitle>{t("timelinePreview")}</SectionTitle>
        <Text className="text-sm text-gray-500 dark:text-gray-400 leading-5 mb-3 -mt-1">
          {t("timelinePreviewDesc")}
        </Text>

        {publicDayOfItems.length > 0 ? (
          <View className="mb-3">
            {isMultiDay ? (
              Object.entries(groupedPreview).map(([dateLabel, dateItems]) => (
                <CollapsibleSection key={dateLabel} title={dateLabel} count={dateItems.length} defaultExpanded>
                  {dateItems.map((item, idx) => (
                    <PreviewTimelineCard key={item.id} item={item} idx={idx} total={dateItems.length} router={router} t={t} />
                  ))}
                </CollapsibleSection>
              ))
            ) : (
              publicDayOfItems.map((item, idx) => (
                <PreviewTimelineCard key={item.id} item={item} idx={idx} total={publicDayOfItems.length} router={router} t={t} />
              ))
            )}
          </View>
        ) : (
          <View className="bg-white dark:bg-gray-900 rounded-2xl p-5 mb-3 border border-gray-100 dark:border-gray-800 items-center">
            <Clock size={32} color="#D1D5DB" />
            <Text className="text-sm text-gray-400 text-center mt-2">
              {t("timelinePreviewEmpty")}
            </Text>
          </View>
        )}
      </View>

      {/* Share */}
      {activeEntry?.seedPhrase && (
        <View className="px-4 mt-2">
          <Pressable
            onPress={handleShare}
            className="bg-primary-500 rounded-2xl py-4 flex-row items-center justify-center active:bg-primary-600"
          >
            <Globe size={20} color="#fff" />
            <Text className="text-white font-semibold text-base ml-2">
              {t("sharePublicPage")}
            </Text>
          </Pressable>
        </View>
      )}

      <View className="h-8" />
    </ScrollView>
  );
}

function PreviewTimelineCard({ item, idx, total, router, t }: {
  item: any; idx: number; total: number; router: any; t: (key: string, opts?: any) => string;
}) {
  return (
    <TimelineItem
      left={<Text className="text-sm font-bold text-primary-500 mt-3.5">{item.time}</Text>}
      showConnector={idx < total - 1}
      onPress={() => router.push({ pathname: "/(tabs)/planning/day-of-item", params: { id: item.id } })}
    >
      <View className="bg-white dark:bg-gray-900 rounded-2xl p-3.5 mb-3 border border-gray-100 dark:border-gray-800">
        <Text className="text-base font-medium text-gray-900 dark:text-white">{item.title}</Text>
        {item.endTime && (
          <Text className="text-xs text-gray-400 mt-0.5">{t("timelineUntil", { time: item.endTime })}</Text>
        )}
        {item.location && (
          <View className="flex-row items-center gap-1 mt-1.5">
            <MapPin size={12} color="#9CA3AF" />
            <Text className="text-xs text-gray-400">{item.location}</Text>
          </View>
        )}
      </View>
    </TimelineItem>
  );
}
