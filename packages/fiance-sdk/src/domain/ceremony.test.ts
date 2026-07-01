import { describe, it, expect } from 'vitest';
import type { CeremonyItem } from './schema.js';
import { addCeremonyItem, updateCeremonyItem, removeCeremonyItem, removeCeremonyItemsForEvent } from './ceremony.js';

function makeItem(overrides: Partial<CeremonyItem> = {}): CeremonyItem {
  return {
    id: 'item1',
    eventId: null,
    kind: 'READING',
    title: 'Lecture 1',
    reference: null,
    content: null,
    guestId: null,
    performerName: null,
    roleId: null,
    notes: null,
    sortOrder: null,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  };
}

describe('addCeremonyItem', () => {
  it('appends to list', () => {
    const result = addCeremonyItem([], makeItem());
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('item1');
  });
});

describe('updateCeremonyItem', () => {
  it('updates matching entry and stamps updatedAt', () => {
    const result = updateCeremonyItem([makeItem()], 'item1', { title: 'Lecture modifiée' });
    expect(result[0].title).toBe('Lecture modifiée');
    expect(result[0].updatedAt).not.toBeNull();
  });

  it('ignores non-matching id', () => {
    const result = updateCeremonyItem([makeItem()], 'other', { title: 'X' });
    expect(result[0].title).toBe('Lecture 1');
  });
});

describe('removeCeremonyItem', () => {
  it('removes matching entry', () => {
    const result = removeCeremonyItem([makeItem(), makeItem({ id: 'item2' })], 'item1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('item2');
  });
});

describe('removeCeremonyItemsForEvent', () => {
  it('drops items linked to the deleted event', () => {
    const result = removeCeremonyItemsForEvent(
      [makeItem({ eventId: 'event1' }), makeItem({ id: 'item2', eventId: 'event2' })],
      'event1',
    );
    expect(result).toHaveLength(1);
    expect(result[0].eventId).toBe('event2');
  });
});
