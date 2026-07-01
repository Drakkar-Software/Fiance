import React, { useState } from "react";
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
  FolderOpen,
  LayoutGrid,
  BedDouble,
  Tag,
  Mail,
  Clock,
  type LucideIcon,
} from "lucide-react-native";
import { theme as GP } from "@/lib/theme";
import { Display } from "@/components/Display";
import { Script } from "@/components/Script";
import { Sprig } from "@/components/Sprig";
import { useSyncStatusDot } from "@/lib/useSyncStatusDot";
import { PLANNING_ASPECT_LABELS } from "@/db/types";
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
];

const SETTINGS_ITEM: NavItem = { key: "settings", route: "/settings", icon: Settings, labelKey: "tabs.settings" };

interface SubNavItem {
  key: string;
  route: string;
  icon: LucideIcon;
  labelKey: string;
}

const GUESTS_SUBNAV: SubNavItem[] = [
  { key: "groups", route: "/(tabs)/guests/groups", icon: FolderOpen, labelKey: "groups" },
  { key: "table-management", route: "/(tabs)/guests/table-management", icon: LayoutGrid, labelKey: "tables" },
  { key: "accommodations", route: "/(tabs)/guests/accommodations", icon: BedDouble, labelKey: "accommodations" },
  { key: "invitation-types", route: "/(tabs)/guests/invitation-types", icon: Tag, labelKey: "invitationTypesScreen" },
  { key: "communications", route: "/(tabs)/guests/communications", icon: Mail, labelKey: "communicationsScreen" },
];

// Agenda/Jour J are real routes now (see app/(tabs)/planning/) so they can be
// linked from here; Préparatifs isn't listed since it's the parent "Planning"
// row's own route (/(tabs)/planning), same as guests' main list isn't
// duplicated in GUESTS_SUBNAV. PLANNING_ASPECT_LABELS values are already
// namespace-qualified ("planning:aspects.xxx") so any t() resolves them.
const PLANNING_SUBNAV: SubNavItem[] = [
  { key: "agenda", route: "/(tabs)/planning/agenda", icon: Calendar, labelKey: PLANNING_ASPECT_LABELS.agenda },
  { key: "day-of", route: "/(tabs)/planning/day-of", icon: Clock, labelKey: PLANNING_ASPECT_LABELS["day-of"] },
];

interface Props {
  isDark: boolean;
  overdueCount: number;
  activeWedding: WeddingRegistryEntry | null;
}

export function DesktopSidebar({ isDark, overdueCount, activeWedding }: Props) {
  const { t } = useTranslation("common");
  const { t: tg } = useTranslation("guests");
  const router = useRouter();
  const segments = useSegments();
  const syncDotColor = useSyncStatusDot();
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  // segments[1] = active tab key, e.g. ["(tabs)", "vendors", ...]
  const activeKey = (segments[1] as string | undefined) ?? "home";
  // segments[2] = active sub-route key, e.g. ["(tabs)", "guests", "groups"].
  // Undefined on each section's own index route (guests list, Préparatifs),
  // which is correct — neither subnav lists its own parent route as an item.
  const activeSubKey = segments[2] as string | undefined;

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
            <View key={item.key}>
              <Pressable
                onPress={() => router.push(item.route as any)}
                // @ts-ignore — web-only hover events
                onHoverIn={() => setHoveredKey(item.key)}
                onHoverOut={() => setHoveredKey(null)}
                style={[styles.row, { backgroundColor: rowBg }]}
              >
                {isActive ? <View style={styles.ribbon} /> : <View style={styles.ribbonSpacer} />}
                <View style={styles.rowInner}>
                  <Icon size={20} color={iconColor} />
                  <Text style={[styles.rowLabel, { color: labelColor }]}>
                    {t(item.labelKey)}
                  </Text>
                  {item.key === "planning" && overdueCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{overdueCount}</Text>
                    </View>
                  )}
                </View>
              </Pressable>

              {(item.key === "guests" || item.key === "planning") && isActive && (
                <View style={styles.subNav}>
                  {(item.key === "guests" ? GUESTS_SUBNAV : PLANNING_SUBNAV).map((sub) => {
                    const isSubActive = activeSubKey === sub.key;
                    const isSubHovered = hoveredKey === `${item.key}:${sub.key}`;
                    const SubIcon = sub.icon;
                    const subColor = isSubActive ? GP.clay : isDark ? GP.inkDark : mutedText;
                    const subBg =
                      isSubActive ? GP.claySoft :
                      isSubHovered ? (isDark ? "rgba(42,36,24,0.10)" : GP.paper) :
                      "transparent";
                    const label = item.key === "guests" ? tg(sub.labelKey) : t(sub.labelKey);

                    return (
                      <Pressable
                        key={sub.key}
                        onPress={() => router.push(sub.route as any)}
                        // @ts-ignore — web-only hover events
                        onHoverIn={() => setHoveredKey(`${item.key}:${sub.key}`)}
                        onHoverOut={() => setHoveredKey(null)}
                        style={[styles.subRow, { backgroundColor: subBg }]}
                      >
                        <SubIcon size={16} color={subColor} />
                        <Text style={[styles.subRowLabel, { color: subColor }]}>
                          {label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Settings pinned to bottom */}
      <View style={[styles.divider, { backgroundColor: borderColor, marginTop: 8, marginBottom: 8 }]} />
      <View style={styles.bottomNav}>
        {(() => {
          const item = SETTINGS_ITEM;
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
              onPress={() => router.push(item.route as any)}
              // @ts-ignore — web-only hover events
              onHoverIn={() => setHoveredKey(item.key)}
              onHoverOut={() => setHoveredKey(null)}
              style={[styles.row, { backgroundColor: rowBg }]}
            >
              {isActive ? <View style={styles.ribbon} /> : <View style={styles.ribbonSpacer} />}
              <View style={styles.rowInner}>
                <Icon size={20} color={iconColor} />
                <Text style={[styles.rowLabel, { color: labelColor }]}>
                  {t(item.labelKey)}
                </Text>
                {syncDotColor && (
                  <View style={[styles.syncDot, { backgroundColor: syncDotColor }]} />
                )}
              </View>
            </Pressable>
          );
        })()}
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
  subNav: {
    gap: 2,
    paddingBottom: 4,
  },
  subRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    height: 34,
    paddingLeft: 38,
    paddingRight: 12,
    gap: 8,
  },
  subRowLabel: {
    flex: 1,
    fontSize: 13,
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
  bottomNav: {
    paddingHorizontal: 8,
  },
});
