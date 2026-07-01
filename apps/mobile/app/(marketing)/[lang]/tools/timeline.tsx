import React, { useState } from "react";
import { Platform } from "react-native";
import { View, Text, Pressable, TextInput } from "react-native-css/components";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, ArrowLeft, ArrowUp, ArrowDown, Download, RotateCcw } from "lucide-react-native";
import { Seo } from "@/components/Seo";
import { exportToPdf } from "@fiance/ui/utils/file-export";
import { localizedSeo, localizedUrl, localizedPath } from "@/lib/seo-urls";
import { theme as GP } from "@/lib/theme";

interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  location: string;
  notes: string;
}

const DOTS = [GP.clay, GP.mustard, GP.olive, GP.blue, "#a3502f", "#8ea36f", "#d9a441", "#7d9bb3"];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function EventCard({
  event,
  index,
  total,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  event: TimelineEvent;
  index: number;
  total: number;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const dot = DOTS[index % DOTS.length];
  return (
    <View className="flex-row gap-3">
      {/* Timeline dot + connector */}
      <View className="items-center" style={{ width: 14 }}>
        <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: dot, marginTop: 6, shadowColor: dot, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 1 }} />
        {index < total - 1 && <View style={{ flex: 1, width: 2, backgroundColor: "rgba(42,36,24,0.1)", marginTop: 4, marginBottom: 4 }} />}
      </View>
      {/* Card */}
      <View className="flex-1 bg-white rounded-2xl p-4 border border-accent-rose-light mb-4">
        <View className="flex-row items-start justify-between gap-2">
          <View className="flex-1">
            <Text style={{ fontFamily: "Fraunces_700Bold", fontSize: 15, color: GP.clay, marginBottom: 2 }}>{event.time}</Text>
            <Text className="text-base font-semibold text-typography-900">{event.title}</Text>
            {event.location ? (
              <Text className="text-sm text-typography-500 mt-0.5">{event.location}</Text>
            ) : null}
            {event.notes ? (
              <Text className="text-xs text-typography-400 mt-1 leading-4">{event.notes}</Text>
            ) : null}
          </View>
          <View className="flex-row gap-1">
            {index > 0 && (
              <Pressable onPress={onMoveUp} className="p-1 active:opacity-60">
                <ArrowUp size={14} className="text-typography-400" />
              </Pressable>
            )}
            {index < total - 1 && (
              <Pressable onPress={onMoveDown} className="p-1 active:opacity-60">
                <ArrowDown size={14} className="text-typography-400" />
              </Pressable>
            )}
            <Pressable onPress={onDelete} className="p-1 active:opacity-60">
              <Trash2 size={14} className="text-typography-400" />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function TimelineTool() {
  const { t, i18n } = useTranslation("marketing");
  const router = useRouter();
  const lang = i18n.language === "en" ? "en" : "fr";
  const seo = localizedSeo(lang, "/tools/timeline");

  const templateTimes: Record<string, string> = {
    gettingReady: "08:00",
    groomReady: "10:00",
    guestsArrive: "14:00",
    ceremony: "14:30",
    cocktail: "15:30",
    dinner: "19:00",
    firstDance: "21:00",
    cake: "22:00",
    party: "22:30",
    end: "02:00",
  };

  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [newTime, setNewTime] = useState("12:00");
  const [newTitle, setNewTitle] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newNotes, setNewNotes] = useState("");

  function addEvent() {
    const title = newTitle.trim();
    if (!title) return;
    setEvents((prev) => [
      ...prev,
      { id: uid(), time: newTime, title, location: newLocation.trim(), notes: newNotes.trim() },
    ]);
    setNewTitle("");
    setNewLocation("");
    setNewNotes("");
  }

  function deleteEvent(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  function moveUp(index: number) {
    if (index === 0) return;
    setEvents((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }

  function moveDown(index: number) {
    setEvents((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }

  function useTemplate() {
    const templateKeys = Object.keys(templateTimes);
    setEvents(
      templateKeys.map((key) => ({
        id: uid(),
        time: templateTimes[key],
        title: t(`tools.timeline.templateEvents.${key}`),
        location: "",
        notes: "",
      }))
    );
  }

  async function handleExport() {
    const lines = [
      `${t("tools.timeline.pdfTitle")}\n`,
      ...events.map((e) => {
        const parts = [`${e.time}  ${e.title}`];
        if (e.location) parts.push(`        📍 ${e.location}`);
        if (e.notes) parts.push(`        ${e.notes}`);
        return parts.join("\n");
      }),
    ];
    const content = lines.join("\n\n");
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;padding:40px 60px;line-height:1.7;color:#1a1a1a}pre{font-family:inherit;white-space:pre-wrap;margin:0}</style></head><body><pre>${content}</pre></body></html>`;
    await exportToPdf(html, t("tools.timeline.pdfFilename"));
  }

  return (
    <View className="w-full">
      <Seo
        title={t("tools.timeline.meta.title")}
        description={t("tools.timeline.meta.description")}
        {...seo}
        jsonLd={[
          { "@type": "WebApplication", name: t("tools.timeline.meta.title"),
            url: seo.canonical,
            applicationCategory: "UtilityApplication",
            offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" } },
          { "@type": "BreadcrumbList", itemListElement: [
            { "@type": "ListItem", position: 1, name: "Fiancé", item: localizedUrl(lang, "/") },
            { "@type": "ListItem", position: 2, name: t("tools.timeline.meta.title"), item: seo.canonical },
          ]},
        ]}
      />
      {/* Header */}
      <View className="w-full py-12 px-6 bg-accent-cream">
        <View style={{ maxWidth: 900, width: "100%", alignSelf: "center" }}>
          <Pressable
            onPress={() => router.push(localizedPath(lang, "/") as any)}
            className="flex-row items-center gap-1 mb-6 active:opacity-60"
          >
            <ArrowLeft size={14} className="text-typography-500" />
            <Text className="text-sm text-typography-500">{t("tools.backToTools")}</Text>
          </Pressable>
          <Text className="text-3xl font-bold text-typography-900 mb-2">
            {t("tools.timeline.title")}
          </Text>
          <Text className="text-base text-typography-500">{t("tools.timeline.subtitle")}</Text>
        </View>
      </View>

      {/* Tool body */}
      <View className="w-full py-8 px-6 bg-white">
        <View
          className="flex-row flex-wrap"
          style={{ maxWidth: 900, width: "100%", alignSelf: "center", gap: 24, alignItems: "flex-start" }}
        >
          {/* Aside — add moment + export/template */}
          <View
            style={[
              { flexBasis: 300, flexGrow: 1, maxWidth: 330 },
              Platform.OS === "web" ? ({ position: "sticky", top: 88 } as any) : null,
            ]}
          >
            <View className="bg-accent-cream rounded-2xl p-5">
              <Text className="text-lg font-semibold text-typography-900 mb-4">{t("tools.timeline.addEvent")}</Text>
              <View className="gap-3">
                <View style={{ width: 110 }}>
                  <Text className="text-xs text-typography-500 mb-1">{t("tools.timeline.eventTime")}</Text>
                  <TextInput
                    value={newTime}
                    onChangeText={setNewTime}
                    placeholder="14:30"
                    className="bg-white rounded-xl px-3 py-2.5 text-sm text-typography-900 border border-accent-rose-light"
                  />
                </View>
                <View>
                  <Text className="text-xs text-typography-500 mb-1">{t("tools.timeline.eventTitle")}</Text>
                  <TextInput
                    value={newTitle}
                    onChangeText={setNewTitle}
                    placeholder={t("tools.timeline.eventTitle")}
                    className="bg-white rounded-xl px-3 py-2.5 text-sm text-typography-900 border border-accent-rose-light"
                  />
                </View>
                <View>
                  <Text className="text-xs text-typography-500 mb-1">{t("tools.timeline.eventLocation")}</Text>
                  <TextInput
                    value={newLocation}
                    onChangeText={setNewLocation}
                    placeholder={t("tools.timeline.eventLocation")}
                    className="bg-white rounded-xl px-3 py-2.5 text-sm text-typography-900 border border-accent-rose-light"
                  />
                </View>
                <View>
                  <Text className="text-xs text-typography-500 mb-1">{t("tools.timeline.eventNotes")}</Text>
                  <TextInput
                    value={newNotes}
                    onChangeText={setNewNotes}
                    placeholder={t("tools.timeline.eventNotes")}
                    className="bg-white rounded-xl px-3 py-2.5 text-sm text-typography-900 border border-accent-rose-light"
                  />
                </View>
                <Pressable
                  onPress={addEvent}
                  className="bg-primary-500 rounded-full py-3 flex-row items-center justify-center gap-1.5 active:opacity-70"
                >
                  <Plus size={14} className="text-white" />
                  <Text className="text-sm font-semibold text-white">{t("tools.timeline.addEvent")}</Text>
                </Pressable>
              </View>

              <View className="h-px bg-accent-rose-light" style={{ marginVertical: 18 }} />

              <View className="flex-row gap-2">
                <Pressable
                  onPress={handleExport}
                  disabled={events.length === 0}
                  className="flex-1 flex-row items-center justify-center gap-1.5 bg-white rounded-full py-2.5 border border-accent-rose-light active:opacity-70"
                  style={events.length === 0 ? { opacity: 0.5 } : undefined}
                >
                  <Download size={13} className="text-typography-600" />
                  <Text className="text-xs font-semibold text-typography-700">{t("tools.timeline.exportPdf")}</Text>
                </Pressable>
                <Pressable
                  onPress={useTemplate}
                  className="flex-1 flex-row items-center justify-center gap-1.5 bg-white rounded-full py-2.5 border border-accent-rose-light active:opacity-70"
                >
                  <RotateCcw size={13} className="text-typography-600" />
                  <Text className="text-xs font-semibold text-typography-700">{t("tools.timeline.useTemplate")}</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Timeline preview */}
          <View style={{ flexGrow: 2, flexBasis: 400, minWidth: 280 }}>
            {events.length === 0 ? (
              <View className="bg-accent-cream rounded-2xl p-10 items-center border border-accent-rose-light">
                <Text className="text-sm text-typography-400 text-center">{t("tools.timeline.noEvents")}</Text>
              </View>
            ) : (
              <View>
                {events.map((event, index) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    index={index}
                    total={events.length}
                    onDelete={() => deleteEvent(event.id)}
                    onMoveUp={() => moveUp(index)}
                    onMoveDown={() => moveDown(index)}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </View>

      {/* App CTA */}
      <View className="w-full py-12 px-6 bg-accent-blush items-center">
        <View style={{ maxWidth: 600, width: "100%", alignItems: "center" }}>
          <Text className="text-xl font-bold text-typography-900 text-center mb-2">
            {t("tools.appCta.title")}
          </Text>
          <Text className="text-sm text-typography-500 text-center mb-5">
            {t("tools.appCta.description")}
          </Text>
          <Pressable
            onPress={() => router.push("/home" as any)}
            className="bg-primary-500 px-8 py-3 rounded-full active:opacity-70"
          >
            <Text className="text-sm font-semibold text-white">{t("tools.appCta.cta")}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
