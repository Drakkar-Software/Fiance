import type { Guest, SeatingConstraint, Table } from './schema.js';

export function addSeatingConstraint(
  constraints: SeatingConstraint[],
  constraint: SeatingConstraint,
): SeatingConstraint[] {
  return [...constraints, constraint];
}

export function updateSeatingConstraint(
  constraints: SeatingConstraint[],
  id: string,
  updates: Partial<SeatingConstraint>,
): SeatingConstraint[] {
  const now = new Date().toISOString();
  return constraints.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: now } : c));
}

export function removeSeatingConstraint(constraints: SeatingConstraint[], id: string): SeatingConstraint[] {
  return constraints.filter((c) => c.id !== id);
}

/** Guest deleted: strip them from every constraint; drop constraints left with < 2 guests. */
export function detachGuestFromConstraints(
  constraints: SeatingConstraint[],
  guestId: string,
): SeatingConstraint[] {
  const now = new Date().toISOString();
  return constraints
    .map((c) =>
      c.guestIds.includes(guestId)
        ? { ...c, guestIds: c.guestIds.filter((id) => id !== guestId), updatedAt: now }
        : c,
    )
    .filter((c) => c.guestIds.length >= 2);
}

export interface SeatingViolation {
  constraintId: string;
  type: SeatingConstraint['type'];
  label: string | null;
  isHard: boolean;
  guestIds: string[];
}

/** Violations for a single constraint, given current guest table assignments. */
export function getConstraintViolations(constraint: SeatingConstraint, guests: Guest[]): SeatingViolation[] {
  const byId = new Map(guests.map((g) => [g.id, g]));
  const seated = constraint.guestIds
    .map((id) => byId.get(id))
    .filter((g): g is Guest => !!g && !!g.tableId);

  if (constraint.type === 'MUST_SIT_TOGETHER') {
    const tableIds = new Set(seated.map((g) => g.tableId));
    if (seated.length >= 2 && tableIds.size > 1) {
      return [{
        constraintId: constraint.id,
        type: constraint.type,
        label: constraint.label,
        isHard: constraint.isHard ?? false,
        guestIds: constraint.guestIds,
      }];
    }
    return [];
  }

  // MUST_NOT_SIT_TOGETHER
  const byTable = new Map<string, Guest[]>();
  for (const g of seated) {
    const list = byTable.get(g.tableId as string) ?? [];
    list.push(g);
    byTable.set(g.tableId as string, list);
  }
  const violated = [...byTable.values()].some((list) => list.length >= 2);
  if (violated) {
    return [{
      constraintId: constraint.id,
      type: constraint.type,
      label: constraint.label,
      isHard: constraint.isHard ?? false,
      guestIds: constraint.guestIds,
    }];
  }
  return [];
}

/** Validate the whole seating plan against all constraints. Pure; no auto-solver. */
export function validateSeatingPlan(
  guests: Guest[],
  _tables: Table[],
  constraints: SeatingConstraint[],
): { ok: boolean; violations: SeatingViolation[] } {
  const violations = constraints.flatMap((c) => getConstraintViolations(c, guests));
  return { ok: violations.length === 0, violations };
}
