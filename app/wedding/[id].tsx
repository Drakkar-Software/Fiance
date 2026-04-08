import React, { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, ActivityIndicator, Image, Pressable, Platform, TextInput } from "react-native";
import { useLocalSearchParams, Redirect, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { Clock, MapPin, HelpCircle, Calendar, Globe, CheckCircle2 } from "lucide-react-native";
import { safeFormat, getDateLocale } from "@/i18n/dateFnsLocale";
import { fetchPublicPage, type PublicWeddingPage } from "@/lib/public-page";
import { fetchRsvpRoster, submitRsvp, type RsvpRosterEntry } from "@/lib/rsvp-sync";
import { TimelineItem } from "@/components/TimelineItem";

function setOgMeta(page: PublicWeddingPage, t: (key: string, opts?: Record<string, string>) => string) {
  if (Platform.OS !== "web") return;
  const names = [page.about.partner1Name, page.about.partner2Name].filter(Boolean).join(" & ");
  const title = names ? t("seo:weddingOf", { names }) : "WeddingOS";
  const desc = page.about.description || t("seo:defaultDescription");

  document.title = title;
  const tags: Record<string, string> = {
    "og:title": title,
    "og:description": desc,
    "twitter:title": title,
    "twitter:description": desc,
  };
  for (const [key, value] of Object.entries(tags)) {
    const el =
      document.querySelector(`meta[property="${key}"]`) ??
      document.querySelector(`meta[name="${key}"]`);
    if (el) el.setAttribute("content", value);
  }
}

function LangSwitch() {
  const currentLang = i18n.language;
  const toggle = () => i18n.changeLanguage(currentLang === "fr" ? "en" : "fr");

  return (
    <Pressable
      onPress={toggle}
      className="flex-row items-center gap-1.5 self-end mr-5 mt-4 px-3 py-1.5 rounded-full bg-white/60"
      style={{ position: "absolute", top: 8, right: 0, zIndex: 10 }}
    >
      <Globe size={13} color="#9CA3AF" />
      <Text className="text-xs font-medium text-gray-400 uppercase tracking-wide">
        {currentLang === "fr" ? "EN" : "FR"}
      </Text>
    </Pressable>
  );
}

export default function WeddingPublicPage() {
  const { t } = useTranslation(["wedding-page", "seo"]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const [page, setPage] = useState<PublicWeddingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [roster, setRoster] = useState<RsvpRosterEntry[] | null>(null);
  const [rsvpSearch, setRsvpSearch] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<RsvpRosterEntry | null>(null);
  const [rsvpStatus, setRsvpStatus] = useState<"ACCEPTED" | "DECLINED" | "MAYBE" | null>(null);
  const [rsvpDiet, setRsvpDiet] = useState("STANDARD");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
        const [data, rosterData] = await Promise.all([
          fetchPublicPage(serverUrl, id),
          fetchRsvpRoster(serverUrl, id),
        ]);
        if (data) {
          setPage(data);
          setOgMeta(data, t);
        } else {
          setError(true);
        }
        if (rosterData?.guests) setRoster(rosterData.guests);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const about = page?.about;
  const timeline = page?.timeline ?? [];
  const faq = page?.faq ?? [];

  const coupleNames = [about?.partner1Name, about?.partner2Name].filter(Boolean).join(" & ");
  const formattedDate = about?.weddingDate
    ? safeFormat(new Date(about.weddingDate), "EEEE d MMMM yyyy", { locale: getDateLocale() })
    : null;

  const groupedTimeline = useMemo(() => {
    const groups: Record<string, typeof timeline> = {};
    timeline.forEach((item) => {
      const dateStr = item.date || about?.weddingDate || "";
      const key = dateStr
        ? safeFormat(new Date(dateStr + "T00:00:00"), "EEEE d MMMM yyyy", { locale: getDateLocale() })
        : "";
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [timeline, about?.weddingDate]);
  const isMultiDay = Object.keys(groupedTimeline).length > 1;

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

  return (
    <View className="flex-1 bg-accent-cream">
      <Stack.Screen options={{ headerShown: false }} />
      <LangSwitch />
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

          {about?.venueName && (
            <View className="flex-row items-center gap-1.5 mt-2">
              <MapPin size={13} color="#9CA3AF" />
              <Text className="text-sm text-gray-400">{about?.venueName}</Text>
            </View>
          )}

          {about?.description && (
            <View className="mt-5 bg-white/60 rounded-2xl px-5 py-4 max-w-md">
              <Text className="text-sm text-gray-600 text-center leading-5 italic">
                {about?.description}
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
              {Object.entries(groupedTimeline).map(([dateLabel, dateItems]) => (
                <View key={dateLabel}>
                  {isMultiDay && dateLabel ? (
                    <View className="mt-3 mb-3 px-1">
                      <Text className="text-sm font-semibold text-accent-gold uppercase tracking-wider capitalize">
                        {dateLabel}
                      </Text>
                    </View>
                  ) : null}
                  {dateItems.map((item, idx) => (
                    <TimelineItem
                      key={item.id}
                      left={
                        <Text className="text-sm font-bold text-accent-gold mt-3.5">
                          {item.time}
                        </Text>
                      }
                      showConnector={idx < dateItems.length - 1}
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

        {/* RSVP */}
        {roster && roster.length > 0 && (
          <View className="mt-4 px-4 pb-6">
            <View className="flex-row items-center gap-3 mb-6">
              <View className="h-px flex-1 bg-accent-rose-light" />
              <View className="w-1.5 h-1.5 rounded-full bg-accent-rose" />
              <View className="h-px flex-1 bg-accent-rose-light" />
            </View>

            <Text className="text-lg font-bold text-gray-900 mb-1">{t("rsvp")}</Text>

            {submitted ? (
              <View className="bg-white rounded-2xl p-6 items-center shadow-sm" style={{ shadowColor: "#E8B4B8", shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}>
                <CheckCircle2 size={40} color="#10B981" />
                <Text className="text-base font-semibold text-gray-900 mt-3 text-center">{t("rsvpSuccess")}</Text>
              </View>
            ) : (
              <View className="bg-white rounded-2xl p-4 shadow-sm" style={{ shadowColor: "#E8B4B8", shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}>
                {!selectedGuest ? (
                  <>
                    <Text className="text-sm text-gray-500 mb-2">{t("rsvpSearch")}</Text>
                    <TextInput
                      className="border border-gray-200 rounded-xl px-3 py-2.5 text-base text-gray-900 mb-3"
                      placeholder={t("rsvpSearch")}
                      value={rsvpSearch}
                      onChangeText={setRsvpSearch}
                      placeholderTextColor="#D0D0D8"
                    />
                    {rsvpSearch.length > 1 && (
                      <View>
                        {roster
                          .filter((g) =>
                            `${g.firstName} ${g.lastName}`.toLowerCase().includes(rsvpSearch.toLowerCase())
                          )
                          .slice(0, 6)
                          .map((g) => (
                            <Pressable
                              key={g.id}
                              onPress={() => setSelectedGuest(g)}
                              className="py-2.5 border-b border-gray-50 active:opacity-60"
                            >
                              <Text className="text-base text-gray-900">
                                {g.firstName} {g.lastName}
                              </Text>
                            </Pressable>
                          ))}
                      </View>
                    )}
                  </>
                ) : (
                  <>
                    <View className="flex-row items-center justify-between mb-4">
                      <Text className="text-base font-semibold text-gray-900">
                        {selectedGuest.firstName} {selectedGuest.lastName}
                      </Text>
                      <Pressable onPress={() => { setSelectedGuest(null); setRsvpStatus(null); setRsvpSearch(""); }}>
                        <Text className="text-sm text-gray-400">{t("rsvpSearch")}</Text>
                      </Pressable>
                    </View>

                    <Text className="text-sm text-gray-500 mb-2">{t("rsvpAttendance")}</Text>
                    <View className="flex-row gap-2 mb-4">
                      {(["ACCEPTED", "DECLINED", "MAYBE"] as const).map((s) => {
                        const labels = { ACCEPTED: t("rsvpYes"), DECLINED: t("rsvpNo"), MAYBE: t("rsvpMaybe") };
                        const colors = { ACCEPTED: "#10B981", DECLINED: "#EF4444", MAYBE: "#3B82F6" };
                        return (
                          <Pressable
                            key={s}
                            onPress={() => setRsvpStatus(s)}
                            className={`flex-1 py-2.5 rounded-xl items-center border ${rsvpStatus === s ? "border-transparent" : "border-gray-200"}`}
                            style={rsvpStatus === s ? { backgroundColor: colors[s] } : undefined}
                          >
                            <Text className={`text-sm font-semibold ${rsvpStatus === s ? "text-white" : "text-gray-500"}`}>
                              {labels[s]}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>

                    {rsvpStatus === "ACCEPTED" && (
                      <>
                        <Text className="text-sm text-gray-500 mb-2">{t("rsvpDiet")}</Text>
                        <View className="flex-row flex-wrap gap-2 mb-4">
                          {Object.entries((t("rsvpDiets", { returnObjects: true }) as Record<string, string>)).map(([key, label]) => (
                            <Pressable
                              key={key}
                              onPress={() => setRsvpDiet(key)}
                              className={`px-3 py-1.5 rounded-full border ${rsvpDiet === key ? "bg-primary-500 border-primary-500" : "border-gray-200 bg-white"}`}
                            >
                              <Text className={`text-sm ${rsvpDiet === key ? "text-white font-medium" : "text-gray-500"}`}>
                                {label}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      </>
                    )}

                    {rsvpStatus && (
                      <Pressable
                        onPress={async () => {
                          if (!rsvpStatus || submitting) return;
                          setSubmitting(true);
                          const serverUrl = process.env.EXPO_PUBLIC_SYNC_URL;
                          if (!serverUrl) { setSubmitting(false); return; }
                          const ok = await submitRsvp(serverUrl, id!, {
                            rsvpToken: selectedGuest.rsvpToken,
                            rsvpStatus,
                            diet: rsvpStatus === "ACCEPTED" ? rsvpDiet : undefined,
                            submittedAt: new Date().toISOString(),
                          });
                          setSubmitting(false);
                          if (ok) setSubmitted(true);
                        }}
                        className="bg-primary-500 rounded-xl py-3 items-center active:bg-primary-600"
                      >
                        <Text className="text-white font-semibold text-base">
                          {submitting ? "..." : t("rsvpSubmit")}
                        </Text>
                      </Pressable>
                    )}
                  </>
                )}
              </View>
            )}
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
