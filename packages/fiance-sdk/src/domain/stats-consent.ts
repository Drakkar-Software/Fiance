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

/**
 * An install that has no stored record predates the consent screen: it was never asked.
 * A stored record (answered or not) is left as it is.
 */
export function markStatsConsentOwedToExistingInstall(
  record: StatsConsentRecord,
  hasStoredRecord: boolean,
): StatsConsentRecord {
  if (hasStoredRecord || record.answered) return record;
  return { ...record, pending: true };
}

export interface StatsConsentHomeContext {
  /** The record has been read from storage. */
  ready: boolean;
  /** The active route is the Home tab, with nothing pushed on top of it. */
  onHome: boolean;
  /** The Home welcome has been seen, so the consent screen comes after it. */
  welcomeDone: boolean;
  paywallOpen: boolean;
  /** Another consent screen or a wedding creation is holding navigation. */
  navigationHeld: boolean;
}

export function isHomeRoute(segments: readonly string[]): boolean {
  return segments.length === 2 && segments[0] === '(tabs)' && segments[1] === 'home';
}

/** The post-update screen opens on Home only, once per session, and never over another surface. */
export function shouldPresentStatsConsentOnHome(
  record: StatsConsentRecord,
  ctx: StatsConsentHomeContext,
  shownThisSession: boolean,
): boolean {
  return (
    ctx.ready &&
    ctx.onHome &&
    ctx.welcomeDone &&
    !ctx.paywallOpen &&
    !ctx.navigationHeld &&
    !shownThisSession &&
    shouldShowStatsConsent(record)
  );
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
