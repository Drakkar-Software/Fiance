import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator, Image } from "react-native";
import { useLocalSearchParams, Redirect, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { Clock, MapPin, HelpCircle, Calendar } from "lucide-react-native";
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
      <View className="flex-1 bg-accent-cream items-center justify-center">
        <Stack.Screen options={{ headerShown: false }} />
        <Image
          source={require("@/assets/icon.png")}
          style={{ width: 64, height: 64, borderRadius: 16 }}
          resizeMode="contain"
        />
        <ActivityIndicator size="small" color="#EC4899" className="mt-4" />
        <Text className="text-sm text-gray-400 mt-2">{t("loading")}</Text>
      </View>
    );
  }

  if (error || !page) {
    return (
      <View className="flex-1 bg-accent-cream items-center justify-center px-6">
        <Stack.Screen options={{ headerShown: false }} />
        <Image
          source={require("@/assets/icon.png")}
          style={{ width: 64, height: 64, borderRadius: 16, opacity: 0.4 }}
          resizeMode="contain"
        />
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
    <View className="flex-1 bg-accent-cream">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems: "center" }}>
        <View className="w-full" style={{ maxWidth: 600 }}>
        {/* Hero */}
        <View className="items-center pt-14 pb-10 px-6">
          <Image
            source={require("@/assets/icon.png")}
            style={{ width: 72, height: 72, borderRadius: 18 }}
            resizeMode="contain"
          />

          {coupleNames ? (
            <View className="items-center mt-5">
              <Text className="text-xs uppercase tracking-[3px] text-accent-gold font-medium mb-2">
                {t("weddingOf")}
              </Text>
              <Text className="text-3xl font-bold text-gray-900 text-center leading-tight">
                {coupleNames}
              </Text>
            </View>
          ) : null}

          {formattedDate && (
            <View className="flex-row items-center gap-2 mt-4 bg-white/70 px-4 py-2 rounded-full">
              <Calendar size={14} color="#C9956B" />
              <Text className="text-sm font-medium text-accent-gold capitalize">
                {formattedDate}
              </Text>
            </View>
          )}

          {about.venueName && (
            <View className="flex-row items-center gap-1.5 mt-2">
              <MapPin size={13} color="#9CA3AF" />
              <Text className="text-sm text-gray-400">{about.venueName}</Text>
            </View>
          )}

          {about.description && (
            <View className="mt-5 bg-white/60 rounded-2xl px-5 py-4 max-w-md">
              <Text className="text-sm text-gray-600 text-center leading-5 italic">
                {about.description}
              </Text>
            </View>
          )}

          {/* Decorative divider */}
          <View className="flex-row items-center gap-3 mt-6">
            <View className="h-px flex-1 bg-accent-rose-light" />
            <View className="w-1.5 h-1.5 rounded-full bg-accent-rose" />
            <View className="h-px flex-1 bg-accent-rose-light" />
          </View>
        </View>

        {/* Timeline */}
        {timeline.length > 0 && (
          <View className="mt-2 pb-4">
            <View className="flex-row items-center gap-2 px-5 mb-4">
              <Clock size={18} color="#C9956B" />
              <Text className="text-lg font-bold text-gray-900">
                {t("timeline")}
              </Text>
            </View>
            <View className="px-4">
              {timeline.map((item, idx) => (
                <TimelineItem
                  key={item.id}
                  left={
                    <Text className="text-sm font-bold text-accent-gold mt-3.5">
                      {item.time}
                    </Text>
                  }
                  showConnector={idx < timeline.length - 1}
                >
                  <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm" style={{ shadowColor: "#E8B4B8", shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
                    <Text className="text-base font-semibold text-gray-900">
                      {item.title}
                    </Text>
                    {item.endTime && (
                      <Text className="text-xs text-gray-400 mt-0.5">
                        {t("until", { time: item.endTime })}
                      </Text>
                    )}
                    {item.location && (
                      <View className="flex-row items-center gap-1.5 mt-2">
                        <MapPin size={12} color="#C9956B" />
                        <Text className="text-xs text-accent-gold font-medium">{item.location}</Text>
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
            <Clock size={40} color="#E8D5C0" />
            <Text className="text-sm text-gray-400 text-center mt-3">{t("noTimeline")}</Text>
          </View>
        )}

        {/* FAQ */}
        {faq.length > 0 && (
          <View className="mt-4 px-4 pb-6">
            {/* Decorative divider */}
            <View className="flex-row items-center gap-3 mb-6">
              <View className="h-px flex-1 bg-accent-rose-light" />
              <View className="w-1.5 h-1.5 rounded-full bg-accent-rose" />
              <View className="h-px flex-1 bg-accent-rose-light" />
            </View>

            <View className="flex-row items-center gap-2 px-1 mb-4">
              <HelpCircle size={18} color="#C9956B" />
              <Text className="text-lg font-bold text-gray-900">
                {t("faq")}
              </Text>
            </View>

            {faq.map((item, index) => (
              <View
                key={index}
                className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
                style={{ shadowColor: "#E8B4B8", shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}
              >
                <Text className="text-base font-semibold text-gray-900">
                  {item.question}
                </Text>
                <Text className="text-sm text-gray-500 mt-1.5 leading-5">
                  {item.answer}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View className="items-center pb-10 pt-4">
          <View className="flex-row items-center gap-3 mb-4 px-8">
            <View className="h-px flex-1 bg-accent-rose-light" />
            <View className="w-1.5 h-1.5 rounded-full bg-accent-rose" />
            <View className="h-px flex-1 bg-accent-rose-light" />
          </View>
          <Image
            source={require("@/assets/icon.png")}
            style={{ width: 28, height: 28, borderRadius: 6, opacity: 0.3 }}
            resizeMode="contain"
          />
          <Text className="text-xs text-gray-300 mt-1">WeddingOS</Text>
        </View>
        </View>
      </ScrollView>
    </View>
  );
}
