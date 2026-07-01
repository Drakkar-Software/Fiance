import React, { useMemo, useCallback } from "react";
import { View, Text, ScrollView, Pressable } from "react-native-css/components";
import { useRouter, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { Church } from "lucide-react-native";
import { CEREMONY_ITEM_KIND_LABELS } from "@fiance/sdk";
import type { CeremonyItemKind } from "@fiance/sdk";
import { useCeremonyStore } from "@/store/useCeremonyStore";
import { useWeddingEventsStore } from "@/store/useWeddingEventsStore";
import { useGuestsStore } from "@/store/useGuestsStore";
import { useWeddingPartyStore } from "@/store/useWeddingPartyStore";
import { useWeddingStore } from "@/store/useWeddingStore";
import { FAB } from "@/components/FAB";
import { EmptyState } from "@/components/EmptyState";
import { Chip } from "@/components/Chip";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { printCeremonyBooklet } from "@/lib/print-ceremony";
import { analytics } from "@/lib/analytics";
import type { CeremonyItem } from "@/db/schema";

export default function CeremonyScreen() {
  const { t } = useTranslation("planning");
  const router = useRouter();
  const items = useCeremonyStore((s) => s.ceremonyItems);
  const weddingEvents = useWeddingEventsStore((s) => s.weddingEvents);
  const guests = useGuestsStore((s) => s.guests);
  const roles = useWeddingPartyStore((s) => s.weddingRoles);
  const wedding = useWeddingStore((s) => s.wedding);

  const guestMap = useMemo(
    () => new Map(guests.map((g) => [g.id, `${g.firstName} ${g.lastName}`.trim()])),
    [guests]
  );
  const eventMap = useMemo(() => new Map(weddingEvents.map((e) => [e.id, e.title])), [weddingEvents]);

  const sorted = useMemo(
    () => [...items].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [items]
  );

  const grouped = useMemo(() => {
    const byEvent = new Map<string, CeremonyItem[]>();
    for (const item of sorted) {
      const key = item.eventId ?? "__none__";
      const list = byEvent.get(key) ?? [];
      list.push(item);
      byEvent.set(key, list);
    }
    return byEvent;
  }, [sorted]);

  const isGrouped = grouped.size > 1;

  const navigateToItem = useCallback(
    (id: string) => router.push({ pathname: "/(tabs)/planning/ceremony-item", params: { id } }),
    [router]
  );

  const handleExport = useCallback(async () => {
    const kindLabels = Object.fromEntries(
      (Object.keys(CEREMONY_ITEM_KIND_LABELS) as CeremonyItemKind[]).map((k) => [k, t(CEREMONY_ITEM_KIND_LABELS[k])])
    );
    await printCeremonyBooklet(sorted, wedding, guests, roles, kindLabels, {
      programOf: t("ceremony.programOf"),
      performedBy: t("ceremony.performedBy"),
    });
    analytics.capture("export_data", { format: "pdf", kind: "ceremony" });
  }, [sorted, wedding, guests, roles, t]);

  const renderRow = (item: CeremonyItem) => {
    const performer = item.guestId ? guestMap.get(item.guestId) ?? item.performerName : item.performerName;
    return (
      <Pressable
        key={item.id}
        onPress={() => navigateToItem(item.id)}
        className="bg-accent-card rounded-2xl p-4 mb-2.5 border border-hair active:opacity-80"
      >
        <Chip>{t(CEREMONY_ITEM_KIND_LABELS[item.kind as CeremonyItemKind] ?? item.kind)}</Chip>
        <Text className="text-base font-semibold text-ink mt-1.5">{item.title}</Text>
        {performer ? <Text className="text-xs text-mute mt-0.5">{performer}</Text> : null}
      </Pressable>
    );
  };

  return (
    <View className="relative flex-1 bg-accent-paper">
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={handleExport} className="mr-2 px-3 py-1.5 rounded-lg active:opacity-60">
              <Text className="text-primary-500 text-sm font-semibold">{t("ceremony.exportBooklet")}</Text>
            </Pressable>
          ),
        }}
      />
      {items.length === 0 ? (
        <EmptyState
          icon={Church}
          title={t("ceremony.empty")}
          description={t("ceremony.emptyDesc")}
          actionLabel={t("ceremony.addItem")}
          onAction={() => navigateToItem("new")}
        />
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          {isGrouped
            ? [...grouped.entries()].map(([key, groupItems]) => (
                <CollapsibleSection
                  key={key}
                  title={key === "__none__" ? t("ceremony.unassigned") : eventMap.get(key) ?? t("ceremony.unassigned")}
                  count={groupItems.length}
                >
                  {groupItems.map(renderRow)}
                </CollapsibleSection>
              ))
            : sorted.map(renderRow)}
          <View className="h-24" />
        </ScrollView>
      )}
      <FAB onPress={() => navigateToItem("new")} />
    </View>
  );
}

export async function generateStaticParams() { return []; }
