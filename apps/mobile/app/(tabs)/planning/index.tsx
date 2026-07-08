import React, { useCallback } from "react";
import { useRouter } from "expo-router";
import { PlanningShell } from "@/components/planning/PlanningShell";
import { PreparationView } from "@/components/planning/views";
import { useCan } from "@/lib/permissions/usePermissions";

export default function PlanningPreparationScreen() {
  const router = useRouter();
  const canEdit = useCan("planning");
  const handleAdd = useCallback(() => {
    router.push({ pathname: "/(tabs)/planning/[id]", params: { id: "new" } });
  }, [router]);

  return (
    <PlanningShell aspect="preparation" onAdd={canEdit ? handleAdd : undefined}>
      <PreparationView />
    </PlanningShell>
  );
}
