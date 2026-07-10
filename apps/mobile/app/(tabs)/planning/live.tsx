import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, Text, ScrollView, Pressable } from "react-native-css/components";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { Check, Mic2, Music2 } from "lucide-react-native";
import { resolveRunOfShow } from "@fiance/sdk";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useWeddingPartyStore } from "@/store/useWeddingPartyStore";
import { useSpeechesMusicStore } from "@/store/useSpeechesMusicStore";
import { FilterTabs } from "@/components/FilterTabs";
import { ProgressBar } from "@/components/ProgressBar";
import type { DayOfItem } from "@/db/schema";
import { useCanEditHere } from "@/lib/permissions/useCanEditHere";

function nowAsHHmm(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export default function LiveDayOfScreen() {
  const { t } = useTranslation("planning");
  const canEdit = useCanEditHere();
  const dayOfItems = usePlanningStore((s) => s.dayOfItems);
  const completeDayOfItem = usePlanningStore((s) => s.completeDayOfItem);
  const uncompleteDayOfItem = usePlanningStore((s) => s.uncompleteDayOfItem);
  const roles = useWeddingPartyStore((s) => s.weddingRoles);
  const speeches = useSpeechesMusicStore((s) => s.speeches);
  const tracks = useSpeechesMusicStore((s) => s.playlistTracks);

  const [roleFilter, setRoleFilter] = useState("");
  const [nowHHmm, setNowHHmm] = useState(nowAsHHmm());

  useEffect(() => {
    const interval = setInterval(() => setNowHHmm(nowAsHHmm()), 30000);
    return () => clearInterval(interval);
  }, []);

  const dayOfIdsWithSpeech = useMemo(
    () => new Set(speeches.filter((s) => s.dayOfItemId).map((s) => s.dayOfItemId as string)),
    [speeches]
  );
  const dayOfIdsWithTrack = useMemo(
    () => new Set(tracks.filter((t) => t.dayOfItemId).map((t) => t.dayOfItemId as string)),
    [tracks]
  );

  const filteredItems = useMemo(
    () => (roleFilter ? dayOfItems.filter((i) => i.roleId === roleFilter) : dayOfItems),
    [dayOfItems, roleFilter]
  );

  const { current, next, completedCount, total } = useMemo(
    () => resolveRunOfShow(filteredItems, nowHHmm),
    [filteredItems, nowHHmm]
  );

  const sorted = useMemo(
    () => [...filteredItems].sort((a, b) => (a.time || "").localeCompare(b.time || "")),
    [filteredItems]
  );

  const toggleComplete = useCallback(
    (item: DayOfItem) => {
      if (!canEdit) return;
      if (item.completedAt) uncompleteDayOfItem(item.id);
      else completeDayOfItem(item.id);
    },
    [canEdit, completeDayOfItem, uncompleteDayOfItem]
  );

  const nextCountdown = next ? toMinutes(next.time) - toMinutes(nowHHmm) : null;

  return (
    <View className="flex-1 bg-accent-paper">
      <Stack.Screen options={{ title: t("live.title") }} />

      {roles.length > 0 && (
        <FilterTabs
          tabs={[{ key: "", label: t("live.allRoles") }, ...roles.map((r) => ({ key: r.id, label: r.name }))]}
          activeKey={roleFilter}
          onSelect={setRoleFilter}
        />
      )}

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="mb-4">
          <ProgressBar value={completedCount} max={total} label={t("live.progress")} />
        </View>

        {current ? (
          <Pressable
            onPress={() => toggleComplete(current)}
            disabled={!canEdit}
            className="bg-primary-500 rounded-3xl p-5 mb-3 active:opacity-90"
          >
            <Text className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">{t("live.now")}</Text>
            <Text className="text-xl font-bold text-white">{current.title}</Text>
            <Text className="text-sm text-white/80 mt-1">
              {current.time}
              {current.endTime ? ` – ${current.endTime}` : ""}
              {current.location ? ` · ${current.location}` : ""}
            </Text>
            <View className="flex-row items-center mt-3 gap-1.5">
              <Check size={16} color="#FFFFFF" />
              <Text className="text-sm text-white font-medium">{t("live.markDone")}</Text>
            </View>
          </Pressable>
        ) : (
          <View className="bg-accent-card rounded-3xl p-5 mb-3 border border-hair">
            <Text className="text-sm text-mute">{total === 0 ? t("live.noItems") : t("live.allDone")}</Text>
          </View>
        )}

        {next && (
          <View className="bg-accent-card rounded-2xl p-4 mb-4 border border-hair">
            <Text className="text-xs font-semibold text-mute uppercase tracking-wider mb-1">{t("live.next")}</Text>
            <Text className="text-base font-semibold text-ink">{next.title}</Text>
            <Text className="text-xs text-mute mt-0.5">
              {next.time}
              {nextCountdown != null && nextCountdown >= 0 ? ` · ${t("live.inMinutes", { count: nextCountdown })}` : ""}
            </Text>
          </View>
        )}

        <Text className="text-xs font-semibold text-mute uppercase tracking-wider mt-2 mb-2">{t("live.fullProgram")}</Text>
        {sorted.map((item) => {
          const isCurrent = current?.id === item.id;
          const isDone = !!item.completedAt;
          return (
            <Pressable
              key={item.id}
              onPress={() => toggleComplete(item)}
              disabled={!canEdit}
              className={`flex-row items-center rounded-2xl p-3.5 mb-2 border ${
                isCurrent ? "border-primary-400 bg-primary-50 dark:bg-primary-900" : "border-hair bg-accent-card"
              }`}
              style={isDone ? { opacity: 0.5 } : undefined}
            >
              <View
                className={`w-6 h-6 rounded-full items-center justify-center mr-3 ${
                  isDone ? "bg-primary-500" : "bg-accent-paper border border-hair"
                }`}
              >
                {isDone && <Check size={13} color="#FFFFFF" />}
              </View>
              <Text className="text-sm text-mute w-12">{item.time}</Text>
              <Text
                className={`flex-1 text-sm ${isDone ? "text-mute line-through" : "text-ink font-medium"}`}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              {dayOfIdsWithSpeech.has(item.id) && <Mic2 size={13} color="#c9922f" className="ml-1.5" />}
              {dayOfIdsWithTrack.has(item.id) && <Music2 size={13} color="#6e7a4a" className="ml-1.5" />}
            </Pressable>
          );
        })}
        <View className="h-24" />
      </ScrollView>
    </View>
  );
}

export async function generateStaticParams() { return []; }
