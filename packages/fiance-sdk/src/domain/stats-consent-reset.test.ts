import { describe, it, expect } from 'vitest';
import {
  EMPTY_STATS_CONSENT_RECORD,
  answerStatsConsent,
  parseLegacyConsentStatus,
  planStatsConsentReset,
  statsConsentSdkTarget,
} from './stats-consent.js';

const legacy = (status: string) =>
  JSON.stringify({ status, updatedAt: '2026-09-01T10:00:00.000Z', history: [] });

describe('parseLegacyConsentStatus', () => {
  it('reads the status the analytics SDK stored', () => {
    expect(parseLegacyConsentStatus(legacy('opted-in'))).toBe('opted-in');
    expect(parseLegacyConsentStatus(legacy('opted-out'))).toBe('opted-out');
    expect(parseLegacyConsentStatus(legacy('unknown'))).toBe('unknown');
  });

  it('returns null when the key is absent, unreadable or has no known status', () => {
    expect(parseLegacyConsentStatus(null)).toBeNull();
    expect(parseLegacyConsentStatus('{not json')).toBeNull();
    expect(parseLegacyConsentStatus(JSON.stringify({ status: 'maybe' }))).toBeNull();
    expect(parseLegacyConsentStatus('null')).toBeNull();
  });
});

describe('planStatsConsentReset', () => {
  it('an install with stored opted-in starts unanswered and is reset', () => {
    const plan = planStatsConsentReset({ storedRaw: null, legacyRaw: legacy('opted-in') });
    expect(plan).toEqual({ reset: true, record: EMPTY_STATS_CONSENT_RECORD });
    expect(statsConsentSdkTarget(plan.record)).toBeNull();
  });

  it('an install with an unknown or unreadable legacy state is reset to unanswered', () => {
    expect(planStatsConsentReset({ storedRaw: null, legacyRaw: legacy('unknown') }).record).toEqual(
      EMPTY_STATS_CONSENT_RECORD,
    );
    expect(planStatsConsentReset({ storedRaw: null, legacyRaw: '{broken' }).record).toEqual(
      EMPTY_STATS_CONSENT_RECORD,
    );
    expect(planStatsConsentReset({ storedRaw: null, legacyRaw: null }).record).toEqual(EMPTY_STATS_CONSENT_RECORD);
  });

  it('an explicit earlier opt-out counts as answered Non and is never shown the prompt', () => {
    const plan = planStatsConsentReset({ storedRaw: null, legacyRaw: legacy('opted-out') });
    expect(plan.reset).toBe(true);
    expect(plan.record).toEqual({ answered: true, choice: 'no', unansweredDisplays: 0, pending: false });
    expect(statsConsentSdkTarget(plan.record)).toBe('opted-out');
  });

  it('runs only once: an existing record is kept and the legacy state is ignored', () => {
    const yes = answerStatsConsent(EMPTY_STATS_CONSENT_RECORD, 'yes');
    const plan = planStatsConsentReset({ storedRaw: JSON.stringify(yes), legacyRaw: legacy('opted-out') });
    expect(plan).toEqual({ reset: false, record: yes });
  });

  it('keeps an existing unanswered record as it is, without a reset', () => {
    const pending = { ...EMPTY_STATS_CONSENT_RECORD, pending: true, unansweredDisplays: 1 };
    const plan = planStatsConsentReset({ storedRaw: JSON.stringify(pending), legacyRaw: legacy('opted-in') });
    expect(plan).toEqual({ reset: false, record: pending });
  });

  it('a corrupt existing record is read as empty and is not reset again', () => {
    const plan = planStatsConsentReset({ storedRaw: '{broken', legacyRaw: legacy('opted-out') });
    expect(plan).toEqual({ reset: false, record: EMPTY_STATS_CONSENT_RECORD });
  });
});
