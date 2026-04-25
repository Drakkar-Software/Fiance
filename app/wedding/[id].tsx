import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, Text, ScrollView, ActivityIndicator, Image, Pressable, TextInput } from "react-native-css/components";
import { Platform, Linking } from "react-native";
import { useLocalSearchParams, Redirect, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { Clock, MapPin, HelpCircle, Calendar, Globe, CheckCircle2, Gift, ExternalLink, Download, Camera } from "lucide-react-native";
import { safeFormat, getDateLocale } from "@/i18n/dateFnsLocale";
import { fetchPublicPage, type PublicWeddingPage } from "@/lib/public-page";
import { printPublicSchedule } from "@/lib/print-schedule";
import { fetchRsvpRoster, submitRsvp, type RsvpRosterEntry } from "@/lib/rsvp-sync";
import { resolveServerUrl } from "@/lib/server";
import { TimelineItem } from "@/components/TimelineItem";
import { Display } from "@/components/Display";
import { Label } from "@/components/Label";
import { Script } from "@/components/Script";

function setOgMeta(page: PublicWeddingPage, t: (key: string, opts?: Record<string, string>) => string) {
  if (Platform.OS !== "web") return;
  const names = [page.about.partner1Name, page.about.partner2Name].filter(Boolean).join(" & ");
  const title = names ? t("seo:weddingOf", { names }) : "Fiancé";
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
      className="flex-row items-center gap-1.5 self-end px-3 py-1.5 rounded-full bg-white/60 mr-4 mt-3"
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
  const { id, token } = useLocalSearchParams<{ id: string; token?: string }>();
  const [page, setPage] = useState<PublicWeddingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [roster, setRoster] = useState<RsvpRosterEntry[] | null>(null);
  const [rsvpSearch, setRsvpSearch] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<RsvpRosterEntry | null>(null);
  const [rsvpStatus, setRsvpStatus] = useState<"ACCEPTED" | "DECLINED" | "MAYBE" | null>(null);
  const [rsvpDiet, setRsvpDiet] = useState("STANDARD");
  const [plusOneStatus, setPlusOneStatus] = useState<"ACCEPTED" | "DECLINED" | null>(null);
  const [plusOneDiet, setPlusOneDiet] = useState("STANDARD");
  const [childrenCount, setChildrenCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  useEffect(() => {
    if (!id) return;
    const serverUrl = resolveServerUrl();
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
        if (rosterData?.guests) {
          setRoster(rosterData.guests);
          if (token) {
            const match = rosterData.guests.find((g) => g.rsvpToken === token);
            if (match) setSelectedGuest(match);
          }
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, token]);

  const about = page?.about;
  const timeline = page?.timeline ?? [];
  const faq = page?.faq ?? [];
  const publicGifts = (page?.gifts ?? []).filter((g) => !g.claimed);

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

  const handlePrintSchedule = useCallback(() =>
    printPublicSchedule(timeline, about ?? {}, {
      scheduleOf: t("scheduleOf"),
      until: (time: string) => t("until", { time }),
    }),
  [timeline, about, t]);

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
        <ActivityIndicator size="small" color="#b96a4a" className="mt-4" />
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
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems: "center" }}>
        <View className="w-full" style={{ maxWidth: 600 }}>
        <LangSwitch />
        {/* Hero */}
        <View className="items-center pt-8 pb-10 px-6">
          <Image
            source={require("@/assets/icon.png")}
            style={{ width: 72, height: 72, borderRadius: 18 }}
            resizeMode="contain"
          />

          {coupleNames ? (
            <View className="items-center mt-5">
              <Label size={10} color="#c9922f" style={{ marginBottom: 8 }}>
                {t("weddingOf")}
              </Label>
              <Display size={36} italic style={{ textAlign: "center" }}>
                {coupleNames}
              </Display>
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
              <Display size={20} italic style={{ flex: 1 }}>
                {t("timeline")}
              </Display>
              <Pressable
                onPress={handlePrintSchedule}
                className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 active:opacity-70"
              >
                <Download size={13} color="#C9956B" />
                <Text className="text-xs font-medium text-accent-gold">
                  {t("printSchedule")}
                </Text>
              </Pressable>
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
                        <Display size={14} weight="500" color="#c9922f" style={{ marginTop: 14 }}>
                          {item.time}
                        </Display>
                      }
                      showConnector={idx < dateItems.length - 1}
                    >
                      <View className="bg-accent-card rounded-2xl p-4 mb-3 shadow-sm" style={{ shadowColor: "#b96a4a", shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
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
              <Display size={20} italic>
                {t("faq")}
              </Display>
            </View>

            {faq.map((item, index) => (
              <View
                key={index}
                className="bg-accent-card rounded-2xl p-4 mb-3 shadow-sm"
                style={{ shadowColor: "#b96a4a", shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}
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

        {/* Gift registry */}
        {publicGifts.length > 0 && (
          <View className="mt-4 px-4 pb-6">
            <View className="flex-row items-center gap-3 mb-6">
              <View className="h-px flex-1 bg-accent-rose-light" />
              <View className="w-1.5 h-1.5 rounded-full bg-accent-rose" />
              <View className="h-px flex-1 bg-accent-rose-light" />
            </View>

            <View className="flex-row items-center gap-2 px-1 mb-4">
              <Gift size={18} color="#C9956B" />
              <Display size={20} italic>
                {t("giftRegistry")}
              </Display>
            </View>

            {publicGifts.map((gift) => (
              <Pressable
                key={gift.id}
                onPress={gift.url ? () => Linking.openURL(gift.url!) : undefined}
                className="bg-accent-card rounded-2xl p-4 mb-3 shadow-sm"
                style={{ shadowColor: "#b96a4a", shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">{gift.title}</Text>
                    {gift.description && (
                      <Text className="text-sm text-gray-500 mt-1 leading-5">{gift.description}</Text>
                    )}
                    {gift.price != null && (
                      <Text className="text-sm font-medium text-accent-gold mt-1.5">{gift.price} €</Text>
                    )}
                  </View>
                  {gift.url && (
                    <View className="ml-3 mt-0.5">
                      <ExternalLink size={16} color="#C9956B" />
                    </View>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* RSVP — only shown when guest is pre-selected via token */}
        {roster && roster.length > 0 && selectedGuest && (
          <View className="mt-4 px-4 pb-6">
            <View className="flex-row items-center gap-3 mb-6">
              <View className="h-px flex-1 bg-accent-rose-light" />
              <View className="w-1.5 h-1.5 rounded-full bg-accent-rose" />
              <View className="h-px flex-1 bg-accent-rose-light" />
            </View>

            <View className="flex-row items-center gap-2 px-1 mb-4">
              <Calendar size={18} color="#C9956B" />
              <Display size={20} italic>{t("rsvp")}</Display>
            </View>

            {submitted ? (
              <View className="bg-accent-card rounded-2xl p-6 items-center shadow-sm" style={{ shadowColor: "#b96a4a", shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}>
                <View className="w-16 h-16 rounded-full bg-green-50 items-center justify-center mb-3">
                  <CheckCircle2 size={40} color="#10B981" />
                </View>
                <Display size={20} italic style={{ textAlign: "center" }}>{t("rsvpSuccess")}</Display>
                <Text className="text-sm text-gray-400 mt-1 text-center">
                  {selectedGuest?.firstName} {selectedGuest?.lastName}
                </Text>
              </View>
            ) : (
              <View className="bg-accent-card rounded-2xl p-4 shadow-sm" style={{ shadowColor: "#b96a4a", shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}>
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
                      {!(token && selectedGuest.rsvpToken === token) && (
                        <Pressable onPress={() => { setSelectedGuest(null); setRsvpStatus(null); setRsvpSearch(""); }}>
                          <Text className="text-sm text-gray-400">{t("rsvpChange")}</Text>
                        </Pressable>
                      )}
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

                        {/* +1 companion */}
                        {(() => {
                          const companion = selectedGuest.companionId
                            ? roster?.find((g) => g.id === selectedGuest.companionId)
                            : null;
                          if (!companion) return null;
                          return (
                            <>
                              <View className="h-px bg-gray-100 mb-4" />
                              <Text className="text-sm font-semibold text-gray-900 mb-1">
                                {t("plusOneLabel", { name: `${companion.firstName} ${companion.lastName}` })}
                              </Text>
                              <Text className="text-sm text-gray-500 mb-2">{t("plusOneAttendance")}</Text>
                              <View className="flex-row gap-2 mb-4">
                                {(["ACCEPTED", "DECLINED"] as const).map((s) => {
                                  const labels = { ACCEPTED: t("rsvpYes"), DECLINED: t("rsvpNo") };
                                  const colors = { ACCEPTED: "#10B981", DECLINED: "#EF4444" };
                                  return (
                                    <Pressable
                                      key={s}
                                      onPress={() => setPlusOneStatus(s)}
                                      className={`flex-1 py-2.5 rounded-xl items-center border ${plusOneStatus === s ? "border-transparent" : "border-gray-200"}`}
                                      style={plusOneStatus === s ? { backgroundColor: colors[s] } : undefined}
                                    >
                                      <Text className={`text-sm font-semibold ${plusOneStatus === s ? "text-white" : "text-gray-500"}`}>
                                        {labels[s]}
                                      </Text>
                                    </Pressable>
                                  );
                                })}
                              </View>
                              {plusOneStatus === "ACCEPTED" && (
                                <>
                                  <Text className="text-sm text-gray-500 mb-2">{t("plusOneDiet")}</Text>
                                  <View className="flex-row flex-wrap gap-2 mb-4">
                                    {Object.entries((t("rsvpDiets", { returnObjects: true }) as Record<string, string>)).map(([key, label]) => (
                                      <Pressable
                                        key={key}
                                        onPress={() => setPlusOneDiet(key)}
                                        className={`px-3 py-1.5 rounded-full border ${plusOneDiet === key ? "bg-primary-500 border-primary-500" : "border-gray-200 bg-white"}`}
                                      >
                                        <Text className={`text-sm ${plusOneDiet === key ? "text-white font-medium" : "text-gray-500"}`}>
                                          {label}
                                        </Text>
                                      </Pressable>
                                    ))}
                                  </View>
                                </>
                              )}
                            </>
                          );
                        })()}

                        {/* Children count */}
                        <View className="h-px bg-gray-100 mb-4" />
                        <Text className="text-sm text-gray-500 mb-2">{t("childrenLabel")}</Text>
                        <View className="flex-row items-center gap-3 mb-4">
                          <Pressable
                            onPress={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                            className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
                          >
                            <Text className="text-lg text-gray-500">−</Text>
                          </Pressable>
                          <Text className="text-base font-semibold text-gray-900 w-6 text-center">{childrenCount}</Text>
                          <Pressable
                            onPress={() => setChildrenCount(childrenCount + 1)}
                            className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
                          >
                            <Text className="text-lg text-gray-500">+</Text>
                          </Pressable>
                        </View>
                      </>
                    )}

                    {rsvpStatus && (
                      <>
                        <Pressable
                          onPress={async () => {
                            if (!rsvpStatus || submitting) return;
                            setSubmitting(true);
                            const serverUrl = resolveServerUrl();
                            if (!serverUrl) { setSubmitting(false); return; }
                            const ok = await submitRsvp(serverUrl, id!, {
                              rsvpToken: selectedGuest.rsvpToken,
                              rsvpStatus,
                              diet: rsvpStatus === "ACCEPTED" ? rsvpDiet : undefined,
                              plusOneRsvpStatus: rsvpStatus === "ACCEPTED" && plusOneStatus ? plusOneStatus : undefined,
                              plusOneDiet: rsvpStatus === "ACCEPTED" && plusOneStatus === "ACCEPTED" ? plusOneDiet : undefined,
                              childrenCount: rsvpStatus === "ACCEPTED" ? childrenCount : undefined,
                              submittedAt: new Date().toISOString(),
                            });
                            setSubmitting(false);
                            if (ok) {
                              setSubmitted(true);
                              setSubmitError(false);
                            } else {
                              setSubmitError(true);
                            }
                          }}
                          className="bg-primary-500 rounded-xl py-3 items-center active:bg-primary-600"
                        >
                          <Text className="text-white font-semibold text-base">
                            {submitting ? "..." : t("rsvpSubmit")}
                          </Text>
                        </Pressable>
                        {submitError && (
                          <Text className="text-sm text-red-500 text-center mt-2">{t("rsvpError")}</Text>
                        )}
                      </>
                    )}
                  </>
                )}
              </View>
            )}
          </View>
        )}

        {/* Event Photos — only shown for token holders */}
        {token && (
          <View className="mt-4 px-4 pb-6">
            <View className="flex-row items-center gap-3 mb-6">
              <View className="h-px flex-1 bg-accent-rose-light" />
              <View className="w-1.5 h-1.5 rounded-full bg-accent-rose" />
              <View className="h-px flex-1 bg-accent-rose-light" />
            </View>
            <View className="flex-row items-center gap-2 px-1 mb-4">
              <Camera size={18} color="#C9956B" />
              <Display size={20} italic>
                {t("eventPhotos")}
              </Display>
            </View>
            <View
              className="bg-accent-card rounded-2xl p-6 items-center shadow-sm"
              style={{ shadowColor: "#b96a4a", shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}
            >
              <Camera size={40} color="#E8D5C0" />
              <Text className="text-sm text-gray-400 text-center mt-3 leading-5">
                {t("eventPhotosPlaceholder")}
              </Text>
            </View>
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
          <Text className="text-xs text-gray-300 mt-1">Fiancé</Text>
        </View>
        </View>
      </ScrollView>
    </View>
  );
}
