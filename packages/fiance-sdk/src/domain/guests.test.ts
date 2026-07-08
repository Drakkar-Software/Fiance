import { describe, it, expect } from 'vitest';
import { computeCounts } from './guests.js';

// Minimal guest factory — computeCounts only reads rsvpStatus + invitationType here.
const g = (rsvpStatus: string, invitationType: string) =>
  ({ rsvpStatus, invitationType }) as any;

describe('computeCounts — per-invitation-type pricing counts', () => {
  it('counts accepted guests exactly by invitation type (not cumulative)', () => {
    const guests = [
      g('ACCEPTED', 'CEREMONY'),
      g('ACCEPTED', 'CEREMONY'),
      g('ACCEPTED', 'COCKTAIL'),
      g('ACCEPTED', 'FULL'),
      g('ACCEPTED', 'FULL'),
      g('ACCEPTED', 'BOTH_DAYS'),
      g('DECLINED', 'FULL'), // ignored
      g('PENDING', 'FULL'),  // ignored while some accepted
    ];
    const c = computeCounts(guests);
    expect(c.inv_ceremony_count).toBe(2);
    expect(c.inv_cocktail_count).toBe(1);
    expect(c.inv_full_count).toBe(2); // exact FULL only, not FULL+BOTH_DAYS
    expect(c.inv_both_days_count).toBe(1);
  });

  it('estimates from non-declined guests when nobody has accepted yet', () => {
    const guests = [
      g('PENDING', 'FULL'),
      g('PENDING', 'FULL'),
      g('MAYBE', 'COCKTAIL'),
      g('DECLINED', 'FULL'), // excluded from the estimate
    ];
    const c = computeCounts(guests);
    expect(c.accepted).toBe(0);
    expect(c.inv_full_count).toBe(2);     // 2 pending FULL, declined excluded
    expect(c.inv_cocktail_count).toBe(1); // 1 maybe COCKTAIL
    expect(c.inv_ceremony_count).toBe(0);
  });

  it('is all zero with no guests', () => {
    const c = computeCounts([]);
    expect(c.inv_ceremony_count).toBe(0);
    expect(c.inv_cocktail_count).toBe(0);
    expect(c.inv_full_count).toBe(0);
    expect(c.inv_both_days_count).toBe(0);
  });
});
