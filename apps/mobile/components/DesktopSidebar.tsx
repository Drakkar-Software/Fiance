import React, { useState, useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Home,
  Briefcase,
  Users,
  Calendar,
  Sparkles,
  PieChart,
  Settings,
  type LucideIcon,
} from "lucide-react-native";
import { theme as GP } from "@/lib/theme";
import { Display } from "@/components/Display";
import { Script } from "@/components/Script";
import { Sprig } from "@/components/Sprig";
import { getStarfishStore, onSyncStatusChange, subscribeSyncStatus, type SyncStatus } from "@/lib/starfish";
import type { WeddingRegistryEntry } from "@fiance/sdk";

interface NavItem {
  key: string;
  route: string;
  icon: LucideIcon;
  labelKey: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: "home",     route: "/home",     icon: Home,      labelKey: "tabs.home" },
  { key: "vendors",  route: "/vendors",  icon: Briefcase, labelKey: "tabs.vendors" },
  { key: "guests",   route: "/guests",   icon: Users,     labelKey: "tabs.guests" },
  { key: "planning", route: "/planning", icon: Calendar,  labelKey: "tabs.planning" },
  { key: "ideas",    route: "/ideas",    icon: Sparkles,  labelKey: "tabs.ideas" },
  { key: "budget",   route: "/budget",   icon: PieChart,  labelKey: "tabs.budget" },
  { key: "settings", route: "/settings", icon: Settings,  labelKey: "tabs.settings" },
];

interface Props {
  isDark: boolean;
  overdueCount: number;
  activeWedding: WeddingRegistryEntry | null;
}

export function DesktopSidebar({ isDark, overdueCount, activeWedding }: Props) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const segments = useSegments();
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  useEffect(() => {
    let unsubStore: (() => void) | null = null;

    const attach = (enabled: boolean) => {
      unsubStore?.();
      unsubStore = null;
      if (enabled) {
        const sf = getStarfishStore();
        if (sf) {
          unsubStore = subscribeSyncStatus(sf, setSyncStatus);
        }
      } else {
        setSyncStatus(null);
      }
    };

    attach(!!getStarfishStore());
    const unsubInit = onSyncStatusChange(attach);

    return () => {
      unsubInit();
      unsubStore?.();
    };
  }, []);

  // segments[1] = active tab key, e.g. ["(tabs)", "vendors", ...]
  const activeKey = (segments[1] as string | undefined) ?? "home";

  const syncDotColor =
    syncStatus === "synced" ? GP.olive :
    syncStatus === "error" ? "#EF4444" :
    syncStatus === "syncing" || syncStatus === "pending" ? GP.mustard :
    null;

  const bg = isDark ? GP.cardDark : GP.card;
  const borderColor = isDark ? GP.hairStrong : GP.hair;
  const mutedText = isDark ? GP.mute : "#8a8373";
  const titleColor = isDark ? GP.inkDark : GP.ink;

  return (
    <View style={[styles.sidebar, { backgroundColor: bg, borderRightColor: borderColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.wordmarkRow}>
          <Display italic size={20} color={titleColor}>
            Fiancé
          </Display>
          <Sprig size={14} color={GP.olive} angle={-20} style={styles.sprig} />
        </View>
        {activeWedding && (
          <Script size={14} color={mutedText} style={{ marginTop: 2 }}>
            {activeWedding.label}
          </Script>
        )}
      </View>

      <View style={[styles.divider, { backgroundColor: borderColor }]} />

      {/* Nav items */}
      <View style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeKey === item.key;
          const isHovered = hoveredKey === item.key;
          const Icon = item.icon;

          const iconColor = isActive ? GP.clay : isDark ? GP.inkDark : GP.inkSoft;
          const labelColor = isActive ? GP.clay : isDark ? GP.inkDark : GP.inkSoft;
          const rowBg =
            isActive ? GP.claySoft :
            isHovered ? (isDark ? "rgba(42,36,24,0.10)" : GP.paper) :
            "transparent";

          return (
            <Pressable
              key={item.key}
              onPress={() => router.push(item.route as any)}
              // @ts-ignore — web-only hover events
              onHoverIn={() => setHoveredKey(item.key)}
              onHoverOut={() => setHoveredKey(null)}
              style={[styles.row, { backgroundColor: rowBg }]}
            >
              {/* Active ribbon bar */}
              {isActive && <View style={styles.ribbon} />}
              {/* Spacer to keep icon aligned when ribbon absent */}
              {!isActive && <View style={styles.ribbonSpacer} />}

              <View style={styles.rowInner}>
                <Icon size={20} color={iconColor} />
                <Text style={[styles.rowLabel, { color: labelColor }]}>
                  {t(item.labelKey)}
                </Text>

                {/* Planning overdue badge */}
                {item.key === "planning" && overdueCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{overdueCount}</Text>
                  </View>
                )}

                {/* Settings sync dot */}
                {item.key === "settings" && syncDotColor && (
                  <View style={[styles.syncDot, { backgroundColor: syncDotColor }]} />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 248,
    height: "100%",
    borderRightWidth: 1,
    paddingBottom: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  wordmarkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
  },
  sprig: {
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  nav: {
    flex: 1,
    paddingHorizontal: 8,
    gap: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    height: 44,
    overflow: "hidden",
  },
  ribbon: {
    width: 3,
    height: 24,
    borderRadius: 2,
    backgroundColor: GP.clay,
    marginLeft: 4,
  },
  ribbonSpacer: {
    width: 7, // 3px ribbon + 4px marginLeft
  },
  rowInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 10,
    paddingRight: 12,
    gap: 10,
  },
  rowLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  badge: {
    backgroundColor: "#EF4444",
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
