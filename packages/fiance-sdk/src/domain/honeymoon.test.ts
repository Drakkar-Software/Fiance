import { describe, it, expect } from 'vitest';
import type { HoneymoonPlan } from './schema.js';
import { setHoneymoonPlan, updateHoneymoonPlan, removeHoneymoonPlan, getHoneymoonPlan } from './honeymoon.js';

function makePlan(overrides: Partial<HoneymoonPlan> = {}): HoneymoonPlan {
  return {
    id: 'hp1',
    destination: 'Toscane',
    startDate: '2026-09-15',
    endDate: '2026-09-22',
    budgetTarget: 3500,
    spentAmount: null,
    notes: null,
    itinerary: null,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  };
}

describe('setHoneymoonPlan', () => {
  it('enforces a single row, replacing any existing plan', () => {
    const first = setHoneymoonPlan([], makePlan({ id: 'hp1' }));
    expect(first).toHaveLength(1);
    const replaced = setHoneymoonPlan(first, makePlan({ id: 'hp2', destination: 'Bali' }));
    expect(replaced).toHaveLength(1);
    expect(replaced[0].id).toBe('hp2');
  });
});

describe('updateHoneymoonPlan', () => {
  it('updates the single row and stamps updatedAt', () => {
    const plans = setHoneymoonPlan([], makePlan());
    const updated = updateHoneymoonPlan(plans, { destination: 'Bali' });
    expect(updated[0].destination).toBe('Bali');
    expect(updated[0].updatedAt).not.toBeNull();
  });

  it('is a no-op when there is no plan yet', () => {
    expect(updateHoneymoonPlan([], { destination: 'Bali' })).toEqual([]);
  });
});

describe('removeHoneymoonPlan / getHoneymoonPlan', () => {
  it('removes the plan and getHoneymoonPlan returns null', () => {
    const plans = setHoneymoonPlan([], makePlan());
    expect(getHoneymoonPlan(plans)?.id).toBe('hp1');
    expect(getHoneymoonPlan(removeHoneymoonPlan(plans))).toBeNull();
  });
});
