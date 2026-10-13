import { create } from "zustand";
import { secureGet, secureSet } from "@/lib/secure-store";
import { analytics } from "@/lib/analytics";
import {
  EMPTY_STATS_CONSENT_RECORD,
  answerStatsConsent,
  applyPrivacySignal,
  isPrivacySignalOptOut,
  markStatsConsentPending,
  parseStatsConsentRecord,
  recordUnansweredStatsConsentDisplay,
  shouldShowStatsConsent,
  statsConsentSdkTarget,
  type StatsConsentChoice,
  type StatsConsentRecord,
} from "@fiance/sdk";

// App-owned, device-local record (per browser on web). The SDK's own consent
// flag cannot tell "answered Non" from "default off", so the answer lives here.
const STORAGE_KEY = "wos_stats_consent";

interface StatsConsentState {
  record: StatsConsentRecord;
  isLoaded: boolean;
  /** Set while the first wedding is being created or joined, so navigation waits for the answer. */
  navHold: boolean;
  /** Closed without answering during this session. Re-shows at the next launch, at most once more. */
  dismissed: boolean;
  /** The display was already counted this session, so re-renders do not count it again. */
  displayCounted: boolean;
  /** The last save did not persist. The SDK stays opted out until it does. */
  unsaved: boolean;
  load: () => Promise<void>;
  holdFirstWedding: () => void;
  releaseFirstWedding: (created: boolean) => void;
  countDisplay: () => void;
  dismiss: () => void;
  answer: (choice: StatsConsentChoice) => Promise<void>;
  retrySave: () => Promise<void>;
}

async function saveRecord(record: StatsConsentRecord): Promise<boolean> {
  try {
    await secureSet(STORAGE_KEY, JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
}

async function loadRecord(): Promise<StatsConsentRecord> {
  try {
    const raw = await secureGet(STORAGE_KEY);
    return parseStatsConsentRecord(raw ? JSON.parse(raw) : null);
  } catch {
    return { ...EMPTY_STATS_CONSENT_RECORD };
  }
}

function readBrowserPrivacySignal(): boolean {
  const nav = (globalThis as { navigator?: { globalPrivacyControl?: unknown; doNotTrack?: unknown } }).navigator;
  return isPrivacySignalOptOut({
    globalPrivacyControl: nav?.globalPrivacyControl === true,
    doNotTrack: typeof nav?.doNotTrack === "string" ? nav.doNotTrack : null,
  });
}

async function applySdkState(record: StatsConsentRecord): Promise<void> {
  const target = statsConsentSdkTarget(record);
  if (target === "opted-in") await analytics.optIn();
  else if (target === "opted-out") await analytics.optOut();
}

export const useStatsConsentStore = create<StatsConsentState>((set, get) => ({
  record: { ...EMPTY_STATS_CONSENT_RECORD },
  isLoaded: false,
  navHold: false,
  dismissed: false,
  displayCounted: false,
  unsaved: false,

  load: async () => {
    const loaded = await loadRecord();
    const record = applyPrivacySignal(loaded, readBrowserPrivacySignal());
    set({ record, isLoaded: true });
    if (record !== loaded) await saveRecord(record);
    await applySdkState(record).catch(() => {});
  },

  holdFirstWedding: () => set({ navHold: true }),

  releaseFirstWedding: (created) => {
    set({ navHold: false });
    if (!created) return;
    const record = markStatsConsentPending(get().record);
    set({ record });
    void saveRecord(record);
  },

  countDisplay: () => {
    if (get().displayCounted) return;
    const record = recordUnansweredStatsConsentDisplay(get().record);
    set({ record, displayCounted: true });
    void saveRecord(record);
  },

  dismiss: () => set({ dismissed: true }),

  answer: async (choice) => {
    const record = answerStatsConsent(get().record, choice);
    set({ record, unsaved: false });

    if (choice === "no") await analytics.optOut().catch(() => {});
    const saved = await saveRecord(record);
    if (choice === "yes") {
      if (saved) await analytics.optIn().catch(() => {});
      else await analytics.optOut().catch(() => {});
    }
    set({ unsaved: !saved });
  },

  retrySave: async () => {
    if (!get().unsaved) return;
    const record = get().record;
    const saved = await saveRecord(record);
    if (!saved) return;
    set({ unsaved: false });
    await applySdkState(record).catch(() => {});
  },
}));

export function selectStatsPromptVisible(state: StatsConsentState): boolean {
  return state.isLoaded && !state.dismissed && shouldShowStatsConsent(state.record);
}

export function selectNavigationHeld(state: StatsConsentState): boolean {
  return state.navHold || selectStatsPromptVisible(state);
}
