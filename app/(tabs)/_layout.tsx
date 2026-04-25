import React, { useEffect, useState } from "react";
import { theme as GP } from "@/lib/theme";
import { Platform, View, useColorScheme } from "react-native";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { Home, Briefcase, Users, Calendar, Sparkles, PieChart, Settings } from "lucide-react-native";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";
import { DatabaseProvider } from "@/db/provider";
import { SyncInitializer, NotificationInitializer, IAPInitializer } from "@/lib/providers";
import { getStarfishStore, onSyncStatusChange } from "@/lib/starfish";
import { subscribeSyncStatus, type SyncStatus } from "@drakkar.software/starfish-client/zustand";
import { OfflineBanner } from "@/components/OfflineBanner";

export default function TabLayout() {
  const { t } = useTranslation("common");
  const appColorScheme = useSettingsStore((s) => s.colorScheme);
  const systemScheme = useColorScheme();
  const isDark = appColorScheme === "dark" || (appColorScheme === "system" && systemScheme === "dark");
  const registry = useWeddingRegistryStore((s) => s.registry);
  const isLoaded = useWeddingRegistryStore((s) => s.isLoaded);
  const hasWedding = isLoaded && !!registry?.weddings.length;
  const activeWedding = registry?.weddings.find((w) => w.id === registry.activeWeddingId) ?? registry?.weddings[0] ?? null;
  const tasks = usePlanningStore((s) => s.tasks);
  const overdueTasks = React.useMemo(
    () => tasks.filter((task) => task.status !== "DONE" && task.dueDate && new Date(task.dueDate) < new Date()),
    [tasks]
  );

  const tabs = (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: GP.clay,
        tabBarInactiveTintColor: isDark ? GP.mute : "#a09585",
        tabBarStyle: !hasWedding ? { display: "none" } : {
          backgroundColor: isDark ? GP.paperDark : GP.paper,
          borderTopColor: isDark ? GP.hairStrong : GP.hair,
          borderTopWidth: 1,
          elevation: 0,
          shadowColor: GP.ink,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          ...(Platform.OS === "ios" ? { paddingBottom: 0, height: 88 } : {}),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginTop: -2,
          fontFamily: "Inter_500Medium",
        },
        headerStyle: {
          backgroundColor: isDark ? GP.paperDark : GP.paper,
        },
        headerTintColor: isDark ? GP.inkDark : GP.ink,
        headerTitleStyle: {
          fontFamily: "Fraunces_500Medium",
          fontSize: 17,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t("tabs.home"),
          headerShown: false,
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="vendors"
        options={{
          title: t("tabs.vendors"),
          headerShown: false,
          tabBarIcon: ({ color }) => <Briefcase size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="guests"
        options={{
          title: t("tabs.guests"),
          headerShown: false,
          tabBarIcon: ({ color }) => <Users size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="planning"
        options={{
          title: t("tabs.planning"),
          headerShown: false,
          tabBarIcon: ({ color }) => <Calendar size={22} color={color} />,
          tabBarBadge: overdueTasks.length > 0 ? overdueTasks.length : undefined,
          tabBarBadgeStyle: {
            backgroundColor: "#EF4444",
            fontSize: 10,
            minWidth: 18,
            height: 18,
            lineHeight: 18,
          },
        }}
      />
      <Tabs.Screen
        name="ideas"
        options={{
          title: t("tabs.ideas"),
          headerShown: false,
          href: null,
          tabBarIcon: ({ color }) => <Sparkles size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: t("tabs.budget"),
          headerShown: false,
          tabBarIcon: ({ color }) => <PieChart size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("tabs.settings"),
          headerShown: false,
          href: null,
          tabBarIcon: ({ color }) => (
            <SyncSettingsIcon color={color} dotBorder={isDark ? "#111827" : "#FFFFFF"} />
          ),
        }}
      />
    </Tabs>
  );

  return (
    <DatabaseProvider dbFileName={activeWedding?.dbFileName}>
      {activeWedding && <SyncInitializer wedding={activeWedding} />}
      {activeWedding && <NotificationInitializer />}
      {activeWedding && <IAPInitializer wedding={activeWedding} />}
      <View style={{ flex: 1 }}>
        {tabs}
        {activeWedding && <OfflineBanner />}
      </View>
    </DatabaseProvider>
  );
}

function SyncSettingsIcon({ color, dotBorder }: { color: string; dotBorder: string }) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

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

  const dotColor =
    syncStatus === "synced" ? GP.olive :
    syncStatus === "error" ? "#EF4444" :
    syncStatus === "syncing" || syncStatus === "pending" ? GP.mustard :
    null;

  return (
    <View style={{ width: 22, height: 22 }}>
      <Settings size={22} color={color} />
      {dotColor && (
        <View
          style={{
            position: "absolute",
            top: -2,
            right: -2,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: dotColor,
            borderWidth: 1.5,
            borderColor: dotBorder,
          }}
        />
      )}
    </View>
  );
}
