import { describe, it, expect } from 'vitest';
import type { Guest, SeatingConstraint } from './schema.js';
import {
  addSeatingConstraint,
  updateSeatingConstraint,
  removeSeatingConstraint,
  detachGuestFromConstraints,
  getConstraintViolations,
  validateSeatingPlan,
} from './seating.js';

function makeConstraint(overrides: Partial<SeatingConstraint> = {}): SeatingConstraint {
  return {
    id: 'sc1',
    type: 'MUST_SIT_TOGETHER',
    guestIds: ['g1', 'g2'],
    label: null,
    isHard: null,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  };
}

function makeGuest(overrides: Partial<Guest> = {}): Guest {
  return {
    id: 'g1',
    firstName: 'A',
    lastName: 'B',
    side: null,
    invitationType: 'FULL',
    rsvpStatus: null,
    rsvpDate: null,
    isSleeping: null,
    childrenCount: null,
    diet: null,
    dietNotes: null,
    groupId: null,
    tableId: null,
    companionId: null,
    noTableNeeded: null,
    giftDescription: null,
    thankYouSent: null,
    thankYouSentDate: null,
    accommodationId: null,
    roomNumber: null,
    rsvpToken: null,
    email: null,
    phone: null,
    address: null,
    notes: null,
    shuttleVendorId: null,
    shuttlePickupLocation: null,
    shuttlePickupTime: null,
    parkingNeeded: null,
    parkingNotes: null,
    arrivalNotes: null,
    transportMode: null,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  };
}

describe('addSeatingConstraint / updateSeatingConstraint / removeSeatingConstraint', () => {
  it('adds, updates, removes', () => {
    const added = addSeatingConstraint([], makeConstraint());
    expect(added).toHaveLength(1);
    const updated = updateSeatingConstraint(added, 'sc1', { label: 'Famille' });
    expect(updated[0].label).toBe('Famille');
    expect(updated[0].updatedAt).not.toBeNull();
    const removed = removeSeatingConstraint(updated, 'sc1');
    expect(removed).toHaveLength(0);
  });
});

describe('detachGuestFromConstraints', () => {
  it('strips guest id from constraint guestIds', () => {
    const result = detachGuestFromConstraints([makeConstraint({ guestIds: ['g1', 'g2', 'g3'] })], 'g1');
    expect(result[0].guestIds).toEqual(['g2', 'g3']);
  });

  it('drops constraint when fewer than 2 guests remain', () => {
    const result = detachGuestFromConstraints([makeConstraint({ guestIds: ['g1', 'g2'] })], 'g1');
    expect(result).toHaveLength(0);
  });
});

describe('getConstraintViolations', () => {
  it('MUST_SIT_TOGETHER: violated when seated guests span different tables', () => {
    const guests = [makeGuest({ id: 'g1', tableId: 't1' }), makeGuest({ id: 'g2', tableId: 't2' })];
    const violations = getConstraintViolations(makeConstraint(), guests);
    expect(violations).toHaveLength(1);
  });

  it('MUST_SIT_TOGETHER: no violation when seated guests share a table', () => {
    const guests = [makeGuest({ id: 'g1', tableId: 't1' }), makeGuest({ id: 'g2', tableId: 't1' })];
    const violations = getConstraintViolations(makeConstraint(), guests);
    expect(violations).toHaveLength(0);
  });

  it('MUST_SIT_TOGETHER: no violation when fewer than 2 guests are seated yet', () => {
    const guests = [makeGuest({ id: 'g1', tableId: 't1' }), makeGuest({ id: 'g2', tableId: null })];
    const violations = getConstraintViolations(makeConstraint(), guests);
    expect(violations).toHaveLength(0);
  });

  it('MUST_NOT_SIT_TOGETHER: violated when both seated at the same table', () => {
    const guests = [makeGuest({ id: 'g1', tableId: 't1' }), makeGuest({ id: 'g2', tableId: 't1' })];
    const violations = getConstraintViolations(
      makeConstraint({ type: 'MUST_NOT_SIT_TOGETHER' }),
      guests,
    );
    expect(violations).toHaveLength(1);
  });

  it('MUST_NOT_SIT_TOGETHER: no violation across different tables', () => {
    const guests = [makeGuest({ id: 'g1', tableId: 't1' }), makeGuest({ id: 'g2', tableId: 't2' })];
    const violations = getConstraintViolations(
      makeConstraint({ type: 'MUST_NOT_SIT_TOGETHER' }),
      guests,
    );
    expect(violations).toHaveLength(0);
  });
});

describe('validateSeatingPlan', () => {
  it('aggregates violations across constraints', () => {
    const guests = [makeGuest({ id: 'g1', tableId: 't1' }), makeGuest({ id: 'g2', tableId: 't2' })];
    const result = validateSeatingPlan(guests, [], [makeConstraint()]);
    expect(result.ok).toBe(false);
    expect(result.violations).toHaveLength(1);
  });

  it('ok when no constraints violated', () => {
    const guests = [makeGuest({ id: 'g1', tableId: 't1' }), makeGuest({ id: 'g2', tableId: 't1' })];
    const result = validateSeatingPlan(guests, [], [makeConstraint()]);
    expect(result.ok).toBe(true);
    expect(result.violations).toHaveLength(0);
  });
});
