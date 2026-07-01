import type { GuestMealSelection } from './schema.js';

export function addMealSelection(
  selections: GuestMealSelection[],
  selection: GuestMealSelection,
): GuestMealSelection[] {
  return [...selections, selection];
}

export function updateMealSelection(
  selections: GuestMealSelection[],
  id: string,
  updates: Partial<GuestMealSelection>,
): GuestMealSelection[] {
  const now = new Date().toISOString();
  return selections.map((s) => (s.id === id ? { ...s, ...updates, updatedAt: now } : s));
}

export function removeMealSelection(selections: GuestMealSelection[], id: string): GuestMealSelection[] {
  return selections.filter((s) => s.id !== id);
}

/** Guest deleted: their meal selections go with them. */
export function removeMealSelectionsForGuest(
  selections: GuestMealSelection[],
  guestId: string,
): GuestMealSelection[] {
  return selections.filter((s) => s.guestId !== guestId);
}

/** WeddingEvent deleted: null the FK instead of dropping the selection. */
export function detachEventFromMealSelections(
  selections: GuestMealSelection[],
  eventId: string,
): GuestMealSelection[] {
  const now = new Date().toISOString();
  return selections.map((s) => (s.eventId === eventId ? { ...s, eventId: null, updatedAt: now } : s));
}
