import React from "react";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useTranslation } from "react-i18next";
import { theme as GP } from "@/lib/theme";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";
import { usePermissions } from "@/lib/permissions/usePermissions";

export default function TabLayout() {
  const { t } = useTranslation("common");
  const registry = useWeddingRegistryStore((s) => s.registry);
  const isLoaded = useWeddingRegistryStore((s) => s.isLoaded);
  const hasWedding = isLoaded && !!registry?.weddings.length;
  const { can } = usePermissions();
  const tasks = usePlanningStore((s) => s.tasks);
  const overdue = React.useMemo(
    () => tasks.filter((x) => x.status !== "DONE" && x.dueDate && new Date(x.dueDate) < new Date()),
    [tasks],
  );

  return (
    <NativeTabs hidden={!hasWedding} tintColor={GP.clay} badgeBackgroundColor="#EF4444">
      <NativeTabs.Trigger name="home">
        <NativeTabs.Trigger.Icon sf={{ default: "house", selected: "house.fill" }} md="home" />
        <NativeTabs.Trigger.Label>{t("tabs.home")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      {can("vendors", "view") && (
        <NativeTabs.Trigger name="vendors">
          <NativeTabs.Trigger.Icon sf={{ default: "briefcase", selected: "briefcase.fill" }} md="work" />
          <NativeTabs.Trigger.Label>{t("tabs.vendors")}</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      )}

      {can("guests", "view") && (
        <NativeTabs.Trigger name="guests">
          <NativeTabs.Trigger.Icon sf={{ default: "person.2", selected: "person.2.fill" }} md="group" />
          <NativeTabs.Trigger.Label>{t("tabs.guests")}</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      )}

      {can("planning", "view") && (
        <NativeTabs.Trigger name="planning">
          <NativeTabs.Trigger.Icon sf="calendar" md="calendar_month" />
          <NativeTabs.Trigger.Label>{t("tabs.planning")}</NativeTabs.Trigger.Label>
          {overdue.length > 0 && (
            <NativeTabs.Trigger.Badge>{String(overdue.length)}</NativeTabs.Trigger.Badge>
          )}
        </NativeTabs.Trigger>
      )}

      {can("budget", "view") && (
        <NativeTabs.Trigger name="budget">
          <NativeTabs.Trigger.Icon sf={{ default: "chart.pie", selected: "chart.pie.fill" }} md="pie_chart" />
          <NativeTabs.Trigger.Label>{t("tabs.budget")}</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      )}
    </NativeTabs>
  );
}
