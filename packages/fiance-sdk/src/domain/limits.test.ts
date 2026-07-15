import { describe, it, expect } from 'vitest';
import {
  isWithinFreeLimit,
  shouldShowQuotaBadge,
  getQuotaStatus,
  wouldExceedFreeLimit,
  PREMIUM_LIMIT_MESSAGE_KEY,
  FREE_LIMITS,
  type FreeLimitKey,
} from './limits.js';

describe('isWithinFreeLimit', () => {
  it('allows adding when free and below the cap', () => {
    expect(isWithinFreeLimit('guests', 29, false)).toBe(true);
  });

  it('blocks adding when free and at the cap', () => {
    expect(isWithinFreeLimit('guests', 30, false)).toBe(false);
  });

  it('blocks adding when free and above the cap (grandfathered data)', () => {
    expect(isWithinFreeLimit('guests', 45, false)).toBe(false);
  });

  it('always allows adding when premium, even above the cap', () => {
    expect(isWithinFreeLimit('guests', 100, true)).toBe(true);
  });

  it('enforces the correct cap for every FreeLimitKey', () => {
    (Object.keys(FREE_LIMITS) as FreeLimitKey[]).forEach((key) => {
      const cap = FREE_LIMITS[key];
      expect(isWithinFreeLimit(key, cap - 1, false)).toBe(true);
      expect(isWithinFreeLimit(key, cap, false)).toBe(false);
    });
  });
});

describe('shouldShowQuotaBadge', () => {
  it('hides for premium regardless of count', () => {
    expect(shouldShowQuotaBadge(0, true)).toBe(false);
    expect(shouldShowQuotaBadge(30, true)).toBe(false);
  });

  it('hides for free users with nothing added yet', () => {
    expect(shouldShowQuotaBadge(0, false)).toBe(false);
  });

  it('shows for free users once at least one item exists', () => {
    expect(shouldShowQuotaBadge(1, false)).toBe(true);
    expect(shouldShowQuotaBadge(29, false)).toBe(true);
  });
});

describe('getQuotaStatus', () => {
  it('reports count, limit, and atCap below the cap', () => {
    expect(getQuotaStatus('guests', 29)).toEqual({ count: 29, limit: 30, atCap: false });
  });

  it('reports atCap true exactly at the cap', () => {
    expect(getQuotaStatus('vendors', 3)).toEqual({ count: 3, limit: 3, atCap: true });
  });

  it('reports atCap true above the cap (grandfathered data)', () => {
    expect(getQuotaStatus('weddingEvents', 5)).toEqual({ count: 5, limit: 1, atCap: true });
  });

  it('uses the correct limit for every FreeLimitKey', () => {
    (Object.keys(FREE_LIMITS) as FreeLimitKey[]).forEach((key) => {
      expect(getQuotaStatus(key, 0).limit).toBe(FREE_LIMITS[key]);
    });
  });
});

describe('wouldExceedFreeLimit', () => {
  it('allows a bulk add that lands exactly at the cap', () => {
    expect(wouldExceedFreeLimit('guests', 20, 10, false)).toBe(false);
  });

  it('blocks a bulk add that would cross the cap', () => {
    expect(wouldExceedFreeLimit('guests', 25, 10, false)).toBe(true);
  });

  it('blocks even a single add once already at the cap', () => {
    expect(wouldExceedFreeLimit('vendors', 3, 1, false)).toBe(true);
  });

  it('always allows for premium, even far above the cap', () => {
    expect(wouldExceedFreeLimit('guests', 100, 50, true)).toBe(false);
  });

  it('allows adding zero when already within the cap', () => {
    expect(wouldExceedFreeLimit('guests', 20, 0, false)).toBe(false);
  });

  it('still reports exceeded when adding zero to already-over-cap data (grandfathered)', () => {
    expect(wouldExceedFreeLimit('guests', 45, 0, false)).toBe(true);
  });
});

describe('PREMIUM_LIMIT_MESSAGE_KEY', () => {
  it('maps every FreeLimitKey to a message key', () => {
    (Object.keys(FREE_LIMITS) as FreeLimitKey[]).forEach((key) => {
      expect(typeof PREMIUM_LIMIT_MESSAGE_KEY[key]).toBe('string');
    });
  });

  it('maps weddingEvents to the shorter "events" key', () => {
    expect(PREMIUM_LIMIT_MESSAGE_KEY.weddingEvents).toBe('events');
  });

  it('maps every other key to itself', () => {
    expect(PREMIUM_LIMIT_MESSAGE_KEY.members).toBe('members');
    expect(PREMIUM_LIMIT_MESSAGE_KEY.guests).toBe('guests');
    expect(PREMIUM_LIMIT_MESSAGE_KEY.vendors).toBe('vendors');
    expect(PREMIUM_LIMIT_MESSAGE_KEY.tasks).toBe('tasks');
  });
});
