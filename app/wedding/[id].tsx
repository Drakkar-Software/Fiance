import React, { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams, Redirect, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { Heart, Clock, MapPin, HelpCircle } from "lucide-react-native";
import { safeFormat, getDateLocale } from "@/i18n/dateFnsLocale";
import { fetchPublicPage, type PublicWeddingPage } from "@/lib/public-page";
import { TimelineItem } from "@/components/TimelineItem";

export default function WeddingPublicPage() {
  const { t } = useTranslation("wedding-page");
  const { id } = useLocalSearchParams<{ id: string }>();
  const [page, setPage] = useState<PublicWeddingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    const serverUrl = process.env.EXPO_PUBLIC_SYNC_URL;
    if (!serverUrl) {
      setError(true);
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const data = await fetchPublicPage(serverUrl, id);
        if (data) {
          setPage(data);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (!id) return <Redirect href="/" />;

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-950 items-center justify-center">
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#EC4899" />
        <Text className="text-base text-gray-400 mt-4">{t("loading")}</Text>
      </View>
    );
  }

  if (error || !page) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-950 items-center justify-center px-6">
        <Stack.Screen options={{ headerShown: false }} />
        <Heart size={48} color="#D1D5DB" />
        <Text className="text-base text-gray-400 text-center mt-4">{t("error")}</Text>
      </View>
    );
  }

  const { about, timeline, faq } = page;
  const coupleNames = [about.partner1Name, about.partner2Name].filter(Boolean).join(" & ");
  const formattedDate = about.weddingDate
    ? safeFormat(new Date(about.weddingDate), "EEEE d MMMM yyyy", { locale: getDateLocale() })
    : null;

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View className="items-center pt-16 pb-10 px-6 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <View className="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-900 items-center justify-center mb-4">
            <Heart size={28} color="#EC4899" />
          </View>
          {coupleNames ? (
            <>
              <Text className="text-xs uppercase tracking-widest text-gray-400 mb-1">
                {t("weddingOf")}
              </Text>
              <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center">
                {coupleNames}
              </Text>
            </>
          ) : null}
          {formattedDate && (
            <Text className="text-base text-primary-500 mt-2 capitalize">{formattedDate}</Text>
          )}
          {about.venueName && (
            <View className="flex-row items-center gap-1 mt-2">
              <MapPin size={14} color="#9CA3AF" />
              <Text className="text-sm text-gray-400">{about.venueName}</Text>
            </View>
          )}
          {about.description && (
            <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4 leading-5 px-2">
              {about.description}
            </Text>
          )}
        </View>

        {/* Timeline */}
        {timeline.length > 0 && (
          <View className="mt-6">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white px-4 mb-4">
              {t("timeline")}
            </Text>
            <View className="px-4">
              {timeline.map((item, idx) => (
                <TimelineItem
                  key={item.id}
                  left={
                    <Text className="text-sm font-bold text-primary-500 mt-3.5">
                      {item.time}
                    </Text>
                  }
                  showConnector={idx < timeline.length - 1}
                >
                  <View className="bg-white dark:bg-gray-900 rounded-2xl p-3.5 mb-3 border border-gray-100 dark:border-gray-800">
                    <Text className="text-base font-medium text-gray-900 dark:text-white">
                      {item.title}
                    </Text>
                    {item.endTime && (
                      <Text className="text-xs text-gray-400 mt-0.5">
                        {t("until", { time: item.endTime })}
                      </Text>
                    )}
                    {item.location && (
                      <View className="flex-row items-center gap-1 mt-1.5">
                        <MapPin size={12} color="#9CA3AF" />
                        <Text className="text-xs text-gray-400">{item.location}</Text>
                      </View>
                    )}
                  </View>
                </TimelineItem>
              ))}
            </View>
          </View>
        )}

        {timeline.length === 0 && (
          <View className="items-center justify-center py-16 px-6">
            <Clock size={48} color="#D1D5DB" />
            <Text className="text-base text-gray-400 text-center mt-4">{t("noTimeline")}</Text>
          </View>
        )}

        {/* FAQ */}
        {faq.length > 0 && (
          <View className="mt-6 px-4 pb-8">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t("faq")}
            </Text>
            {faq.map((item, index) => (
              <View
                key={index}
                className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-3 border border-gray-100 dark:border-gray-800"
              >
                <View className="flex-row items-start gap-2">
                  <HelpCircle size={16} color="#EC4899" className="mt-0.5" />
                  <View className="flex-1">
                    <Text className="text-base font-medium text-gray-900 dark:text-white">
                      {item.question}
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {item.answer}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        <View className="h-12" />
      </ScrollView>
    </View>
  );
}
