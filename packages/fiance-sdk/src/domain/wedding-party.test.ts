import { describe, it, expect } from 'vitest';
import type { WeddingRoleAssignment } from './schema.js';
import {
  addRoleAssignment,
  updateRoleAssignment,
  removeRoleAssignment,
  detachGuestFromRoles,
} from './wedding-party.js';

function makeRole(overrides: Partial<WeddingRoleAssignment> = {}): WeddingRoleAssignment {
  return {
    id: 'r1',
    role: 'WITNESS',
    guestId: 'g1',
    displayName: '',
    phone: null,
    email: null,
    notes: null,
    sortOrder: null,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  };
}

describe('addRoleAssignment', () => {
  it('appends to list', () => {
    const result = addRoleAssignment([], makeRole());
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('r1');
  });
});

describe('updateRoleAssignment', () => {
  it('updates matching entry and stamps updatedAt', () => {
    const result = updateRoleAssignment([makeRole()], 'r1', { displayName: 'Alice' });
    expect(result[0].displayName).toBe('Alice');
    expect(result[0].updatedAt).not.toBeNull();
  });

  it('ignores non-matching id', () => {
    const result = updateRoleAssignment([makeRole()], 'other', { displayName: 'X' });
    expect(result[0].displayName).toBe('');
  });
});

describe('removeRoleAssignment', () => {
  it('removes matching entry', () => {
    const result = removeRoleAssignment([makeRole(), makeRole({ id: 'r2' })], 'r1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('r2');
  });
});

describe('detachGuestFromRoles', () => {
  it('nulls guestId and copies in the display name, keeping the row', () => {
    const result = detachGuestFromRoles([makeRole({ guestId: 'g1' })], 'g1', 'Alice Durand');
    expect(result).toHaveLength(1);
    expect(result[0].guestId).toBeNull();
    expect(result[0].displayName).toBe('Alice Durand');
  });

  it('does not touch assignments for other guests', () => {
    const result = detachGuestFromRoles([makeRole({ guestId: 'g2' })], 'g1', 'Alice');
    expect(result[0].guestId).toBe('g2');
  });
});
