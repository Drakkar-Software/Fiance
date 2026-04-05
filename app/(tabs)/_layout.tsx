import React from "react";
import { Platform } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { usePlanningStore } from "@/store/usePlanningStore";

export default function TabLayout() {
  const overdueTasks = usePlanningStore((s) => s.getOverdueTasks());

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#EC4899",
        tabBarInactiveTintColor: "#B0B0B8",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          elevation: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.04,
          shadowRadius: 12,
          paddingBottom: Platform.OS === "ios" ? 0 : 8,
          height: Platform.OS === "ios" ? 88 : 64,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginTop: -2,
        },
        headerStyle: {
          backgroundColor: "#FFFFFF",
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: "#1F2937",
        headerTitleStyle: {
          fontWeight: "600",
          fontSize: 17,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="prestataires"
        options={{
          title: "Prestataires",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="invites"
        options={{
          title: "Invités",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="planning"
        options={{
          title: "Planning",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={22} color={color} />
          ),
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
        name="idees"
        options={{
          title: "Idées",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sparkles" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: "Budget",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pie-chart" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Réglages",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
