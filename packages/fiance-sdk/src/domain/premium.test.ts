import { describe, it, expect } from 'vitest';
import { shouldFlagWeddingPremium } from './premium.js';

describe('shouldFlagWeddingPremium', () => {
  it('flags when owner is premium and the wedding is unflagged', () => {
    expect(
      shouldFlagWeddingPremium({ isOwner: true, ownerIsPremium: true, wedding: { premium: undefined } }),
    ).toBe(true);
  });

  it('flags an existing wedding explicitly marked premium: false (backfill)', () => {
    expect(
      shouldFlagWeddingPremium({ isOwner: true, ownerIsPremium: true, wedding: { premium: false } }),
    ).toBe(true);
  });

  it('does not re-flag a wedding already marked premium (idempotent, one-way)', () => {
    expect(
      shouldFlagWeddingPremium({ isOwner: true, ownerIsPremium: true, wedding: { premium: true } }),
    ).toBe(false);
  });

  it('never flags for a member, even when the owner is premium', () => {
    expect(
      shouldFlagWeddingPremium({ isOwner: false, ownerIsPremium: true, wedding: { premium: undefined } }),
    ).toBe(false);
  });

  it('does not flag when the owner is not premium', () => {
    expect(
      shouldFlagWeddingPremium({ isOwner: true, ownerIsPremium: false, wedding: { premium: undefined } }),
    ).toBe(false);
  });

  it('does not flag when there is no wedding yet', () => {
    expect(
      shouldFlagWeddingPremium({ isOwner: true, ownerIsPremium: true, wedding: null }),
    ).toBe(false);
  });
});
