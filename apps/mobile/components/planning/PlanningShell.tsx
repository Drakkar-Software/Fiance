import React from "react";
import { View } from "react-native-css/components";
import { Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { SegmentedControl } from "@/components/SegmentedControl";
import { HeaderAddButton } from "@/components/HeaderAddButton";
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
            <HeaderAddButton accessibilityLabel={t("common:add")} onPress={onAdd} />
          ),
        }}
      />

      {!isWide && (
        <SegmentedControl
          segments={ASPECTS.map((a) => ({ key: a, label: t(PLANNING_ASPECT_LABELS[a]) }))}
          activeKey={aspect}
          onSelect={(key) => router.push(ASPECT_ROUTES[key as PlanningAspect] as any)}
        />
      )}

      {children}
    </View>
  );
}
