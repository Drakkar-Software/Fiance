import React from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable } from "react-native-css/components";
import { useGuestsStore } from "@/store/useGuestsStore";
import { PlanView } from "@/components/SeatingPlanView";
import { Display } from "@/components/Display";
import { Script } from "@/components/Script";
import { theme as GP } from "@/lib/theme";

export default function SeatingScreen() {
  const { t } = useTranslation("guests");
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const tables = useGuestsStore((s) => s.tables);
  const guests = useGuestsStore((s) => s.guests);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Script size={17} color={GP.clay}>← {t("common:back")}</Script>
        </Pressable>
        <Display size={20} italic>{t("seatingPlan")}</Display>
        <View style={{ width: 60 }} />
      </View>

      {/* Seating plan canvas */}
      <View style={{ flex: 1 }}>
        <PlanView
          tables={tables}
          guests={guests}
          updateTable={(id, updates) => useGuestsStore.getState().updateTable(id, updates)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: GP.paper,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: GP.hair,
    backgroundColor: GP.card,
  },
  backBtn: {
    width: 60,
  },
});
