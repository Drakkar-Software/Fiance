import type { Wedding, WeddingEvent } from './schema.js';

export function addWeddingEvent(events: WeddingEvent[], event: WeddingEvent): WeddingEvent[] {
  return [...events, event];
}

export function updateWeddingEvent(
  events: WeddingEvent[],
  id: string,
  updates: Partial<WeddingEvent>,
): WeddingEvent[] {
  const now = new Date().toISOString();
  return events.map((e) => (e.id === id ? { ...e, ...updates, updatedAt: now } : e));
}

export function removeWeddingEvent(events: WeddingEvent[], id: string): WeddingEvent[] {
  return events.filter((e) => e.id !== id);
}

/** The event that drives the dashboard countdown: the flagged primary, or the first row. */
export function getPrimaryEvent(events: WeddingEvent[]): WeddingEvent | null {
  return events.find((e) => e.isPrimary) ?? events[0] ?? null;
}

/**
 * v8 → v9 auto-migration: when a wedding has no WeddingEvent rows yet, synthesize
 * one primary event from the legacy wedding.weddingDate/venueName fields so the
 * multi-event UI has something to show without disrupting existing weddings.
 */
export function synthesizePrimaryEvent(wedding: Wedding | null): WeddingEvent | null {
  if (!wedding?.weddingDate) return null;
  const now = new Date().toISOString();
  return {
    id: `synthetic-primary-${wedding.id}`,
    type: 'DINNER',
    title: wedding.venueName || '',
    date: wedding.weddingDate,
    startTime: null,
    endTime: null,
    venueName: wedding.venueName,
    address: null,
    notes: null,
    isPrimary: true,
    isPublic: true,
    sortOrder: 1,
    createdAt: now,
    updatedAt: now,
  };
}
