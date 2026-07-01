import { describe, it, expect } from 'vitest';
import type { WeddingRole, WeddingRoleAssignment } from './schema.js';
import {
  addWeddingRole,
  updateWeddingRole,
  removeWeddingRole,
  addRoleAssignment,
  updateRoleAssignment,
  removeRoleAssignment,
  removeRoleAssignmentsForGuest,
  removeRoleAssignmentsForRole,
  migrateRoleAssignments,
} from './wedding-party.js';

function makeRoleDef(overrides: Partial<WeddingRole> = {}): WeddingRole {
  return {
    id: 'role1',
    name: 'Témoin',
    sortOrder: null,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  };
}

function makeAssignment(overrides: Partial<WeddingRoleAssignment> = {}): WeddingRoleAssignment {
  return {
    id: 'r1',
    roleId: 'role1',
    guestId: 'g1',
    notes: null,
    sortOrder: null,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  };
}

describe('addWeddingRole', () => {
  it('appends to list', () => {
    const result = addWeddingRole([], makeRoleDef());
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('role1');
  });
});

describe('updateWeddingRole', () => {
  it('updates matching entry and stamps updatedAt', () => {
    const result = updateWeddingRole([makeRoleDef()], 'role1', { name: 'Témoin d\'honneur' });
    expect(result[0].name).toBe('Témoin d\'honneur');
    expect(result[0].updatedAt).not.toBeNull();
  });

  it('ignores non-matching id', () => {
    const result = updateWeddingRole([makeRoleDef()], 'other', { name: 'X' });
    expect(result[0].name).toBe('Témoin');
  });
});

describe('removeWeddingRole', () => {
  it('removes matching entry', () => {
    const result = removeWeddingRole([makeRoleDef(), makeRoleDef({ id: 'role2' })], 'role1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('role2');
  });
});

describe('addRoleAssignment', () => {
  it('appends to list', () => {
    const result = addRoleAssignment([], makeAssignment());
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('r1');
  });
});

describe('updateRoleAssignment', () => {
  it('updates matching entry and stamps updatedAt', () => {
    const result = updateRoleAssignment([makeAssignment()], 'r1', { notes: 'note' });
    expect(result[0].notes).toBe('note');
    expect(result[0].updatedAt).not.toBeNull();
  });

  it('ignores non-matching id', () => {
    const result = updateRoleAssignment([makeAssignment()], 'other', { notes: 'note' });
    expect(result[0].notes).toBeNull();
  });
});

describe('removeRoleAssignment', () => {
  it('removes matching entry', () => {
    const result = removeRoleAssignment([makeAssignment(), makeAssignment({ id: 'r2' })], 'r1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('r2');
  });
});

describe('removeRoleAssignmentsForGuest', () => {
  it('drops assignments for the deleted guest', () => {
    const result = removeRoleAssignmentsForGuest(
      [makeAssignment({ guestId: 'g1' }), makeAssignment({ id: 'r2', guestId: 'g2' })],
      'g1',
    );
    expect(result).toHaveLength(1);
    expect(result[0].guestId).toBe('g2');
  });
});

describe('removeRoleAssignmentsForRole', () => {
  it('drops assignments for the deleted role', () => {
    const result = removeRoleAssignmentsForRole(
      [makeAssignment({ roleId: 'role1' }), makeAssignment({ id: 'r2', roleId: 'role2' })],
      'role1',
    );
    expect(result).toHaveLength(1);
    expect(result[0].roleId).toBe('role2');
  });
});

describe('migrateRoleAssignments', () => {
  it('is a no-op when assignments are already in the new shape', () => {
    const result = migrateRoleAssignments([makeAssignment()]);
    expect(result.roles).toHaveLength(0);
    expect(result.assignments).toEqual([makeAssignment()]);
  });

  it('is a no-op on an empty list', () => {
    const result = migrateRoleAssignments([]);
    expect(result.roles).toHaveLength(0);
    expect(result.assignments).toHaveLength(0);
  });

  it('derives a role catalog from legacy enum values and remaps assignments', () => {
    const legacy = [
      { id: 'r1', role: 'WITNESS', guestId: 'g1', displayName: '', phone: null, email: null, notes: null, sortOrder: 1, createdAt: 't1', updatedAt: 't1' },
      { id: 'r2', role: 'WITNESS', guestId: 'g2', displayName: '', phone: null, email: null, notes: null, sortOrder: 2, createdAt: 't1', updatedAt: 't1' },
      { id: 'r3', role: 'BRIDESMAID', guestId: 'g3', displayName: '', phone: null, email: null, notes: null, sortOrder: 3, createdAt: 't1', updatedAt: 't1' },
    ];
    const result = migrateRoleAssignments(legacy);
    expect(result.roles.map((r) => r.name)).toEqual(['Témoin', "Demoiselle d'honneur"]);
    expect(result.assignments).toHaveLength(3);
    const witnessRoleId = result.roles.find((r) => r.name === 'Témoin')!.id;
    expect(result.assignments[0].roleId).toBe(witnessRoleId);
    expect(result.assignments[1].roleId).toBe(witnessRoleId);
  });

  it('drops former external (non-guest) entries', () => {
    const legacy = [
      { id: 'r1', role: 'OFFICIANT', guestId: null, displayName: 'Élodie Martin', phone: null, email: null, notes: null, sortOrder: 1, createdAt: 't1', updatedAt: 't1' },
      { id: 'r2', role: 'WITNESS', guestId: 'g1', displayName: '', phone: null, email: null, notes: null, sortOrder: 2, createdAt: 't1', updatedAt: 't1' },
    ];
    const result = migrateRoleAssignments(legacy);
    expect(result.assignments).toHaveLength(1);
    expect(result.assignments[0].guestId).toBe('g1');
  });
});
