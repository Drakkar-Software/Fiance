import { describe, it, expect } from 'vitest';
import {
  computeCounts,
  countDuplicateGuests,
  formatGuestName,
  guestNameMatches,
  removeGuest,
  removeGuests,
  applyGuestUpdates,
  rsvpStatusUpdate,
} from './guests.js';

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

describe('formatGuestName', () => {
  const n = (firstName: string, lastName: string, nameParticle?: string) =>
    ({ firstName, lastName, nameParticle }) as never;

  it('adds no stray space when there is no particle', () => {
    expect(formatGuestName(n('Adrien', 'DIDOT'))).toBe('DIDOT Adrien');
    expect(formatGuestName(n('Adrien', 'DIDOT', ''))).toBe('DIDOT Adrien');
    expect(formatGuestName(n('Adrien', 'DIDOT', '   '))).toBe('DIDOT Adrien');
  });

  it('puts the particle before the last name, in upper case', () => {
    expect(formatGuestName(n('Nicole', 'FONTAINES', 'de'))).toBe('DE FONTAINES Nicole');
    expect(formatGuestName(n('Marie', 'PRESLE', 'de la'))).toBe('DE LA PRESLE Marie');
  });

  it('keeps an elided particle glued to the last name', () => {
    expect(formatGuestName(n('Jean', 'ORMESSON', "d'"))).toBe("D'ORMESSON Jean");
  });

  it('composes a placeholder first name like any other', () => {
    expect(formatGuestName(n('Invité 2', 'GRUAU'))).toBe('GRUAU Invité 2');
  });

  it('stays readable when a part is missing', () => {
    expect(formatGuestName(n('Adrien', ''))).toBe('Adrien');
    expect(formatGuestName(n('', 'DIDOT'))).toBe('DIDOT');
  });
});

describe('guestNameMatches — searching what you read', () => {
  const n = (firstName: string, lastName: string, nameParticle?: string) =>
    ({ firstName, lastName, nameParticle }) as never;
  const mayeul = n('Mayeul', 'FONTAINE DE FONTENAY', 'de la');

  it('matches on the particle, which used to be unsearchable', () => {
    expect(guestNameMatches(mayeul, 'de la')).toBe(true);
    expect(guestNameMatches(mayeul, 'DE LA FONTAINE')).toBe(true);
  });

  it('matches the whole name copied exactly as displayed', () => {
    expect(guestNameMatches(mayeul, 'DE LA FONTAINE DE FONTENAY Mayeul')).toBe(true);
    expect(guestNameMatches(mayeul, 'fontenay mayeul')).toBe(true);
  });

  it('still matches on first name alone or last name alone', () => {
    expect(guestNameMatches(mayeul, 'mayeul')).toBe(true);
    expect(guestNameMatches(mayeul, 'fontaine')).toBe(true);
  });

  it('a guest without a particle is searched as before', () => {
    const adrien = n('Adrien', 'DIDOT');
    expect(guestNameMatches(adrien, 'didot')).toBe(true);
    expect(guestNameMatches(adrien, 'DIDOT Adrien')).toBe(true);
    expect(guestNameMatches(adrien, 'fontaine')).toBe(false);
  });

  it('an empty term filters nothing', () => {
    expect(guestNameMatches(mayeul, '')).toBe(true);
    expect(guestNameMatches(mayeul, '   ')).toBe(true);
  });

  it('does not match two unrelated guests', () => {
    expect(guestNameMatches(n('Adrien', 'DIDOT'), 'presle')).toBe(false);
  });
});

describe('sorting — the particle is excluded from it', () => {
  // Mirrors the guest list's own sort key verbatim: the contract is that the
  // particle must NOT change it. Nothing in the sort reads it.
  const key = (g: { lastName: string; firstName: string }) => `${g.lastName}${g.firstName}`;
  const n = (firstName: string, lastName: string, nameParticle?: string) =>
    ({ firstName, lastName, nameParticle });

  it('a guest with a particle sorts on the last name, between its alphabetical neighbours', () => {
    const guests = [
      n('Jean', 'PONCHON'),
      n('Marie', 'PRESLE', 'de la'),
      n('Luc', 'PORTIER'),
      n('Anne', 'PRUNELE'),
    ];
    const sorted = [...guests].sort((a, b) => key(a).localeCompare(key(b)));
    expect(sorted.map((g) => g.lastName)).toEqual(['PONCHON', 'PORTIER', 'PRESLE', 'PRUNELE']);
    expect(formatGuestName(sorted[2] as never)).toBe('DE LA PRESLE Marie');
  });
});

const guestOf = (
  id: string,
  extra: Partial<{ companionId: string | null; rsvpStatus: string; rsvpDate: string | null }> = {},
) =>
  ({
    id,
    firstName: id,
    lastName: id.toUpperCase(),
    companionId: null,
    rsvpStatus: 'PENDING',
    rsvpDate: null,
    ...extra,
  }) as any;

describe('removeGuests — the batch IS the sequence of single removals', () => {
  const roster = () => [
    guestOf('a', { companionId: 'b' }),
    guestOf('b', { companionId: 'a' }),
    guestOf('c', { companionId: 'd' }),
    guestOf('d', { companionId: 'c' }),
    guestOf('e'),
    guestOf('f'),
  ];
  const targets = ['a', 'c', 'd', 'e'];

  // `updatedAt` carries the removal instant: it differs from one run to the
  // next, and is not what the equivalence claims.
  const withoutTimestamps = (guests: any[]) =>
    guests.map(({ updatedAt, ...rest }) => rest);

  it('yields the same state as the sequence of removeGuest calls', () => {
    const batched = removeGuests(roster(), targets);
    const oneByOne = targets.reduce((gs, id) => removeGuest(gs, id), roster());
    expect(withoutTimestamps(batched)).toEqual(withoutTimestamps(oneByOne));
  });

  it('a companion left alone loses its companion link', () => {
    const remaining = removeGuests(roster(), targets);
    expect(remaining.map((g) => g.id)).toEqual(['b', 'f']);
    expect(remaining.find((g) => g.id === 'b')?.companionId).toBeNull();
  });

  it('a couple removed whole leaves no dangling link', () => {
    const remaining = removeGuests(roster(), ['c', 'd']);
    expect(remaining.some((g) => g.companionId === 'c' || g.companionId === 'd')).toBe(false);
  });

  it('a batch of one is the single removal', () => {
    expect(withoutTimestamps(removeGuests(roster(), ['a']))).toEqual(
      withoutTimestamps(removeGuest(roster(), 'a')),
    );
  });

  it('an empty batch touches nothing', () => {
    const start = roster();
    expect(removeGuests(start, [])).toBe(start);
  });
});

describe('applyGuestUpdates', () => {
  it('two guests in one batch can receive different fragments', () => {
    const guests = [guestOf('a'), guestOf('b'), guestOf('c')];
    const after = applyGuestUpdates(guests, ['a', 'b'], (g) => ({
      rsvpStatus: g.id === 'a' ? 'ACCEPTED' : 'DECLINED',
    }));
    expect(after.map((g) => g.rsvpStatus)).toEqual(['ACCEPTED', 'DECLINED', 'PENDING']);
  });

  it('stamps `updatedAt` on the batched guests only', () => {
    const guests = [guestOf('a'), guestOf('b')];
    const after = applyGuestUpdates(guests, ['a'], () => ({ rsvpStatus: 'ACCEPTED' }));
    expect(after[0].updatedAt).toEqual(expect.any(String));
    expect(after[1].updatedAt).toBeUndefined();
  });

  it('an id absent from the list creates nothing', () => {
    const guests = [guestOf('a')];
    expect(applyGuestUpdates(guests, ['zzz'], () => ({ rsvpStatus: 'ACCEPTED' }))).toHaveLength(1);
  });
});

describe('rsvpStatusUpdate — the guest-record rule, applied per guest', () => {
  const NOW = '2026-08-20T12:00:00.000Z';
  const EARLIER = '2026-01-02T09:00:00.000Z';

  it('already in the target state: the existing date is kept', () => {
    const g = guestOf('a', { rsvpStatus: 'ACCEPTED', rsvpDate: EARLIER });
    expect(rsvpStatusUpdate(g, 'ACCEPTED', NOW)).toEqual({
      rsvpStatus: 'ACCEPTED',
      rsvpDate: EARLIER,
    });
  });

  it('pending to accepted: stamped', () => {
    const g = guestOf('a', { rsvpStatus: 'PENDING', rsvpDate: null });
    expect(rsvpStatusUpdate(g, 'ACCEPTED', NOW)).toEqual({
      rsvpStatus: 'ACCEPTED',
      rsvpDate: NOW,
    });
  });

  it('accepted to declined: re-stamped', () => {
    const g = guestOf('a', { rsvpStatus: 'ACCEPTED', rsvpDate: EARLIER });
    expect(rsvpStatusUpdate(g, 'DECLINED', NOW)).toEqual({
      rsvpStatus: 'DECLINED',
      rsvpDate: NOW,
    });
  });

  it('going back to pending never stamps', () => {
    const g = guestOf('a', { rsvpStatus: 'ACCEPTED', rsvpDate: EARLIER });
    expect(rsvpStatusUpdate(g, 'PENDING', NOW)).toEqual({
      rsvpStatus: 'PENDING',
      rsvpDate: EARLIER,
    });
  });
});

