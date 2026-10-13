import { create } from "zustand";
import { secureGet, secureSet } from "@/lib/secure-store";
import { analytics } from "@/lib/analytics";
import {
  EMPTY_STATS_CONSENT_RECORD,
  STATS_CONSENT_STORAGE_KEY,
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
const STORAGE_KEY = STATS_CONSENT_STORAGE_KEY;

interface StatsConsentState {
  record: StatsConsentRecord;
  isLoaded: boolean;
  /** Set while the first wedding is being created or joined, so navigation waits for the answer. */
  navHold: boolean;
  /** The prompt was opened in this session. Opening counts one unanswered display. */
  shownThisSession: boolean;
  /** Closed without answering during this session. Re-shows at the next launch, at most once more. */
  dismissed: boolean;
  /** The last save did not persist. The SDK stays opted out until it does. */
  unsaved: boolean;
  load: () => Promise<void>;
  holdFirstWedding: () => void;
  releaseFirstWedding: (created: boolean) => void;
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

/**
 * Decides on the display before it is counted: the record is read as it stood when the
 * prompt was owed, so the count taken for this display cannot hide the prompt it opens.
 */
function openPrompt(
  record: StatsConsentRecord,
  shownThisSession: boolean,
): { record: StatsConsentRecord; shownThisSession: boolean } {
  if (shownThisSession || !shouldShowStatsConsent(record)) return { record, shownThisSession };
  return { record: recordUnansweredStatsConsentDisplay(record), shownThisSession: true };
}

export const useStatsConsentStore = create<StatsConsentState>((set, get) => ({
  record: { ...EMPTY_STATS_CONSENT_RECORD },
  isLoaded: false,
  navHold: false,
  shownThisSession: false,
  dismissed: false,
  unsaved: false,

  load: async () => {
    const loaded = await loadRecord();
    const privacyApplied = applyPrivacySignal(loaded, readBrowserPrivacySignal());
    const opened = openPrompt(privacyApplied, get().shownThisSession);
    set({ record: opened.record, shownThisSession: opened.shownThisSession, isLoaded: true });
    if (opened.record !== loaded) await saveRecord(opened.record);
    await applySdkState(opened.record).catch(() => {});
  },

  holdFirstWedding: () => set({ navHold: true }),

  releaseFirstWedding: (created) => {
    if (!created) {
      set({ navHold: false });
      return;
    }
    const opened = openPrompt(markStatsConsentPending(get().record), get().shownThisSession);
    set({ navHold: false, record: opened.record, shownThisSession: opened.shownThisSession });
    void saveRecord(opened.record);
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

/**
 * Runs the create or join of a wedding. When it is the user's first wedding, navigation
 * is held until the consent screen is answered, dismissed, or the creation failed.
 */
export async function runWeddingCreation(isFirstWedding: boolean, run: () => Promise<void>): Promise<void> {
  if (!isFirstWedding) return run();
  useStatsConsentStore.getState().holdFirstWedding();
  let created = false;
  try {
    await run();
    created = true;
  } finally {
    useStatsConsentStore.getState().releaseFirstWedding(created);
  }
}

export function selectStatsPromptVisible(state: StatsConsentState): boolean {
  return state.isLoaded && state.shownThisSession && !state.dismissed && !state.record.answered;
}

export function selectNavigationHeld(state: StatsConsentState): boolean {
  return state.navHold || selectStatsPromptVisible(state);
}
