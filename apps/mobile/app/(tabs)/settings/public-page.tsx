import React, { useState, useCallback, useMemo, useEffect } from "react";
import { View, Text, ScrollView, Pressable } from "react-native-css/components";
import { Linking, Platform } from "react-native";
import { shareLink } from "@/lib/share";
import { useRouter, useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";
import { Globe, Clock, MapPin, Gift, ChevronRight, Eye, HelpCircle, Calendar, Camera } from "lucide-react-native";
import { safeFormat, getDateLocale } from "@/i18n/dateFnsLocale";
import { TimelineItem } from "@/components/TimelineItem";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { useWeddingStore } from "@/store/useWeddingStore";
import { useGuestsStore } from "@/store/useGuestsStore";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";
import { isSyncActive } from "@/lib/starfish";
import { resolvePublicPageUrl } from "@/lib/public-page";
import { toast } from "@/lib/toast/sonner";
import { recalculateDueDates } from "@/lib/planning";
import { rescheduleAllNotifications } from "@/lib/notifications";
import { IconCard } from "@/components/IconCard";
import {
  SectionTitle,
  FormCard,
  InputRow,
  DateRow,
} from "@/components/FormSection";
import { Display } from "@/components/Display";
import { PageHeader } from "@/components/PageHeader";
import { Postit } from "@/components/Postit";
import { analytics } from "@/lib/analytics";

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

  // Both partner names must be filled before Preview / Share are enabled.
  const infoComplete = partner1.trim().length > 0 && partner2.trim().length > 0;

  // Track live sync state so buttons only appear (and work) when sync is active.
  const [syncActive, setSyncActive] = useState(isSyncActive);
  useFocusEffect(
    useCallback(() => {
      setSyncActive(isSyncActive());
    }, []),
  );

  // Share — mint a v3 page-read invite link.
  const handleShare = useCallback(async () => {
    try {
      const url = await resolvePublicPageUrl();
      if (!url) return;
      await shareLink(url, t("sharePublicPageMsg", { url }), t("linkCopied"));
      analytics.capture("public_page_shared");
    } catch (err) {
      console.warn("[public-page] handleShare failed:", err);
      toast.error(t("shareError"));
    }
  }, [t]);

  return (
    <ScrollView
      className="flex-1 bg-accent-paper"
      showsVerticalScrollIndicator={false}
    >
      <PageHeader
        eyebrow={t("publicPageTitle")}
        title={t("publicPageHeroTitle")}
        titleSize={26}
      />
      {/* Wedding info */}
      <View className="px-4 pt-2">
        <SectionTitle>{t("publicPageInfo")}</SectionTitle>
        <Text className="text-sm text-mute leading-5 mb-3 -mt-1">
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
        <Text className="text-sm text-mute leading-5 mb-3 -mt-1">
          {activeEntry?.seedPhrase ? t("rsvpSectionDesc") : t("syncRequiredRsvp")}
        </Text>
        {activeEntry?.seedPhrase && (
          <Text className="text-xs text-mute mb-4">
            {t("rsvpCount", { count: guestCount })}
          </Text>
        )}
      </View>

      {/* Timeline preview */}
      <View className="px-4">
        <SectionTitle>{t("timelinePreview")}</SectionTitle>
        <Text className="text-sm text-mute leading-5 mb-3 -mt-1">
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
          <View className="bg-accent-card rounded-2xl p-5 mb-3 border border-hair items-center">
            <Clock size={32} color="#D1D5DB" />
            <Text className="text-sm text-mute text-center mt-2">
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
          {syncActive ? (
            <View style={{ position: "relative" }}>
              <Postit angle={-2} size="sm" style={{ position: "absolute", top: -20, right: 8, zIndex: 10 }}>
                {t("sharePublicPage")}
              </Postit>
              <View className="gap-2">
                {!infoComplete && (
                  <Text className="text-xs text-mute text-center mb-1">
                    {t("publicPageIncompleteHint")}
                  </Text>
                )}
                <Pressable
                  disabled={!infoComplete}
                  style={{ opacity: infoComplete ? 1 : 0.4 }}
                  onPress={async () => {
                    if (!infoComplete) return;
                    try {
                      const url = await resolvePublicPageUrl();
                      if (!url) return;
                      const fragment = url.includes("/wedding/") ? url.split("/wedding/")[1] : null;
                      if (!fragment) return;
                      if (Platform.OS === "web") {
                        router.push(`/wedding/${fragment}`);
                      } else {
                        await Linking.openURL(url);
                      }
                    } catch (err) {
                      console.warn("[public-page] preview failed:", err);
                      toast.error(t("shareError"));
                    }
                  }}
                  className="bg-accent-card rounded-2xl py-3.5 flex-row items-center justify-center border border-hair active:opacity-80"
                >
                  <Eye size={18} color="#6B7280" />
                  <Text className="text-mute dark:text-mute font-medium text-base ml-2">
                    {t("previewPage")}
                  </Text>
                </Pressable>
                <Pressable
                  disabled={!infoComplete}
                  style={{ opacity: infoComplete ? 1 : 0.4 }}
                  onPress={infoComplete ? handleShare : undefined}
                  className="bg-primary-500 rounded-2xl py-4 flex-row items-center justify-center active:bg-primary-600"
                >
                  <Globe size={20} color="#fff" />
                  <Text className="text-white font-semibold text-base ml-2">
                    {t("sharePublicPage")}
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Text className="text-sm text-mute leading-5 mb-3">
              {t("syncRequiredShare")}
            </Text>
          )}
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
      <View className="bg-accent-card rounded-2xl p-3.5 mb-3 border border-hair">
        <Text className="text-base font-medium text-ink">{item.title}</Text>
        {item.endTime && (
          <Text className="text-xs text-mute mt-0.5">{t("timelineUntil", { time: item.endTime })}</Text>
        )}
        {item.location && (
          <View className="flex-row items-center gap-1 mt-1.5">
            <MapPin size={12} color="#9CA3AF" />
            <Text className="text-xs text-mute">{item.location}</Text>
          </View>
        )}
      </View>
    </TimelineItem>
  );
}
