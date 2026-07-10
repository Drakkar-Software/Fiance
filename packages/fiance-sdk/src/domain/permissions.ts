/**
 * Collaborator permissions — pure domain logic (no store / RN deps).
 *
 * An owner defines *roles* (a per-feature permission matrix) and *assigns* a role to
 * each invited collaborator. The role travels to the member over sync; the member's
 * client resolves it into a matrix and gates its UI. See COLLAB_RIGHTS_PLAN.md.
 *
 * Enforcement is layered — a role declares its `tier`:
 *   - "app-cosmetic": client-side UX gating only (Phase 1)
 *   - "app-readonly": + server-enforced read-only via the invite `write=false` cap (Phase 2)
 *   - "app-scoped" | "web-view" | "app-crypto": reserved for Phases 3–5, not built yet.
 */

/** The feature surfaces a role can grant access to (map onto the app's tabs). */
export type FeatureSurface = 'guests' | 'vendors' | 'planning' | 'budget' | 'ideas' | 'gifts';

export type PermissionAction = 'view' | 'edit';

/** A role's grants. An absent surface means "no access" (the tab is hidden). */
export type PermissionMatrix = Partial<Record<FeatureSurface, PermissionAction>>;

export type RoleTier =
  | 'app-cosmetic'
  | 'app-readonly'
  | 'app-scoped'
  | 'web-view'
  | 'app-crypto';

export const FEATURE_SURFACES: FeatureSurface[] = [
  'guests',
  'vendors',
  'planning',
  'budget',
  'ideas',
  'gifts',
];

export interface RoleDefinition {
  id: string;
  /** Custom roles: literal name. System roles: an i18n key the UI resolves. */
  name: string;
  isSystem: boolean;
  tier: RoleTier;
  matrix: PermissionMatrix;
  createdAt: string | null;
  updatedAt: string | null;
}

/** Binds an invited collaborator (by their user id) to a role. */
export interface PermissionAssignment {
  id: string;
  /** The invite's ephemeral `inviteUserId` (primary) — or a real member userId. */
  subjectUserId: string;
  roleId: string;
  /** Optional owner note, e.g. "Wedding planner Marie". */
  label: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

/**
 * System roles seeded when the collection is empty. `name` holds an i18n key
 * (resolved in the UI); custom roles store a literal name instead.
 */
export const DEFAULT_PERMISSION_ROLES: Omit<RoleDefinition, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'role-editor',
    name: 'roleEditorName',
    isSystem: true,
    tier: 'app-cosmetic',
    matrix: {
      guests: 'edit',
      vendors: 'edit',
      planning: 'edit',
      budget: 'edit',
      ideas: 'edit',
      gifts: 'edit',
    },
  },
  {
    id: 'role-viewer',
    name: 'roleViewerName',
    isSystem: true,
    tier: 'app-readonly',
    matrix: {
      guests: 'view',
      vendors: 'view',
      planning: 'view',
      budget: 'view',
      ideas: 'view',
      gifts: 'view',
    },
  },
  {
    id: 'role-planner',
    name: 'rolePlannerName',
    isSystem: true,
    tier: 'app-readonly',
    matrix: { planning: 'view', vendors: 'view', budget: 'view' },
  },
];

/**
 * Whether a collaborator with this role should receive a write-capable invite cap.
 * Read-only / web-view roles never write. Otherwise it's writable iff any surface
 * is granted "edit".
 */
export function roleCanWrite(role: RoleDefinition): boolean {
  if (role.tier === 'app-readonly' || role.tier === 'web-view' || role.tier === 'app-crypto') {
    return false;
  }
  return Object.values(role.matrix).some((a) => a === 'edit');
}

/** True if the matrix grants at least `action` on `surface`. */
export function matrixAllows(
  matrix: PermissionMatrix,
  surface: FeatureSurface,
  action: PermissionAction = 'edit',
): boolean {
  const level = matrix[surface];
  if (!level) return false;
  return action === 'view' ? true : level === 'edit';
}

// ─── Pure reducers (store delegates to these) ─────────────────────────────────

export function addPermissionRole(roles: RoleDefinition[], role: RoleDefinition): RoleDefinition[] {
  return [...roles, role];
}

export function updatePermissionRole(
  roles: RoleDefinition[],
  id: string,
  updates: Partial<RoleDefinition>,
  now: string,
): RoleDefinition[] {
  return roles.map((r) => (r.id === id ? { ...r, ...updates, updatedAt: now } : r));
}

export function removePermissionRole(roles: RoleDefinition[], id: string): RoleDefinition[] {
  return roles.filter((r) => r.id !== id);
}

/** Insert or replace the assignment for a subject (one role per collaborator). */
export function upsertPermissionAssignment(
  assignments: PermissionAssignment[],
  next: PermissionAssignment,
): PermissionAssignment[] {
  const rest = assignments.filter((a) => a.subjectUserId !== next.subjectUserId && a.id !== next.id);
  return [...rest, next];
}

export function removePermissionAssignment(
  assignments: PermissionAssignment[],
  id: string,
): PermissionAssignment[] {
  return assignments.filter((a) => a.id !== id);
}

export function removeAssignmentsForRole(
  assignments: PermissionAssignment[],
  roleId: string,
): PermissionAssignment[] {
  return assignments.filter((a) => a.roleId !== roleId);
}

/**
 * Resolve a subject's role + matrix. Returns null when the subject has no
 * assignment or the referenced role is gone — callers treat null as "unrestricted"
 * so a member is never accidentally locked out.
 */
export function resolvePermissionForSubject(
  roles: RoleDefinition[],
  assignments: PermissionAssignment[],
  subjectUserId: string,
): { role: RoleDefinition; matrix: PermissionMatrix } | null {
  const assignment = assignments.find((a) => a.subjectUserId === subjectUserId);
  if (!assignment) return null;
  const role = roles.find((r) => r.id === assignment.roleId);
  if (!role) return null;
  return { role, matrix: role.matrix };
}
