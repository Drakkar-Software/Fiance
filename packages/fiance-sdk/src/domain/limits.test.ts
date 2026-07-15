import { describe, it, expect } from 'vitest';
import {
  isWithinFreeLimit,
  shouldShowQuotaBadge,
  getQuotaStatus,
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
