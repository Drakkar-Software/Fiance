import React from "react";
import { theme as GP } from "@/lib/theme";
import { View, useColorScheme } from "react-native";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { Home, Briefcase, Users, Calendar, PieChart } from "lucide-react-native";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { useIsWideScreen } from "@/lib/useIsWideScreen";

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

  const isWide = useIsWideScreen();

  const tabs = (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: GP.clay,
        tabBarInactiveTintColor: isDark ? GP.mute : "#a09585",
        tabBarStyle: (!hasWedding || isWide) ? { display: "none" } : {
          backgroundColor: isDark ? GP.paperDark : GP.paper,
          borderTopColor: isDark ? GP.hairStrong : GP.hair,
          borderTopWidth: 1,
          elevation: 0,
          shadowColor: GP.ink,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
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
        name="budget"
        options={{
          title: t("tabs.budget"),
          headerShown: false,
          tabBarIcon: ({ color }) => <PieChart size={22} color={color} />,
        }}
      />
    </Tabs>
  );

  return (
    <View style={{ flex: 1, flexDirection: isWide && hasWedding ? "row" : "column" }}>
      {isWide && hasWedding && (
        <DesktopSidebar
          isDark={isDark}
          overdueCount={overdueTasks.length}
          activeWedding={activeWedding}
        />
      )}
      <View style={{ flex: 1 }}>
        {tabs}
      </View>
    </View>
  );
}
