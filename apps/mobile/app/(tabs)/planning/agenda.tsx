import React, { useCallback } from "react";
import { useRouter } from "expo-router";
import { PlanningShell } from "@/components/planning/PlanningShell";
import { AgendaView } from "@/components/planning/views";
import { useCan } from "@/lib/permissions/usePermissions";

export default function PlanningAgendaScreen() {
  const router = useRouter();
  const canEdit = useCan("planning");
  const handleAdd = useCallback(() => {
    router.push({ pathname: "/(tabs)/planning/agenda-event", params: { id: "new" } });
  }, [router]);

  return (
    <PlanningShell aspect="agenda" onAdd={canEdit ? handleAdd : undefined}>
      <AgendaView />
    </PlanningShell>
  );
}
