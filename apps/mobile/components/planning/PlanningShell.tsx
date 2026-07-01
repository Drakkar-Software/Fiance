import React from "react";
import { View, Pressable } from "react-native-css/components";
import { Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { CalendarRange, Palmtree, Church, Mic2, Play } from "lucide-react-native";
import { SegmentedControl } from "@/components/SegmentedControl";
import { HeaderAddButton } from "@/components/HeaderAddButton";
import { StackMenu } from "@/components/StackMenu";
import { useIsWideScreen } from "@/lib/useIsWideScreen";
import { PLANNING_ASPECT_LABELS } from "@/db/types";
import type { PlanningAspect } from "@/db/types";

const ASPECTS: PlanningAspect[] = ["preparation", "agenda", "day-of"];

const ASPECT_ROUTES: Record<PlanningAspect, string> = {
  preparation: "/(tabs)/planning",
  agenda: "/(tabs)/planning/agenda",
  "day-of": "/(tabs)/planning/day-of",
};

interface PlanningShellProps {
  aspect: PlanningAspect;
  onAdd: () => void;
  children: React.ReactNode;
}

// Mobile/narrow keeps the native segmented control (Préparatifs/Agenda/Jour J
// as tabs within one screen feel); wide/desktop hides it in favor of the
// DesktopSidebar's planning sub-nav, since preparation/agenda/day-of are now
// real routes.
export function PlanningShell({ aspect, onAdd, children }: PlanningShellProps) {
  const { t } = useTranslation("planning");
  const router = useRouter();
  const isWide = useIsWideScreen();

  return (
    <View className="flex-1 bg-accent-paper">
      <Stack.Screen
        options={{
          headerRight: () => (
            <View className="flex-row items-center">
              {aspect === "day-of" && (
                <Pressable
                  onPress={() => router.push("/(tabs)/planning/live")}
                  accessibilityRole="button"
                  accessibilityLabel={t("live.title")}
                  className="w-9 h-9 items-center justify-center rounded-lg active:opacity-60 mr-1"
                  hitSlop={8}
                >
                  <Play size={20} color="#b96a4a" />
                </Pressable>
              )}
              <HeaderAddButton accessibilityLabel={t("common:add")} onPress={onAdd} />
              <StackMenu
                items={[
                  {
                    label: t("events.title"),
                    icon: CalendarRange,
                    onPress: () => router.push("/(tabs)/planning/events"),
                  },
                  {
                    label: t("ceremony.title"),
                    icon: Church,
                    onPress: () => router.push("/(tabs)/planning/ceremony"),
                  },
                  {
                    label: t("music.title"),
                    icon: Mic2,
                    onPress: () => router.push("/(tabs)/planning/speeches-music"),
                  },
                  {
                    label: t("honeymoon.title"),
                    icon: Palmtree,
                    onPress: () => router.push("/(tabs)/planning/honeymoon"),
                  },
                ]}
              />
            </View>
          ),
        }}
      />

      {!isWide && (
        <SegmentedControl
          segments={ASPECTS.map((a) => ({ key: a, label: t(PLANNING_ASPECT_LABELS[a]) }))}
          activeKey={aspect}
          onSelect={(key) => {
            if (key === aspect) return;
            router.replace(ASPECT_ROUTES[key as PlanningAspect] as any);
          }}
        />
      )}

      {children}
    </View>
  );
}
