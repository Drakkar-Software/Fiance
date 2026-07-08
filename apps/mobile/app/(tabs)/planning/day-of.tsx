import React, { useCallback } from "react";
import { useRouter } from "expo-router";
import { PlanningShell } from "@/components/planning/PlanningShell";
import { DayOfView } from "@/components/planning/views";
import { useCan } from "@/lib/permissions/usePermissions";

export default function PlanningDayOfScreen() {
  const router = useRouter();
  const canEdit = useCan("planning");
  const handleAdd = useCallback(() => {
    router.push({ pathname: "/(tabs)/planning/day-of-item", params: { id: "new" } });
  }, [router]);

  return (
    <PlanningShell aspect="day-of" onAdd={canEdit ? handleAdd : undefined}>
      <DayOfView />
    </PlanningShell>
  );
}
