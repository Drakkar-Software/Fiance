import React, { useCallback, useState } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { PlanningShell } from "@/components/planning/PlanningShell";
import { PreparationView } from "@/components/planning/views";
import { useCan } from "@/lib/permissions/usePermissions";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useCanAddMore, FREE_LIMITS } from "@/lib/limits";
import { toast } from "@/lib/toast/sonner";
import { PaywallSheet } from "@/components/PaywallSheet";

export default function PlanningPreparationScreen() {
  const { t } = useTranslation("planning");
  const router = useRouter();
  const canEdit = useCan("planning");
  const customTaskCount = usePlanningStore((s) => s.tasks.filter((task) => !task.isSystem).length);
  const canAddTask = useCanAddMore("tasks", customTaskCount);
  const [showPaywall, setShowPaywall] = useState(false);
  const handleAdd = useCallback(() => {
    if (!canAddTask) {
      toast.error(t("common:premiumLimits.tasks", { limit: FREE_LIMITS.tasks }));
      setShowPaywall(true);
      return;
    }
    router.push({ pathname: "/(tabs)/planning/[id]", params: { id: "new" } });
  }, [canAddTask, router, t]);

  return (
    <>
      <PlanningShell aspect="preparation" onAdd={canEdit ? handleAdd : undefined}>
        <PreparationView />
      </PlanningShell>
      <PaywallSheet visible={showPaywall} onClose={() => setShowPaywall(false)} />
    </>
  );
}
