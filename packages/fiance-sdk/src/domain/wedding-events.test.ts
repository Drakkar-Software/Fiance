import { describe, it, expect } from 'vitest';
import type { Wedding, WeddingEvent } from './schema.js';
import {
  addWeddingEvent,
  updateWeddingEvent,
  removeWeddingEvent,
  getPrimaryEvent,
  synthesizePrimaryEvent,
} from './wedding-events.js';

function makeEvent(overrides: Partial<WeddingEvent> = {}): WeddingEvent {
  return {
    id: 'e1',
    type: 'DINNER',
    title: 'Réception',
    date: '2026-09-12',
    startTime: null,
    endTime: null,
    venueName: null,
    address: null,
    notes: null,
    isPrimary: null,
    isPublic: null,
    sortOrder: null,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  };
}

describe('addWeddingEvent / updateWeddingEvent / removeWeddingEvent', () => {
  it('adds, updates, removes', () => {
    const added = addWeddingEvent([], makeEvent());
    expect(added).toHaveLength(1);
    const updated = updateWeddingEvent(added, 'e1', { title: 'Cérémonie' });
    expect(updated[0].title).toBe('Cérémonie');
    expect(updated[0].updatedAt).not.toBeNull();
    const removed = removeWeddingEvent(updated, 'e1');
    expect(removed).toHaveLength(0);
  });
});

describe('getPrimaryEvent', () => {
  it('returns the flagged primary event', () => {
    const events = [makeEvent({ id: 'e1', isPrimary: false }), makeEvent({ id: 'e2', isPrimary: true })];
    expect(getPrimaryEvent(events)?.id).toBe('e2');
  });

  it('falls back to the first event when none is flagged primary', () => {
    const events = [makeEvent({ id: 'e1' }), makeEvent({ id: 'e2' })];
    expect(getPrimaryEvent(events)?.id).toBe('e1');
  });

  it('returns null for an empty list', () => {
    expect(getPrimaryEvent([])).toBeNull();
  });
});

describe('synthesizePrimaryEvent', () => {
  const wedding: Wedding = {
    id: 1,
    partner1Name: 'A',
    partner2Name: 'B',
    weddingDate: '2026-09-12',
    venueName: 'Domaine des Oliviers',
    description: null,
    faq: null,
    eventPhotos: null,
    budgetTarget: null,
    categoryBudgets: null,
    currency: null,
    createdAt: null,
    updatedAt: null,
  };

  it('builds a primary+public event from the wedding row', () => {
    const event = synthesizePrimaryEvent(wedding);
    expect(event?.date).toBe('2026-09-12');
    expect(event?.venueName).toBe('Domaine des Oliviers');
    expect(event?.isPrimary).toBe(true);
    expect(event?.isPublic).toBe(true);
  });

  it('returns null when the wedding has no date', () => {
    expect(synthesizePrimaryEvent({ ...wedding, weddingDate: null })).toBeNull();
  });

  it('returns null for a null wedding', () => {
    expect(synthesizePrimaryEvent(null)).toBeNull();
  });
});
