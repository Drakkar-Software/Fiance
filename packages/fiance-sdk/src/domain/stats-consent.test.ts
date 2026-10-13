import { describe, it, expect } from 'vitest';
import {
  EMPTY_STATS_CONSENT_RECORD,
  STATS_CONSENT_MAX_UNANSWERED_DISPLAYS,
  answerStatsConsent,
  applyPrivacySignal,
  isPrivacySignalOptOut,
  markStatsConsentPending,
  parseStatsConsentRecord,
  recordUnansweredStatsConsentDisplay,
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
