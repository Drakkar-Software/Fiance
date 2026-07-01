import type { CeremonyItem } from './schema.js';

// ─── Ceremony program (liturgy) items ───────────────────────────────────────

export function addCeremonyItem(items: CeremonyItem[], item: CeremonyItem): CeremonyItem[] {
  return [...items, item];
}

export function updateCeremonyItem(
  items: CeremonyItem[],
  id: string,
  updates: Partial<CeremonyItem>,
): CeremonyItem[] {
  const now = new Date().toISOString();
  return items.map((i) => (i.id === id ? { ...i, ...updates, updatedAt: now } : i));
}

export function removeCeremonyItem(items: CeremonyItem[], id: string): CeremonyItem[] {
  return items.filter((i) => i.id !== id);
}

/** Wedding event deleted: its ceremony items no longer belong anywhere, so drop them. */
export function removeCeremonyItemsForEvent(items: CeremonyItem[], eventId: string): CeremonyItem[] {
  return items.filter((i) => i.eventId !== eventId);
}
