import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { isHomeRoute } from "@fiance/sdk";
import { selectStatsPromptVisible, useStatsConsentStore } from "@/store/useStatsConsentStore";
import { useFeatureTrialsStore } from "@/store/useFeatureTrialsStore";
import { usePaywallOpen } from "@/components/PaywallProvider";
import { StatsConsentScreen } from "@/components/StatsConsentScreen";

// Routes that stay mounted while the first-wedding flow runs. After an answer or
// dismiss on these, the user is sent home.
const ONBOARDING_ROUTES = ["onboarding", "join"];

/**
 * Mounted once, under the active wedding (app/_layout.tsx). Shows the stats consent
 * screen: right after the first wedding is created (onboarding), or once on Home for
 * an existing install that has never answered (home-update).
 */
export function StatsConsentGate() {
  const visible = useStatsConsentStore(selectStatsPromptVisible);
  const presentation = useStatsConsentStore((s) => s.presentation);
  const ready = useStatsConsentStore((s) => s.isLoaded);
  const navigationHeld = useStatsConsentStore((s) => s.navHold);
  const considerHome = useStatsConsentStore((s) => s.considerHome);
  const answer = useStatsConsentStore((s) => s.answer);
  const dismiss = useStatsConsentStore((s) => s.dismiss);
  const retrySave = useStatsConsentStore((s) => s.retrySave);
  const welcomeDone = useFeatureTrialsStore((s) => !!s.seen.home);
  const paywallOpen = usePaywallOpen();
  const segments = useSegments() as string[];
  const router = useRouter();
  const wasVisible = useRef(false);
  const onHome = isHomeRoute(segments);

  useEffect(() => {
    considerHome({ ready, onHome, welcomeDone, paywallOpen, navigationHeld });
  }, [considerHome, ready, onHome, welcomeDone, paywallOpen, navigationHeld]);

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
      presentation={presentation ?? "onboarding"}
      onAnswer={(choice) => void answer(choice)}
      onDismiss={dismiss}
    />
  );
}
