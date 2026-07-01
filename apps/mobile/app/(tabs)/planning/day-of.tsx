import React, { useCallback } from "react";
import { useRouter } from "expo-router";
import { PlanningShell } from "@/components/planning/PlanningShell";
import { DayOfView } from "@/components/planning/views";

export default function PlanningDayOfScreen() {
  const router = useRouter();
  const handleAdd = useCallback(() => {
    router.push({ pathname: "/(tabs)/planning/day-of-item", params: { id: "new" } });
  }, [router]);

  return (
    <PlanningShell aspect="day-of" onAdd={handleAdd}>
      <DayOfView />
    </PlanningShell>
  );
}
