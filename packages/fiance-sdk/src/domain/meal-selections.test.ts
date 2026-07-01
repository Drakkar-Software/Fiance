import { describe, it, expect } from 'vitest';
import type { GuestMealSelection } from './schema.js';
import {
  addMealSelection,
  updateMealSelection,
  removeMealSelection,
  removeMealSelectionsForGuest,
  detachEventFromMealSelections,
} from './meal-selections.js';

function makeSelection(overrides: Partial<GuestMealSelection> = {}): GuestMealSelection {
  return {
    id: 'ms1',
    guestId: 'g1',
    eventId: null,
    mealChoice: 'STANDARD',
    courses: null,
    notes: null,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  };
}

describe('addMealSelection / updateMealSelection / removeMealSelection', () => {
  it('adds, updates, removes', () => {
    const added = addMealSelection([], makeSelection());
    expect(added).toHaveLength(1);
    const updated = updateMealSelection(added, 'ms1', { mealChoice: 'VEGETARIAN' });
    expect(updated[0].mealChoice).toBe('VEGETARIAN');
    expect(updated[0].updatedAt).not.toBeNull();
    const removed = removeMealSelection(updated, 'ms1');
    expect(removed).toHaveLength(0);
  });
});

describe('removeMealSelectionsForGuest', () => {
  it('drops selections for the removed guest, keeps others', () => {
    const selections = [makeSelection({ id: 'ms1', guestId: 'g1' }), makeSelection({ id: 'ms2', guestId: 'g2' })];
    const result = removeMealSelectionsForGuest(selections, 'g1');
    expect(result).toHaveLength(1);
    expect(result[0].guestId).toBe('g2');
  });
});

describe('detachEventFromMealSelections', () => {
  it('nulls eventId but keeps the selection row', () => {
    const selections = [makeSelection({ id: 'ms1', eventId: 'e1' })];
    const result = detachEventFromMealSelections(selections, 'e1');
    expect(result).toHaveLength(1);
    expect(result[0].eventId).toBeNull();
  });

  it('does not touch selections for other events', () => {
    const selections = [makeSelection({ id: 'ms1', eventId: 'e2' })];
    const result = detachEventFromMealSelections(selections, 'e1');
    expect(result[0].eventId).toBe('e2');
  });
});
