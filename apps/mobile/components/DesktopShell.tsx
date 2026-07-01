import React, { useMemo } from "react";
import { View, useColorScheme } from "react-native";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useIsWideScreen } from "@/lib/useIsWideScreen";
import { DesktopSidebar } from "@/components/DesktopSidebar";

// Reusable desktop-sidebar wrapper for routes that live outside (tabs)/ —
// e.g. ideas, settings — which otherwise never mount DesktopSidebar since
// it's normally only rendered by (tabs)/_layout.web.tsx.
export function DesktopShell({ children }: { children: React.ReactNode }) {
  const appColorScheme = useSettingsStore((s) => s.colorScheme);
  const systemScheme = useColorScheme();
  const isDark = appColorScheme === "dark" || (appColorScheme === "system" && systemScheme === "dark");
  const registry = useWeddingRegistryStore((s) => s.registry);
  const isLoaded = useWeddingRegistryStore((s) => s.isLoaded);
  const hasWedding = isLoaded && !!registry?.weddings.length;
  const activeWedding = registry?.weddings.find((w) => w.id === registry.activeWeddingId) ?? registry?.weddings[0] ?? null;
  const tasks = usePlanningStore((s) => s.tasks);
  const overdueTasks = useMemo(
    () => tasks.filter((task) => task.status !== "DONE" && task.dueDate && new Date(task.dueDate) < new Date()),
    [tasks]
  );
  const isWide = useIsWideScreen();

  if (!isWide || !hasWedding) return <>{children}</>;

  return (
    <View style={{ flex: 1, flexDirection: "row" }}>
      <DesktopSidebar isDark={isDark} overdueCount={overdueTasks.length} activeWedding={activeWedding} />
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}
