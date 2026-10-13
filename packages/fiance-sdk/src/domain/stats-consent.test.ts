import { describe, it, expect } from 'vitest';
import {
  EMPTY_STATS_CONSENT_RECORD,
  STATS_CONSENT_MAX_UNANSWERED_DISPLAYS,
  type StatsConsentHomeContext,
  answerStatsConsent,
  applyPrivacySignal,
  isHomeRoute,
  isPrivacySignalOptOut,
  markStatsConsentOwedToExistingInstall,
  markStatsConsentPending,
  parseStatsConsentRecord,
  recordUnansweredStatsConsentDisplay,
  shouldPresentStatsConsentOnHome,
  shouldShowStatsConsent,
  statsConsentSdkTarget,
  statsConsentToggleOn,
} from './stats-consent.js';

describe('parseStatsConsentRecord', () => {
  it('falls back to an empty record for missing or corrupt input', () => {
    expect(parseStatsConsentRecord(null)).toEqual(EMPTY_STATS_CONSENT_RECORD);
    expect(parseStatsConsentRecord('nope')).toEqual(EMPTY_STATS_CONSENT_RECORD);
    expect(parseStatsConsentRecord({ answered: true, choice: 'maybe' })).toEqual(EMPTY_STATS_CONSENT_RECORD);
  });

  it('keeps a valid answer and drops pending once answered', () => {
    expect(parseStatsConsentRecord({ answered: true, choice: 'yes', unansweredDisplays: 0, pending: true })).toEqual({
      answered: true,
      choice: 'yes',
      unansweredDisplays: 0,
      pending: false,
    });
  });

  it('clamps the display counter to a non-negative integer', () => {
    expect(parseStatsConsentRecord({ unansweredDisplays: -3 }).unansweredDisplays).toBe(0);
    expect(parseStatsConsentRecord({ unansweredDisplays: 1.9 }).unansweredDisplays).toBe(1);
    expect(parseStatsConsentRecord({ unansweredDisplays: 'x' }).unansweredDisplays).toBe(0);
  });
});

describe('answer and pending', () => {
  it('an answer clears pending and keeps the display count', () => {
    const pending = markStatsConsentPending({ ...EMPTY_STATS_CONSENT_RECORD, unansweredDisplays: 1 });
    const answered = answerStatsConsent(pending, 'no');
    expect(answered).toEqual({ answered: true, choice: 'no', unansweredDisplays: 1, pending: false });
  });

  it('does not mark an answered record as pending', () => {
    const answered = answerStatsConsent(EMPTY_STATS_CONSENT_RECORD, 'yes');
    expect(markStatsConsentPending(answered)).toBe(answered);
  });
});

describe('display counting', () => {
  it('counts unanswered displays and stops counting once answered', () => {
    const once = recordUnansweredStatsConsentDisplay(EMPTY_STATS_CONSENT_RECORD);
    expect(once.unansweredDisplays).toBe(1);
    const answered = answerStatsConsent(once, 'yes');
    expect(recordUnansweredStatsConsentDisplay(answered)).toBe(answered);
  });
});

describe('shouldShowStatsConsent', () => {
  it('shows only while pending, unanswered and under the display limit', () => {
    const pending = markStatsConsentPending(EMPTY_STATS_CONSENT_RECORD);
    expect(shouldShowStatsConsent(pending)).toBe(true);
    expect(shouldShowStatsConsent(EMPTY_STATS_CONSENT_RECORD)).toBe(false);
    expect(shouldShowStatsConsent(answerStatsConsent(pending, 'yes'))).toBe(false);
  });

  it(`stops after ${STATS_CONSENT_MAX_UNANSWERED_DISPLAYS} unanswered displays`, () => {
    let record = markStatsConsentPending(EMPTY_STATS_CONSENT_RECORD);
    for (let i = 0; i < STATS_CONSENT_MAX_UNANSWERED_DISPLAYS; i++) {
      expect(shouldShowStatsConsent(record)).toBe(true);
      record = recordUnansweredStatsConsentDisplay(record);
    }
    expect(shouldShowStatsConsent(record)).toBe(false);
  });
});

describe('privacy signals', () => {
  it('recognises Global Privacy Control and both Do Not Track values', () => {
    expect(isPrivacySignalOptOut({ globalPrivacyControl: true })).toBe(true);
    expect(isPrivacySignalOptOut({ doNotTrack: '1' })).toBe(true);
    expect(isPrivacySignalOptOut({ doNotTrack: 'yes' })).toBe(true);
    expect(isPrivacySignalOptOut({ globalPrivacyControl: false, doNotTrack: 'unspecified' })).toBe(false);
    expect(isPrivacySignalOptOut({})).toBe(false);
  });

  it('turns a signal into a recorded Non and never overrides an earlier answer', () => {
    const fromSignal = applyPrivacySignal(EMPTY_STATS_CONSENT_RECORD, true);
    expect(fromSignal).toEqual({ answered: true, choice: 'no', unansweredDisplays: 0, pending: false });
    expect(shouldShowStatsConsent(markStatsConsentPending(fromSignal))).toBe(false);

    const earlierYes = answerStatsConsent(EMPTY_STATS_CONSENT_RECORD, 'yes');
    expect(applyPrivacySignal(earlierYes, true)).toBe(earlierYes);
    expect(applyPrivacySignal(EMPTY_STATS_CONSENT_RECORD, false)).toBe(EMPTY_STATS_CONSENT_RECORD);
  });
});

describe('settings toggle and SDK target', () => {
  it('mirrors the answer once answered', () => {
    expect(statsConsentToggleOn(answerStatsConsent(EMPTY_STATS_CONSENT_RECORD, 'yes'), false)).toBe(true);
    expect(statsConsentToggleOn(answerStatsConsent(EMPTY_STATS_CONSENT_RECORD, 'no'), true)).toBe(false);
  });

  it('falls back to the SDK state before any answer', () => {
    expect(statsConsentToggleOn(EMPTY_STATS_CONSENT_RECORD, true)).toBe(true);
    expect(statsConsentToggleOn(EMPTY_STATS_CONSENT_RECORD, false)).toBe(false);
  });

  it('maps an answer to the SDK state and leaves unanswered records alone', () => {
    expect(statsConsentSdkTarget(answerStatsConsent(EMPTY_STATS_CONSENT_RECORD, 'yes'))).toBe('opted-in');
    expect(statsConsentSdkTarget(answerStatsConsent(EMPTY_STATS_CONSENT_RECORD, 'no'))).toBe('opted-out');
    expect(statsConsentSdkTarget(EMPTY_STATS_CONSENT_RECORD)).toBeNull();
  });
});

describe('existing installs', () => {
  it('owes the prompt to an install with no stored record, and leaves a stored record alone', () => {
    expect(markStatsConsentOwedToExistingInstall(EMPTY_STATS_CONSENT_RECORD, false)).toEqual({
      ...EMPTY_STATS_CONSENT_RECORD,
      pending: true,
    });
    expect(markStatsConsentOwedToExistingInstall(EMPTY_STATS_CONSENT_RECORD, true)).toBe(EMPTY_STATS_CONSENT_RECORD);
  });

  it('never owes the prompt once answered, even without a stored record', () => {
    const answered = answerStatsConsent(EMPTY_STATS_CONSENT_RECORD, 'no');
    expect(markStatsConsentOwedToExistingInstall(answered, false)).toBe(answered);
  });
});

describe('isHomeRoute', () => {
  it('matches only the Home tab', () => {
    expect(isHomeRoute(['(tabs)', 'home'])).toBe(true);
    expect(isHomeRoute(['(tabs)', 'guests'])).toBe(false);
    expect(isHomeRoute(['(tabs)', 'home', 'x'])).toBe(false);
    expect(isHomeRoute(['onboarding'])).toBe(false);
    expect(isHomeRoute([])).toBe(false);
  });
});

describe('shouldPresentStatsConsentOnHome', () => {
  const owed = markStatsConsentOwedToExistingInstall(EMPTY_STATS_CONSENT_RECORD, false);
  const ready: StatsConsentHomeContext = {
    ready: true,
    onHome: true,
    welcomeDone: true,
    paywallOpen: false,
    navigationHeld: false,
  };

  it('presents an owed prompt on Home with nothing else open', () => {
    expect(shouldPresentStatsConsentOnHome(owed, ready, false)).toBe(true);
  });

  it('waits for each blocker to clear', () => {
    expect(shouldPresentStatsConsentOnHome(owed, { ...ready, ready: false }, false)).toBe(false);
    expect(shouldPresentStatsConsentOnHome(owed, { ...ready, onHome: false }, false)).toBe(false);
    expect(shouldPresentStatsConsentOnHome(owed, { ...ready, welcomeDone: false }, false)).toBe(false);
    expect(shouldPresentStatsConsentOnHome(owed, { ...ready, paywallOpen: true }, false)).toBe(false);
    expect(shouldPresentStatsConsentOnHome(owed, { ...ready, navigationHeld: true }, false)).toBe(false);
  });

  it('presents at most once per session', () => {
    expect(shouldPresentStatsConsentOnHome(owed, ready, true)).toBe(false);
  });

  it('never presents to an install that answered, or that a privacy signal answered', () => {
    expect(shouldPresentStatsConsentOnHome(answerStatsConsent(owed, 'yes'), ready, false)).toBe(false);
    expect(shouldPresentStatsConsentOnHome(answerStatsConsent(owed, 'no'), ready, false)).toBe(false);
    expect(shouldPresentStatsConsentOnHome(applyPrivacySignal(owed, true), ready, false)).toBe(false);
  });

  it('stops after the second unanswered display, and counts each display once', () => {
    const shownOnce = recordUnansweredStatsConsentDisplay(owed);
    expect(shouldPresentStatsConsentOnHome(shownOnce, ready, false)).toBe(true);
    const shownTwice = recordUnansweredStatsConsentDisplay(shownOnce);
    expect(shouldPresentStatsConsentOnHome(shownTwice, ready, false)).toBe(false);
  });
});
