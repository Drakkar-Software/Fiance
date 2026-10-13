export type StatsConsentChoice = 'yes' | 'no';

export interface StatsConsentRecord {
  /** The user answered Oui or Non (or a browser privacy signal answered for them). */
  answered: boolean;
  choice: StatsConsentChoice | null;
  /** Times the prompt was shown without an answer (back, dismiss, or app killed). */
  unansweredDisplays: number;
  /** A prompt is owed to the user and has not been answered yet. */
  pending: boolean;
}

export const STATS_CONSENT_MAX_UNANSWERED_DISPLAYS = 2;

export const EMPTY_STATS_CONSENT_RECORD: StatsConsentRecord = {
  answered: false,
  choice: null,
  unansweredDisplays: 0,
  pending: false,
};

export function parseStatsConsentRecord(raw: unknown): StatsConsentRecord {
  if (!raw || typeof raw !== 'object') return { ...EMPTY_STATS_CONSENT_RECORD };
  const r = raw as Record<string, unknown>;
  const choice = r.choice === 'yes' || r.choice === 'no' ? r.choice : null;
  const answered = r.answered === true && choice !== null;
  const displays =
    typeof r.unansweredDisplays === 'number' && Number.isFinite(r.unansweredDisplays) && r.unansweredDisplays > 0
      ? Math.floor(r.unansweredDisplays)
      : 0;
  return {
    answered,
    choice: answered ? choice : null,
    unansweredDisplays: displays,
    pending: !answered && r.pending === true,
  };
}

export function answerStatsConsent(record: StatsConsentRecord, choice: StatsConsentChoice): StatsConsentRecord {
  return { answered: true, choice, unansweredDisplays: record.unansweredDisplays, pending: false };
}

export function markStatsConsentPending(record: StatsConsentRecord): StatsConsentRecord {
  if (record.answered) return record;
  return { ...record, pending: true };
}

export function recordUnansweredStatsConsentDisplay(record: StatsConsentRecord): StatsConsentRecord {
  if (record.answered) return record;
  return { ...record, unansweredDisplays: record.unansweredDisplays + 1 };
}

export function isPrivacySignalOptOut(signal: {
  globalPrivacyControl?: boolean | null;
  doNotTrack?: string | null;
}): boolean {
  return signal.globalPrivacyControl === true || signal.doNotTrack === '1' || signal.doNotTrack === 'yes';
}

/** A browser privacy signal is an explicit answer: store Non without ever showing the prompt. */
export function applyPrivacySignal(record: StatsConsentRecord, signalOptOut: boolean): StatsConsentRecord {
  if (!signalOptOut || record.answered) return record;
  return answerStatsConsent(record, 'no');
}

export function shouldShowStatsConsent(record: StatsConsentRecord): boolean {
  return record.pending && !record.answered && record.unansweredDisplays < STATS_CONSENT_MAX_UNANSWERED_DISPLAYS;
}

/** The Settings toggle mirrors the answer; before any answer it reflects what the SDK actually does. */
export function statsConsentToggleOn(record: StatsConsentRecord, sdkOptedIn: boolean): boolean {
  return record.answered ? record.choice === 'yes' : sdkOptedIn;
}

/** The SDK state a recorded answer requires, or null when no answer is recorded yet. */
export function statsConsentSdkTarget(record: StatsConsentRecord): 'opted-in' | 'opted-out' | null {
  if (!record.answered) return null;
  return record.choice === 'yes' ? 'opted-in' : 'opted-out';
}

export const STATS_CONSENT_STORAGE_KEY = 'wos_stats_consent';

/** The status the analytics SDK persisted before this app kept its own answer record. */
export function parseLegacyConsentStatus(raw: string | null): 'opted-in' | 'opted-out' | 'unknown' | null {
  if (raw === null) return null;
  const status = parseJsonOrNull(raw)?.status;
  return status === 'opted-in' || status === 'opted-out' || status === 'unknown' ? status : null;
}

export interface StatsConsentResetInput {
  /** Raw app record under STATS_CONSENT_STORAGE_KEY, or null when it was never written. */
  storedRaw: string | null;
  /** Raw analytics SDK consent state from before the app kept its own record, or null. */
  legacyRaw: string | null;
}

/**
 * Picks the record to start from. The reset only happens while no app record exists, so it
 * runs once. An earlier explicit opt-out counts as an answered Non and never shows the prompt.
 */
export function planStatsConsentReset({ storedRaw, legacyRaw }: StatsConsentResetInput): {
  reset: boolean;
  record: StatsConsentRecord;
} {
  if (storedRaw !== null) {
    return { reset: false, record: parseStatsConsentRecord(parseJsonOrNull(storedRaw)) };
  }
  const explicitOptOut = parseLegacyConsentStatus(legacyRaw) === 'opted-out';
  return {
    reset: true,
    record: explicitOptOut ? answerStatsConsent(EMPTY_STATS_CONSENT_RECORD, 'no') : { ...EMPTY_STATS_CONSENT_RECORD },
  };
}

function parseJsonOrNull(raw: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
