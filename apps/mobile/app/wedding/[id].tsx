import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, Text, ScrollView, ActivityIndicator, Image, Pressable } from "react-native-css/components";
import { Platform, Linking } from "react-native";
import { useLocalSearchParams, Redirect, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { Clock, MapPin, HelpCircle, Calendar, Globe, CheckCircle2, Gift, ExternalLink, Download } from "lucide-react-native";
import { safeFormat, getDateLocale } from "@/i18n/dateFnsLocale";
import { type PublicWeddingPage } from "@/lib/public-page";
import { printPublicSchedule } from "@/lib/print-schedule";
import { type RsvpSubmission } from "@/lib/rsvp-sync";
import { resolveServerUrl } from "@/lib/server";
import {
  decodeNodeInviteLink,
  readNodeWithLinkCap,
  writeNodeWithLinkCap,
  getSyncNamespace,
  DEFAULT_SYNC_NAMESPACE,
  type NodeInviteLinkToken,
} from "@fiance/sdk";

/**
 * Sync namespace: sourced from configureFiance() at boot; DEFAULT_SYNC_NAMESPACE
 * is the fallback. getSyncNamespace() throws (not returns undefined) before
 * configureFiance() has run, so the fallback needs a try/catch to actually apply.
 */
function syncNamespace(): string {
  try {
    return getSyncNamespace() ?? DEFAULT_SYNC_NAMESPACE;
  } catch {
    return DEFAULT_SYNC_NAMESPACE;
  }
}
import { decodeGuestLink } from "@/lib/guest-link";
import { TimelineItem } from "@/components/TimelineItem";
import { Display } from "@/components/Display";
import { Label } from "@/components/Label";
import { Script } from "@/components/Script";
import { Sprig } from "@/components/Sprig";
import { ScriptButton } from "@/components/ScriptButton";
import { Seo } from "@/components/Seo";
import { BASE_URL } from "@/lib/seo-urls";

function weddingSeoTitle(page: PublicWeddingPage, t: (key: string, opts?: Record<string, string>) => string): string {
  const names = [page.about.partner1Name, page.about.partner2Name].filter(Boolean).join(" & ");
  return names ? t("seo:weddingOf", { names }) : "Fiancé";
}

function weddingSeoDescription(page: PublicWeddingPage, t: (key: string) => string): string {
  return page.about.description || t("seo:defaultDescription");
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
      <Text className="text-xs font-medium text-mute uppercase tracking-wide">
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
  const [notPublished, setNotPublished] = useState(false);
  // v3 RSVP state — populated when `id` is a combined guest link.
  const [isGuestLink, setIsGuestLink] = useState(false);
  const [rsvpToken, setRsvpToken] = useState<NodeInviteLinkToken | null>(null);
  const [rsvpSeed, setRsvpSeed] = useState<RsvpSubmission | null>(null);
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
    (async () => {
      try {
        const serverUrl = resolveServerUrl();
        if (!serverUrl) { setError(true); return; }
        const baseUrl = serverUrl.replace(/\/v1\/?$/, "");

        // Decode first, separately from the network calls below — a decode failure means the
        // link itself is malformed, the one case that should show "invalid link".
        let combined: ReturnType<typeof decodeGuestLink> = null;
        let pageToken: NodeInviteLinkToken | null = null;
        try {
          combined = decodeGuestLink(id);
          if (!combined) pageToken = decodeNodeInviteLink(id);
        } catch {
          setError(true);
          return;
        }

        try {
          if (combined) {
            setIsGuestLink(true);
            // readNodeWithLinkCap returns the already-unwrapped content (json.data), not {data}.
            const result = await readNodeWithLinkCap(combined.page, { baseUrl, namespace: syncNamespace() }) as PublicWeddingPage | null;
            if (!result) { setNotPublished(true); return; }
            setPage(result);
            // Read rsvp node to get seed data (guest name, companion info) — best-effort, a
            // failure here must not undo the page content that already loaded above.
            try {
              const rsvpResult = await readNodeWithLinkCap(combined.rsvp, { baseUrl, namespace: syncNamespace() }) as RsvpSubmission | null;
              if (rsvpResult?.guestId) setRsvpSeed(rsvpResult);
            } catch { /* rsvp seed is optional, page still renders */ }
            setRsvpToken(combined.rsvp);
          } else if (pageToken) {
            const result = await readNodeWithLinkCap(pageToken, { baseUrl, namespace: syncNamespace() }) as PublicWeddingPage | null;
            if (result) {
              setPage(result);
            } else {
              setNotPublished(true);
            }
          }
        } catch {
          // The link decoded fine, so the wedding/space likely exists — a fetch/server failure
          // here reads as "details not available yet", not "invalid link" (reserved for decode
          // failures above).
          setNotPublished(true);
        }
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
  const publicGifts = (page?.gifts ?? []).filter((g) => !g.claimed);
  const events = page?.events ?? [];

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
        <Text className="text-sm text-mute mt-2">{t("loading")}</Text>
      </View>
    );
  }

  if (notPublished) {
    return (
      <View className="flex-1 bg-accent-cream items-center justify-center px-6">
        <Stack.Screen options={{ headerShown: false }} />
        <Image
          source={require("@/assets/icon.png")}
          style={{ width: 64, height: 64, borderRadius: 16, opacity: 0.4 }}
          resizeMode="contain"
        />
        <Text className="text-base text-mute text-center mt-4">{t("notPublished")}</Text>
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
        <Text className="text-base text-mute text-center mt-4">{t("error")}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-accent-cream">
      <Stack.Screen options={{ headerShown: false }} />
      <Seo
        title={weddingSeoTitle(page, t)}
        description={weddingSeoDescription(page, t)}
        canonical={isGuestLink ? undefined : `${BASE_URL}/wedding/${id}`}
        ogTitle={weddingSeoTitle(page, t)}
        ogDescription={weddingSeoDescription(page, t)}
        noindex={isGuestLink}
      />
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
            <View className="items-center mt-5" style={{ overflow: "visible" }}>
              <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 4 }}>
                <View style={{ transform: [{ rotate: "-18deg" }], marginRight: 8, marginTop: 4, opacity: 0.7 }}>
                  <Sprig size={16} color="#c9922f" angle={0} />
                </View>
                <Label size={10} color="#c9922f">
                  {t("withJoy")}
                </Label>
                <View style={{ transform: [{ rotate: "18deg" }, { scaleX: -1 }], marginLeft: 8, marginTop: 4, opacity: 0.7 }}>
                  <Sprig size={16} color="#c9922f" angle={0} />
                </View>
              </View>
              <Display as="h1" size={36} italic style={{ textAlign: "center" }}>
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
              <Text className="text-sm text-mute">{about?.venueName}</Text>
            </View>
          )}

          {about?.description && (
            <View className="mt-5 bg-white/60 rounded-2xl px-5 py-4 max-w-md">
              <Text className="text-sm text-mute text-center leading-5 italic">
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

        {/* Events (v2: multi-venue/day) */}
        {events.length > 0 && (
          <View className="mt-2 pb-4 px-5">
            <View className="flex-row items-center gap-2 mb-4">
              <MapPin size={18} color="#C9956B" />
              <Display size={20} italic>{t("events")}</Display>
            </View>
            {events.map((e) => (
              <View key={e.id} className="bg-accent-card rounded-2xl p-4 mb-3 shadow-sm" style={{ shadowColor: "#b96a4a", shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
                <Text className="text-base font-semibold text-ink">{e.title}</Text>
                <Text className="text-xs text-mute mt-0.5">
                  {safeFormat(new Date(e.date), "EEEE d MMMM", { locale: getDateLocale() })}
                  {e.time ? ` · ${e.time}` : ""}
                </Text>
                {e.venueName && (
                  <View className="flex-row items-center gap-1.5 mt-2">
                    <MapPin size={12} color="#C9956B" />
                    <Text className="text-xs text-accent-gold font-medium">
                      {e.venueName}{e.address ? ` — ${e.address}` : ""}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

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
                        <Text className="text-base font-semibold text-ink">
                          {item.title}
                        </Text>
                        {item.endTime && (
                          <Text className="text-xs text-mute mt-0.5">
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
            <Text className="text-sm text-mute text-center mt-3">{t("noTimeline")}</Text>
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
                <Text className="text-base font-semibold text-ink">
                  {item.question}
                </Text>
                <Text className="text-sm text-mute mt-1.5 leading-5">
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
                    <Text className="text-base font-semibold text-ink">{gift.title}</Text>
                    {gift.description && (
                      <Text className="text-sm text-mute mt-1 leading-5">{gift.description}</Text>
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

        {/* RSVP — only shown for per-guest combined links */}
        {rsvpToken && (
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
                {rsvpSeed?.firstName && (
                  <Text className="text-sm text-mute mt-1 text-center">
                    {rsvpSeed.firstName} {rsvpSeed.lastName}
                  </Text>
                )}
              </View>
            ) : (
              <View className="bg-accent-card rounded-2xl p-4 shadow-sm" style={{ shadowColor: "#b96a4a", shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}>
                {rsvpSeed?.firstName && (
                  <Text className="text-base font-semibold text-ink mb-4">
                    {rsvpSeed.firstName} {rsvpSeed.lastName}
                  </Text>
                )}

                <Text className="text-sm text-mute mb-2">{t("rsvpAttendance")}</Text>
                <View className="flex-row gap-2 mb-4">
                  {(["ACCEPTED", "DECLINED", "MAYBE"] as const).map((s) => {
                    const labels = { ACCEPTED: t("rsvpYes"), DECLINED: t("rsvpNo"), MAYBE: t("rsvpMaybe") };
                    const colors = { ACCEPTED: "#10B981", DECLINED: "#EF4444", MAYBE: "#3B82F6" };
                    return (
                      <Pressable
                        key={s}
                        onPress={() => setRsvpStatus(s)}
                        className={`flex-1 py-2.5 rounded-xl items-center border ${rsvpStatus === s ? "border-transparent" : "border-hair"}`}
                        style={rsvpStatus === s ? { backgroundColor: colors[s] } : undefined}
                      >
                        <Text className={`text-sm font-semibold ${rsvpStatus === s ? "text-white" : "text-mute"}`}>
                          {labels[s]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {rsvpStatus === "ACCEPTED" && (
                  <>
                    <Text className="text-sm text-mute mb-2">{t("rsvpDiet")}</Text>
                    <View className="flex-row flex-wrap gap-2 mb-4">
                      {Object.entries((t("rsvpDiets", { returnObjects: true }) as Record<string, string>)).map(([key, label]) => (
                        <Pressable
                          key={key}
                          onPress={() => setRsvpDiet(key)}
                          className={`px-3 py-1.5 rounded-full border ${rsvpDiet === key ? "bg-primary-500 border-primary-500" : "border-hair bg-white"}`}
                        >
                          <Text className={`text-sm ${rsvpDiet === key ? "text-white font-medium" : "text-mute"}`}>
                            {label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>

                    {/* +1 companion */}
                    {rsvpSeed?.companionGuestId && rsvpSeed.companionFirstName && (
                      <>
                        <View className="h-px bg-accent-paper mb-4" />
                        <Text className="text-sm font-semibold text-ink mb-1">
                          {t("plusOneLabel", { name: `${rsvpSeed.companionFirstName} ${rsvpSeed.companionLastName ?? ""}`.trim() })}
                        </Text>
                        <Text className="text-sm text-mute mb-2">{t("plusOneAttendance")}</Text>
                        <View className="flex-row gap-2 mb-4">
                          {(["ACCEPTED", "DECLINED"] as const).map((s) => {
                            const labels = { ACCEPTED: t("rsvpYes"), DECLINED: t("rsvpNo") };
                            const colors = { ACCEPTED: "#10B981", DECLINED: "#EF4444" };
                            return (
                              <Pressable
                                key={s}
                                onPress={() => setPlusOneStatus(s)}
                                className={`flex-1 py-2.5 rounded-xl items-center border ${plusOneStatus === s ? "border-transparent" : "border-hair"}`}
                                style={plusOneStatus === s ? { backgroundColor: colors[s] } : undefined}
                              >
                                <Text className={`text-sm font-semibold ${plusOneStatus === s ? "text-white" : "text-mute"}`}>
                                  {labels[s]}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>
                        {plusOneStatus === "ACCEPTED" && (
                          <>
                            <Text className="text-sm text-mute mb-2">{t("plusOneDiet")}</Text>
                            <View className="flex-row flex-wrap gap-2 mb-4">
                              {Object.entries((t("rsvpDiets", { returnObjects: true }) as Record<string, string>)).map(([key, label]) => (
                                <Pressable
                                  key={key}
                                  onPress={() => setPlusOneDiet(key)}
                                  className={`px-3 py-1.5 rounded-full border ${plusOneDiet === key ? "bg-primary-500 border-primary-500" : "border-hair bg-white"}`}
                                >
                                  <Text className={`text-sm ${plusOneDiet === key ? "text-white font-medium" : "text-mute"}`}>
                                    {label}
                                  </Text>
                                </Pressable>
                              ))}
                            </View>
                          </>
                        )}
                      </>
                    )}

                    {/* Children count */}
                    <View className="h-px bg-accent-paper mb-4" />
                    <Text className="text-sm text-mute mb-2">{t("childrenLabel")}</Text>
                    <View className="flex-row items-center gap-3 mb-4">
                      <Pressable
                        onPress={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                        className="w-9 h-9 rounded-full bg-accent-paper items-center justify-center"
                      >
                        <Text className="text-lg text-mute">−</Text>
                      </Pressable>
                      <Text className="text-base font-semibold text-ink w-6 text-center">{childrenCount}</Text>
                      <Pressable
                        onPress={() => setChildrenCount(childrenCount + 1)}
                        className="w-9 h-9 rounded-full bg-accent-paper items-center justify-center"
                      >
                        <Text className="text-lg text-mute">+</Text>
                      </Pressable>
                    </View>
                  </>
                )}

                {rsvpStatus && (
                  <>
                    <ScriptButton
                      disabled={submitting}
                      onPress={async () => {
                        if (!rsvpStatus || submitting || !rsvpToken) return;
                        setSubmitting(true);
                        const submission: RsvpSubmission = {
                          guestId: rsvpSeed?.guestId ?? rsvpToken.nodeId,
                          rsvpStatus,
                          diet: rsvpStatus === "ACCEPTED" ? rsvpDiet : undefined,
                          plusOneGuestId: rsvpStatus === "ACCEPTED" && plusOneStatus ? (rsvpSeed?.companionGuestId ?? null) : null,
                          plusOneRsvpStatus: rsvpStatus === "ACCEPTED" && plusOneStatus ? plusOneStatus : undefined,
                          plusOneDiet: rsvpStatus === "ACCEPTED" && plusOneStatus === "ACCEPTED" ? plusOneDiet : undefined,
                          childrenCount: rsvpStatus === "ACCEPTED" ? childrenCount : undefined,
                          submittedAt: new Date().toISOString(),
                        };
                        let ok = false;
                        const serverUrl = resolveServerUrl();
                        if (serverUrl) {
                          try {
                            const baseUrl = serverUrl.replace(/\/v1\/?$/, "");
                            await writeNodeWithLinkCap(rsvpToken, submission as unknown as Record<string, unknown>, { baseUrl, namespace: syncNamespace() });
                            ok = true;
                          } catch { ok = false; }
                        }
                        setSubmitting(false);
                        if (ok) {
                          setSubmitted(true);
                          setSubmitError(false);
                        } else {
                          setSubmitError(true);
                        }
                      }}
                      style={{ opacity: submitting ? 0.5 : 1 }}
                    >
                      {submitting ? "..." : t("rsvpSubmit")}
                    </ScriptButton>
                    {submitError && (
                      <Text className="text-sm text-red-500 text-center mt-2">{t("rsvpError")}</Text>
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
          <Text className="text-xs text-mute mt-1">Fiancé</Text>
        </View>
        </View>
      </ScrollView>
    </View>
  );
}

export async function generateStaticParams() { return []; }
