import { describe, it, expect } from 'vitest';
import { isWithinFreeLimit, FREE_LIMITS, type FreeLimitKey } from './limits.js';

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
