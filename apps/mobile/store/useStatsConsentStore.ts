import { create } from "zustand";
import { secureGet, secureSet } from "@/lib/secure-store";
import { analytics } from "@/lib/analytics";
import {
  EMPTY_STATS_CONSENT_RECORD,
  answerStatsConsent,
  applyPrivacySignal,
  isPrivacySignalOptOut,
  markStatsConsentOwedToExistingInstall,
  markStatsConsentPending,
  parseStatsConsentRecord,
  recordUnansweredStatsConsentDisplay,
  shouldPresentStatsConsentOnHome,
  shouldShowStatsConsent,
  statsConsentSdkTarget,
  type StatsConsentChoice,
  type StatsConsentHomeContext,
  type StatsConsentRecord,
} from "@fiance/sdk";

// App-owned, device-local record (per browser on web). The SDK's own consent
// flag cannot tell "answered Non" from "default off", so the answer lives here.
const STORAGE_KEY = "wos_stats_consent";

/**
 * "onboarding": right after the first wedding is created or joined (full screen).
 * "home-update": an existing install, shown once on Home (sheet on iOS, dialog on web).
 */
export type StatsConsentPresentation = "onboarding" | "home-update";

interface StatsConsentState {
  record: StatsConsentRecord;
  isLoaded: boolean;
  /** Set while the first wedding is being created or joined, so navigation waits for the answer. */
  navHold: boolean;
  /** The screen on display, or null. */
  presentation: StatsConsentPresentation | null;
  /** A display was opened in this session. Opening counts one unanswered display. */
  shownThisSession: boolean;
  /** The last save did not persist. The SDK stays opted out until it does. */
  unsaved: boolean;
  load: () => Promise<void>;
  holdFirstWedding: () => void;
  releaseFirstWedding: (created: boolean) => void;
  considerHome: (ctx: StatsConsentHomeContext) => void;
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

async function loadRecord(): Promise<{ record: StatsConsentRecord; hasStoredRecord: boolean }> {
  try {
    const raw = await secureGet(STORAGE_KEY);
    if (raw == null) return { record: { ...EMPTY_STATS_CONSENT_RECORD }, hasStoredRecord: false };
    return { record: parseStatsConsentRecord(JSON.parse(raw)), hasStoredRecord: true };
  } catch {
    return { record: { ...EMPTY_STATS_CONSENT_RECORD }, hasStoredRecord: false };
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
  presentation: StatsConsentPresentation,
): { record: StatsConsentRecord; shownThisSession: boolean; presentation: StatsConsentPresentation | null } {
  if (shownThisSession || !shouldShowStatsConsent(record)) {
    return { record, shownThisSession, presentation: null };
  }
  return { record: recordUnansweredStatsConsentDisplay(record), shownThisSession: true, presentation };
}

export const useStatsConsentStore = create<StatsConsentState>((set, get) => ({
  record: { ...EMPTY_STATS_CONSENT_RECORD },
  isLoaded: false,
  navHold: false,
  presentation: null,
  shownThisSession: false,
  unsaved: false,

  load: async () => {
    const stored = await loadRecord();
    const privacyApplied = applyPrivacySignal(stored.record, readBrowserPrivacySignal());
    const owed = markStatsConsentOwedToExistingInstall(privacyApplied, stored.hasStoredRecord);
    set({ record: owed, isLoaded: true });
    if (privacyApplied !== stored.record) await saveRecord(privacyApplied);
    await applySdkState(owed).catch(() => {});
  },

  holdFirstWedding: () => set({ navHold: true }),

  releaseFirstWedding: (created) => {
    if (!created) {
      set({ navHold: false });
      return;
    }
    const opened = openPrompt(markStatsConsentPending(get().record), get().shownThisSession, "onboarding");
    set({
      navHold: false,
      record: opened.record,
      shownThisSession: opened.shownThisSession,
      presentation: opened.presentation,
    });
    void saveRecord(opened.record);
  },

  considerHome: (ctx) => {
    const { record, shownThisSession, navHold } = get();
    const eligible = shouldPresentStatsConsentOnHome(
      record,
      { ...ctx, navigationHeld: ctx.navigationHeld || navHold },
      shownThisSession,
    );
    if (!eligible) return;
    const next = recordUnansweredStatsConsentDisplay(record);
    set({ record: next, shownThisSession: true, presentation: "home-update" });
    void saveRecord(next);
  },

  dismiss: () => set({ presentation: null }),

  answer: async (choice) => {
    const record = answerStatsConsent(get().record, choice);
    set({ record, unsaved: false, presentation: null });

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
  return state.isLoaded && state.presentation !== null && !state.record.answered;
}

export function selectNavigationHeld(state: StatsConsentState): boolean {
  return state.navHold || selectStatsPromptVisible(state);
}
