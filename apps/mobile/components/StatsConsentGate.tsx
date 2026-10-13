import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { selectStatsPromptVisible, useStatsConsentStore } from "@/store/useStatsConsentStore";
import { StatsConsentScreen } from "@/components/StatsConsentScreen";

// Routes that stay mounted while the first-wedding flow runs. After an answer or
// dismiss on these, the user is sent home.
const ONBOARDING_ROUTES = ["onboarding", "join"];

/**
 * Mounted once, under the active wedding (app/_layout.tsx). Shows the one-time
 * stats consent screen over whatever route the first wedding was created from.
 */
export function StatsConsentGate() {
  const visible = useStatsConsentStore(selectStatsPromptVisible);
  const answer = useStatsConsentStore((s) => s.answer);
  const dismiss = useStatsConsentStore((s) => s.dismiss);
  const retrySave = useStatsConsentStore((s) => s.retrySave);
  const segments = useSegments();
  const router = useRouter();
  const wasVisible = useRef(false);

  useEffect(() => {
    if (!visible && wasVisible.current && ONBOARDING_ROUTES.includes(segments[0] as string)) {
      router.replace("/home" as any);
    }
    wasVisible.current = visible;
  }, [visible, segments, router]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") void retrySave();
    });
    return () => sub.remove();
  }, [retrySave]);

  return (
    <StatsConsentScreen
      visible={visible}
      onAnswer={(choice) => void answer(choice)}
      onDismiss={dismiss}
    />
  );
}
