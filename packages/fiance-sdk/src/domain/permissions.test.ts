import { describe, it, expect } from 'vitest';
import {
  DEFAULT_PERMISSION_ROLES,
  FEATURE_SURFACES,
  roleCanWrite,
  matrixAllows,
  addPermissionRole,
  updatePermissionRole,
  removePermissionRole,
  upsertPermissionAssignment,
  removePermissionAssignment,
  removeAssignmentsForRole,
  resolvePermissionForSubject,
  type RoleDefinition,
  type PermissionAssignment,
} from './permissions.js';

const now = '2026-07-08T00:00:00.000Z';

function role(overrides: Partial<RoleDefinition> = {}): RoleDefinition {
  return {
    id: 'r1',
    name: 'Custom',
    isSystem: false,
    tier: 'app-cosmetic',
    matrix: {},
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function assignment(overrides: Partial<PermissionAssignment> = {}): PermissionAssignment {
  return { id: 'a1', subjectUserId: 'u1', roleId: 'r1', label: null, createdAt: now, updatedAt: now, ...overrides };
}

describe('DEFAULT_PERMISSION_ROLES', () => {
  it('ships editor (writable), viewer + planner (read-only)', () => {
    const ids = DEFAULT_PERMISSION_ROLES.map((r) => r.id);
    expect(ids).toEqual(['role-editor', 'role-viewer', 'role-planner']);
    const editor = DEFAULT_PERMISSION_ROLES.find((r) => r.id === 'role-editor')!;
    const viewer = DEFAULT_PERMISSION_ROLES.find((r) => r.id === 'role-viewer')!;
    const planner = DEFAULT_PERMISSION_ROLES.find((r) => r.id === 'role-planner')!;
    expect(editor.tier).toBe('app-cosmetic');
    expect(viewer.tier).toBe('app-readonly');
    expect(planner.tier).toBe('app-readonly');
    // editor grants edit on every surface; viewer view on every surface.
    for (const s of FEATURE_SURFACES) {
      expect(editor.matrix[s]).toBe('edit');
      expect(viewer.matrix[s]).toBe('view');
    }
    // planner is scoped: no guests / ideas.
    expect(planner.matrix.guests).toBeUndefined();
    expect(planner.matrix.ideas).toBeUndefined();
    expect(planner.matrix.planning).toBe('view');
  });
});

describe('roleCanWrite', () => {
  it('is true only for a tier that can write AND has an edit grant', () => {
    expect(roleCanWrite(role({ tier: 'app-cosmetic', matrix: { guests: 'edit' } }))).toBe(true);
    expect(roleCanWrite(role({ tier: 'app-cosmetic', matrix: { guests: 'view' } }))).toBe(false);
    expect(roleCanWrite(role({ tier: 'app-readonly', matrix: { guests: 'edit' } }))).toBe(false);
    expect(roleCanWrite(role({ tier: 'web-view', matrix: { guests: 'edit' } }))).toBe(false);
    expect(roleCanWrite(role({ tier: 'app-crypto', matrix: { guests: 'edit' } }))).toBe(false);
    expect(roleCanWrite(role({ tier: 'app-cosmetic', matrix: {} }))).toBe(false);
  });
  it('matches the shipped defaults', () => {
    expect(roleCanWrite(DEFAULT_PERMISSION_ROLES.find((r) => r.id === 'role-editor')! as RoleDefinition)).toBe(true);
    expect(roleCanWrite(DEFAULT_PERMISSION_ROLES.find((r) => r.id === 'role-viewer')! as RoleDefinition)).toBe(false);
  });
});

describe('matrixAllows', () => {
  it('view is granted by view or edit; edit only by edit', () => {
    expect(matrixAllows({ guests: 'view' }, 'guests', 'view')).toBe(true);
    expect(matrixAllows({ guests: 'view' }, 'guests', 'edit')).toBe(false);
    expect(matrixAllows({ guests: 'edit' }, 'guests', 'edit')).toBe(true);
    expect(matrixAllows({ guests: 'edit' }, 'guests', 'view')).toBe(true);
    expect(matrixAllows({}, 'guests', 'view')).toBe(false);
    expect(matrixAllows({ vendors: 'edit' }, 'guests', 'view')).toBe(false);
  });
});

describe('role reducers', () => {
  it('adds, updates (bumping updatedAt), and removes roles', () => {
    const a = addPermissionRole([], role({ id: 'x' }));
    expect(a).toHaveLength(1);
    const later = '2026-07-09T00:00:00.000Z';
    const u = updatePermissionRole(a, 'x', { name: 'Renamed' }, later);
    expect(u[0].name).toBe('Renamed');
    expect(u[0].updatedAt).toBe(later);
    expect(removePermissionRole(u, 'x')).toHaveLength(0);
  });
});

describe('assignment reducers', () => {
  it('upsert replaces by subjectUserId (one role per collaborator)', () => {
    const first = upsertPermissionAssignment([], assignment({ id: 'a1', roleId: 'r1' }));
    const second = upsertPermissionAssignment(first, assignment({ id: 'a2', subjectUserId: 'u1', roleId: 'r2' }));
    expect(second).toHaveLength(1);
    expect(second[0].id).toBe('a2');
    expect(second[0].roleId).toBe('r2');
  });
  it('upsert keeps distinct subjects', () => {
    const list = upsertPermissionAssignment([assignment({ id: 'a1', subjectUserId: 'u1' })], assignment({ id: 'a2', subjectUserId: 'u2' }));
    expect(list).toHaveLength(2);
  });
  it('remove by id and by role', () => {
    const list = [assignment({ id: 'a1', roleId: 'r1' }), assignment({ id: 'a2', subjectUserId: 'u2', roleId: 'r2' })];
    expect(removePermissionAssignment(list, 'a1')).toHaveLength(1);
    expect(removeAssignmentsForRole(list, 'r1')).toEqual([list[1]]);
  });
});

describe('resolvePermissionForSubject', () => {
  const roles = [role({ id: 'r1', matrix: { guests: 'edit' } })];
  it('returns the role + matrix for an assigned subject', () => {
    const res = resolvePermissionForSubject(roles, [assignment({ subjectUserId: 'u1', roleId: 'r1' })], 'u1');
    expect(res?.role.id).toBe('r1');
    expect(res?.matrix).toEqual({ guests: 'edit' });
  });
  it('returns null when the subject has no assignment', () => {
    expect(resolvePermissionForSubject(roles, [], 'u1')).toBeNull();
  });
  it('returns null when the referenced role is gone', () => {
    expect(resolvePermissionForSubject([], [assignment({ subjectUserId: 'u1', roleId: 'r1' })], 'u1')).toBeNull();
  });
});
