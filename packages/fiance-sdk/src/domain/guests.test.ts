import { describe, it, expect } from 'vitest';
import { computeCounts, countDuplicateGuests } from './guests.js';

// Minimal guest factory — computeCounts only reads rsvpStatus + invitationType here.
const g = (rsvpStatus: string, invitationType: string) =>
  ({ rsvpStatus, invitationType }) as any;

// Minimal guest factory for name-based duplicate detection.
const named = (firstName: string, lastName: string) => ({ firstName, lastName }) as any;

// A custom (user-created) invitation type carries a UUID id, NOT a hardcoded enum string.
const TWO_DAYS = "b1f2c3d4-2days";

describe('computeCounts — per-invitation-type pricing counts', () => {
  it('groups accepted guests by exact invitation-type id (inv_by_type)', () => {
    const guests = [
      g('ACCEPTED', 'CEREMONY'),
      g('ACCEPTED', 'CEREMONY'),
      g('ACCEPTED', 'COCKTAIL'),
      g('ACCEPTED', 'FULL'),
      g('ACCEPTED', TWO_DAYS),
      g('DECLINED', 'FULL'), // ignored (some accepted)
      g('PENDING', 'FULL'),  // ignored (some accepted)
    ];
    const c = computeCounts(guests);
    expect(c.inv_by_type).toEqual({ CEREMONY: 2, COCKTAIL: 1, FULL: 1, [TWO_DAYS]: 1 });
  });

  it('inv_by_type_all counts ALL guests regardless of RSVP (guest-screen parity)', () => {
    const guests = [
      g('ACCEPTED', 'FULL'),
      g('PENDING', 'FULL'),
      g('DECLINED', 'FULL'),
      g('MAYBE', TWO_DAYS),
      g('PENDING', TWO_DAYS),
    ];
    const c = computeCounts(guests);
    // Mirrors the guest screen's typeCounts: group ALL guests by invitationType id, no RSVP filter.
    const guestScreenCount = (id: string) => guests.filter((x) => x.invitationType === id).length;
    expect(c.inv_by_type_all).toEqual({ FULL: 3, [TWO_DAYS]: 2 });
    expect(c.inv_by_type_all.FULL).toBe(guestScreenCount('FULL'));
    expect(c.inv_by_type_all[TWO_DAYS]).toBe(guestScreenCount(TWO_DAYS));
  });

  it('a custom UUID "2 days" type is counted (BOTH_DAYS regression guard)', () => {
    const guests = [
      g('PENDING', TWO_DAYS),
      g('ACCEPTED', TWO_DAYS),
      g('MAYBE', TWO_DAYS),
    ];
    const c = computeCounts(guests);
    // Was 0 with the old hardcoded "BOTH_DAYS" enum key; now tracks the real id.
    expect(c.inv_by_type_all[TWO_DAYS]).toBe(3);
    expect(c.inv_by_type[TWO_DAYS]).toBe(1); // only the accepted one
  });

  it('inv_by_type estimates from non-declined guests when nobody has accepted yet', () => {
    const guests = [
      g('PENDING', 'FULL'),
      g('PENDING', 'FULL'),
      g('MAYBE', 'COCKTAIL'),
      g('DECLINED', 'FULL'), // excluded from the estimate
    ];
    const c = computeCounts(guests);
    expect(c.accepted).toBe(0);
    expect(c.inv_by_type).toEqual({ FULL: 2, COCKTAIL: 1 }); // declined excluded
    expect(c.inv_by_type_all).toEqual({ FULL: 3, COCKTAIL: 1 }); // declined included
  });

  it('is empty with no guests', () => {
    const c = computeCounts([]);
    expect(c.inv_by_type).toEqual({});
    expect(c.inv_by_type_all).toEqual({});
  });
});

describe('countDuplicateGuests', () => {
  it('returns 0 when no names repeat', () => {
    const guests = [named('Jean', 'Dupont'), named('Marie', 'Curie')];
    expect(countDuplicateGuests(guests)).toBe(0);
  });

  it('counts every guest sharing a duplicated first+last name', () => {
    const guests = [
      named('Jean', 'Dupont'),
      named('Jean', 'Dupont'),
      named('Marie', 'Curie'),
    ];
    expect(countDuplicateGuests(guests)).toBe(2);
  });

  it('matches names case-insensitively and ignores surrounding whitespace', () => {
    const guests = [named('jean', ' Dupont '), named('JEAN', 'dupont')];
    expect(countDuplicateGuests(guests)).toBe(2);
  });

  it('sums multiple distinct duplicate groups', () => {
    const guests = [
      named('Jean', 'Dupont'),
      named('Jean', 'Dupont'),
      named('Marie', 'Curie'),
      named('Marie', 'Curie'),
      named('Marie', 'Curie'),
      named('Paul', 'Martin'),
    ];
    // Dupont pair (2) + Curie trio (3) = 5; Martin is unique and excluded.
    expect(countDuplicateGuests(guests)).toBe(5);
  });

  it('a shared first name alone (different last name) is not a duplicate', () => {
    const guests = [named('Jean', 'Dupont'), named('Jean', 'Martin')];
    expect(countDuplicateGuests(guests)).toBe(0);
  });

  it('is 0 with no guests', () => {
    expect(countDuplicateGuests([])).toBe(0);
  });
});
