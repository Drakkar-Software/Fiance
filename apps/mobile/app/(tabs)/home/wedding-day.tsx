import React, { useMemo, useEffect, useState } from "react";
import { View, ScrollView, Pressable, StyleSheet } from "react-native";
import { Text } from "react-native-css/components";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { getDateLocale } from "@/i18n/dateFnsLocale";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useWeddingStore } from "@/store/useWeddingStore";
import { theme as GP } from "@/lib/theme";
import { Display } from "@/components/Display";
import { Script } from "@/components/Script";
import { Label } from "@/components/Label";
import { PageHeader } from "@/components/PageHeader";

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function WeddingDayScreen() {
  const { t } = useTranslation("planning");
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const now = useClock();
  const items = usePlanningStore((s) => s.dayOfItems);
  const wedding = useWeddingStore((s) => s.wedding);

  const timeStr = format(now, "HH:mm");
  const locale = getDateLocale();

  const weddingDateLabel = useMemo(() => {
    if (!wedding?.weddingDate) return null;
    try {
      return format(new Date(wedding.weddingDate + "T00:00:00"), "EEEE d MMMM yyyy", { locale });
    } catch {
      return null;
    }
  }, [wedding?.weddingDate, locale]);

  const sortedItems = useMemo(
    () =>
      [...items].sort((a, b) => {
        const da = (a.date ?? wedding?.weddingDate ?? "");
        const db = (b.date ?? wedding?.weddingDate ?? "");
        if (da !== db) return da.localeCompare(db);
        return (a.time ?? "").localeCompare(b.time ?? "");
      }),
    [items, wedding?.weddingDate]
  );

  const nowTimeStr = format(now, "HH:mm");
  const currentIdx = useMemo(() => {
    let idx = -1;
    for (let i = 0; i < sortedItems.length; i++) {
      if ((sortedItems[i].time ?? "") <= nowTimeStr) idx = i;
    }
    return idx;
  }, [sortedItems, nowTimeStr]);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 16 }]}>
      {/* Header */}
      <View style={styles.header}>
        <Label color="#a09585" size={9}>{t("common:yourDay")}</Label>
        <Script size={18} color="#e8c06a">{timeStr}</Script>
      </View>

      <View style={{ marginTop: 10 }}>
        <PageHeader
          eyebrow={t("common:yourDay") || "Your day"}
          title={weddingDateLabel || t("common:today")}
          titleSize={28}
          style={{ paddingHorizontal: 20, paddingTop: 0 }}
        />
      </View>

      {/* Timeline */}
      <ScrollView style={{ flex: 1, marginTop: 18 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 24 }}>
          {sortedItems.length === 0 ? (
            <View style={styles.empty}>
              <Script size={22} color="#a09585">{t("noMoments")}</Script>
              <Pressable
                onPress={() => router.push({ pathname: "/(tabs)/planning/day-of-item", params: { id: "new" } })}
                style={styles.addBtn}
              >
                <Text style={styles.addBtnText}>{t("addMoment")}</Text>
              </Pressable>
            </View>
          ) : (
            sortedItems.map((item, idx) => {
              const isActive = idx === currentIdx;
              const isPast = idx < currentIdx;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => router.push({ pathname: "/(tabs)/planning/day-of-item", params: { id: item.id } })}
                  style={[
                    styles.item,
                    isActive && styles.itemActive,
                    { opacity: isPast ? 0.35 : 1 },
                  ]}
                >
                  <Text style={[styles.itemTime, isActive && { color: "#fff" }]}>
                    {item.time ?? "--:--"}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemTitle, isActive && { color: "#fff" }]}>
                      {item.title}
                    </Text>
                    {item.notes ? (
                      <Text style={[styles.itemNote, isActive && { opacity: 0.8 }]}>
                        {item.notes}
                      </Text>
                    ) : null}
                  </View>
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Close button */}
      <Pressable
        onPress={() => router.back()}
        style={[styles.closeBtn, { paddingBottom: insets.bottom + 12 }]}
      >
        <Script size={16} color={GP.mute}>{t("common:back")}</Script>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#1a1510",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    gap: 16,
  },
  addBtn: {
    backgroundColor: GP.clay,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  addBtnText: {
    color: "#fdfaf1",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  item: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 4,
  },
  itemActive: {
    backgroundColor: GP.clay,
  },
  itemTime: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 14,
    color: "#e8c06a",
    width: 44,
  },
  itemTitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "#f4ecd8",
  },
  itemNote: {
    fontFamily: "Fraunces_400Regular_Italic",
    fontSize: 11,
    color: "#a09585",
    marginTop: 1,
  },
  closeBtn: {
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
});
