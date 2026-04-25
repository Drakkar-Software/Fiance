import React, { useState, useCallback, useMemo, useEffect } from "react";
import { View, Text, ScrollView, Pressable } from "react-native-css/components";
import { Share, Alert, Linking } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Globe, Clock, MapPin, Gift, ChevronRight, Send, RefreshCw, Eye, HelpCircle, Calendar, Camera } from "lucide-react-native";
import { safeFormat, getDateLocale } from "@/i18n/dateFnsLocale";
import { TimelineItem } from "@/components/TimelineItem";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { useWeddingStore } from "@/store/useWeddingStore";
import { useGuestsStore } from "@/store/useGuestsStore";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";
import { buildWeddingPageUrl } from "@/lib/identity";
import { resolveServerConfig, deriveUserId } from "@/lib/server";
import { recalculateDueDates } from "@/lib/planning";
import { rescheduleAllNotifications } from "@/lib/notifications";
import { pushRsvpRoster, fetchRsvpInbox, applyRsvpSubmissions } from "@/lib/rsvp-sync";
import { IconCard } from "@/components/IconCard";
import {
  SectionTitle,
  FormCard,
  InputRow,
  DateRow,
} from "@/components/FormSection";
import { Display } from "@/components/Display";

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

  // RSVP
  const guestCount = useGuestsStore((s) => s.guests.length);
  const [publishingRoster, setPublishingRoster] = useState(false);
  const [syncingRsvp, setSyncingRsvp] = useState(false);

  const handlePublishRoster = useCallback(async () => {
    const config = await resolveServerConfig(activeEntry);
    if (!config) return;
    setPublishingRoster(true);
    try {
      await pushRsvpRoster(config);
      Alert.alert(t("publishRosterSuccess"));
    } catch (e: any) {
      Alert.alert(t("common:error"), e.message);
    } finally {
      setPublishingRoster(false);
    }
  }, [activeEntry, t]);

  const handleSyncRsvp = useCallback(async () => {
    const config = await resolveServerConfig(activeEntry);
    if (!config) return;
    setSyncingRsvp(true);
    try {
      const submissions = await fetchRsvpInbox(config);
      const count = applyRsvpSubmissions(submissions);
      Alert.alert(count > 0 ? t("syncRsvpSuccess", { count }) : t("syncRsvpNone"));
    } catch (e: any) {
      Alert.alert(t("common:error"), e.message);
    } finally {
      setSyncingRsvp(false);
    }
  }, [activeEntry, t]);

  // Share
  const handleShare = useCallback(async () => {
    if (!activeEntry?.seedPhrase) return;
    try {
      const userId = await deriveUserId(activeEntry.seedPhrase);
      const url = buildWeddingPageUrl(userId);
      await Share.share({ message: t("sharePublicPageMsg", { url }) });
    } catch {}
  }, [activeEntry?.seedPhrase, t]);

  return (
    <ScrollView
      className="flex-1 bg-accent-paper"
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

      {/* RSVP online */}
      <View className="px-4">
        <SectionTitle>{t("rsvpSection")}</SectionTitle>
        <Text className="text-sm text-gray-500 dark:text-gray-400 leading-5 mb-3 -mt-1">
          {activeEntry?.seedPhrase ? t("rsvpSectionDesc") : t("syncRequiredRsvp")}
        </Text>
        {activeEntry?.seedPhrase ? (
          <View className="gap-2">
            <Text className="text-xs text-gray-400 mb-1">
              {t("rsvpCount", { count: guestCount })}
            </Text>
            <Pressable
              onPress={publishingRoster ? undefined : handlePublishRoster}
              className="bg-accent-card rounded-2xl p-4 border border-gray-100 dark:border-gray-800 flex-row items-center active:opacity-80"
            >
              <View className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900 items-center justify-center mr-3">
                <Send size={18} color="#b96a4a" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900 dark:text-white">
                  {publishingRoster ? "..." : t("publishRoster")}
                </Text>
                <Text className="text-xs text-gray-400 mt-0.5 leading-4">
                  {t("publishRosterDesc")}
                </Text>
              </View>
            </Pressable>
            <Pressable
              onPress={syncingRsvp ? undefined : handleSyncRsvp}
              className="bg-accent-card rounded-2xl p-4 border border-gray-100 dark:border-gray-800 flex-row items-center active:opacity-80"
            >
              <View className="w-9 h-9 rounded-xl bg-green-50 dark:bg-green-900 items-center justify-center mr-3">
                <RefreshCw size={18} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900 dark:text-white">
                  {syncingRsvp ? "..." : t("syncRsvp")}
                </Text>
                <Text className="text-xs text-gray-400 mt-0.5 leading-4">
                  {t("syncRsvpDesc")}
                </Text>
              </View>
            </Pressable>
          </View>
        ) : (
          <View className="bg-accent-paper dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
            <Text className="text-sm text-gray-400">{t("syncRequiredRsvp")}</Text>
          </View>
        )}
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
          <View className="bg-accent-card rounded-2xl p-5 mb-3 border border-gray-100 dark:border-gray-800 items-center">
            <Clock size={32} color="#D1D5DB" />
            <Text className="text-sm text-gray-400 text-center mt-2">
              {t("timelinePreviewEmpty")}
            </Text>
          </View>
        )}
        <IconCard
          icon={
            <View className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900 items-center justify-center">
              <Calendar size={20} color="#6366F1" />
            </View>
          }
          title={t("manageDayOf")}
          subtitle={t("manageDayOfDesc")}
          right={<ChevronRight size={18} color="#C0C0C8" />}
          onPress={() => router.push({ pathname: "/(tabs)/planning", params: { aspect: "day-of" } })}
        />
      </View>

      {/* Event photos + FAQ + Gift registry */}
      <View className="px-4 mt-2">
        <IconCard
          icon={
            <View className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900 items-center justify-center">
              <Camera size={20} color="#10B981" />
            </View>
          }
          title={t("eventPhotosTitle")}
          subtitle={t("eventPhotosDesc")}
          right={<ChevronRight size={18} color="#C0C0C8" />}
          onPress={() => router.push("/(tabs)/settings/event-photos")}
        />
        <IconCard
          icon={
            <View className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900 items-center justify-center">
              <HelpCircle size={20} color="#3B82F6" />
            </View>
          }
          title={t("configureFaq")}
          subtitle={t("configureFaqDesc")}
          right={<ChevronRight size={18} color="#C0C0C8" />}
          onPress={() => router.push("/(tabs)/settings/faq")}
        />
        <IconCard
          icon={
            <View className="w-10 h-10 rounded-xl bg-accent-blush dark:bg-primary-900 items-center justify-center">
              <Gift size={20} color="#b96a4a" />
            </View>
          }
          title={t("giftRegistry")}
          subtitle={t("giftRegistryDesc")}
          right={<ChevronRight size={18} color="#C0C0C8" />}
          onPress={() => router.push("/(tabs)/settings/gifts")}
        />
      </View>

      {/* Preview + Share */}
      {activeEntry?.seedPhrase && (
        <View className="px-4 mt-2 gap-2">
          <Pressable
            onPress={async () => {
              try {
                const userId = await deriveUserId(activeEntry.seedPhrase!);
                if (typeof window !== "undefined") {
                  router.push(`/wedding/${userId}`);
                } else {
                  await Linking.openURL(buildWeddingPageUrl(userId));
                }
              } catch {}
            }}
            className="bg-accent-card rounded-2xl py-3.5 flex-row items-center justify-center border border-gray-200 dark:border-gray-700 active:opacity-80"
          >
            <Eye size={18} color="#6B7280" />
            <Text className="text-gray-600 dark:text-gray-300 font-medium text-base ml-2">
              {t("previewPage")}
            </Text>
          </Pressable>
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
      left={<Display size={14} weight="500" color="#b96a4a" style={{ marginTop: 14 }}>{item.time}</Display>}
      showConnector={idx < total - 1}
      onPress={() => router.push({ pathname: "/(tabs)/planning/day-of-item", params: { id: item.id } })}
    >
      <View className="bg-accent-card rounded-2xl p-3.5 mb-3 border border-gray-100 dark:border-gray-800">
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
