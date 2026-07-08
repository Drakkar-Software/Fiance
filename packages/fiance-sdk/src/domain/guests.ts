// NodeNext .js extension required
import type { Guest, Table, GuestGroup } from './schema.js';

export interface GuestCounts {
  total: number;
  accepted: number;
  declined: number;
  pending: number;
  maybe: number;
  cocktail_count: number;
  dinner_count: number;
  full_count: number;
  both_days_count: number;
  // Exact accepted count per invitation type (not cumulative), for per-invitation-type
  // vendor pricing. When nobody has accepted yet, these fall back to non-declined guests
  // of that type so pricing previews aren't all zero before RSVPs come in.
  inv_ceremony_count: number;
  inv_cocktail_count: number;
  inv_full_count: number;
  inv_both_days_count: number;
  children_count: number;
  vegetarian_count: number;
  sleeping_count: number;
  response_rate: number;
  no_table_count: number;
  no_accommodation_count: number;
  thank_you_pending_count: number;
}

export function computeCounts(guests: Guest[]): GuestCounts {
  const accepted = guests.filter((g) => g.rsvpStatus === "ACCEPTED");
  const total = guests.length;
  const declinedCount = guests.filter((g) => g.rsvpStatus === "DECLINED").length;
  const acceptedCount = accepted.length;

  // For per-invitation-type pricing: bill accepted guests of each exact type. Before any
  // RSVP (no accepted), estimate from non-declined guests so previews aren't all zero.
  const invPool = acceptedCount > 0 ? accepted : guests.filter((g) => g.rsvpStatus !== "DECLINED");
  const invOf = (type: string) => invPool.filter((g) => g.invitationType === type).length;

  return {
    total,
    accepted: acceptedCount,
    declined: declinedCount,
    pending: guests.filter((g) => g.rsvpStatus === "PENDING").length,
    maybe: guests.filter((g) => g.rsvpStatus === "MAYBE").length,
    cocktail_count: accepted.filter((g) =>
      ["COCKTAIL", "FULL", "BOTH_DAYS"].includes(g.invitationType)
    ).length,
    dinner_count: accepted.filter((g) =>
      ["FULL", "BOTH_DAYS"].includes(g.invitationType)
    ).length,
    full_count: accepted.filter((g) => g.invitationType === "FULL").length,
    both_days_count: accepted.filter((g) => g.invitationType === "BOTH_DAYS").length,
    inv_ceremony_count: invOf("CEREMONY"),
    inv_cocktail_count: invOf("COCKTAIL"),
    inv_full_count: invOf("FULL"),
    inv_both_days_count: invOf("BOTH_DAYS"),
    children_count: accepted.reduce((sum, g) => sum + (g.childrenCount ?? 0), 0),
    vegetarian_count: accepted.filter((g) =>
      ["VEGETARIAN", "VEGAN"].includes(g.diet || "")
    ).length,
    sleeping_count: accepted.filter((g) => g.isSleeping).length,
    response_rate:
      total > 0
        ? Math.round(((acceptedCount + declinedCount) / total) * 100)
        : 0,
    no_table_count: accepted.filter((g) => !g.tableId && !g.noTableNeeded).length,
    no_accommodation_count: accepted.filter((g) => !g.accommodationId).length,
    thank_you_pending_count: accepted.filter((g) => !g.thankYouSent).length,
  };
}

// ─── Pure guest reducers ─────────────────────────────────────────────────────

export function addGuest(guests: Guest[], guest: Guest): Guest[] {
  return [...guests, guest];
}

export function updateGuest(guests: Guest[], id: string, updates: Partial<Guest>): Guest[] {
  const now = new Date().toISOString();
  return guests.map(g => g.id === id ? { ...g, ...updates, updatedAt: now } : g);
}

export function removeGuest(guests: Guest[], id: string): Guest[] {
  const now = new Date().toISOString();
  // cascade unlinks: any guest pointing to the deleted guest as companion gets companionId=null
  const toUnlink = new Set(
    guests.filter(g => g.id !== id && g.companionId === id).map(g => g.id)
  );
  // also unlink the deleted guest's own companion
  const deleted = guests.find(g => g.id === id);
  if (deleted?.companionId) toUnlink.add(deleted.companionId);
  return guests
    .filter(g => g.id !== id)
    .map(g => toUnlink.has(g.id) ? { ...g, companionId: null, updatedAt: now } : g);
}

export function linkCompanion(guests: Guest[], guestId: string, companionId: string): Guest[] {
  // mutual link; unlink any prior companions of both
  const now = new Date().toISOString();
  const oldCG = guests.find(g => g.companionId === guestId && g.id !== companionId);
  const oldCT = guests.find(g => g.companionId === companionId && g.id !== guestId);
  return guests.map(g => {
    if (g.id === guestId) return { ...g, companionId, updatedAt: now };
    if (g.id === companionId) return { ...g, companionId: guestId, updatedAt: now };
    if (oldCG && g.id === oldCG.id) return { ...g, companionId: null, updatedAt: now };
    if (oldCT && g.id === oldCT.id) return { ...g, companionId: null, updatedAt: now };
    return g;
  });
}

export function unlinkCompanion(guests: Guest[], guestId: string): Guest[] {
  const now = new Date().toISOString();
  const guest = guests.find(g => g.id === guestId);
  if (!guest?.companionId) return guests;
  const cId = guest.companionId;
  return guests.map(g => (g.id === guestId || g.id === cId) ? { ...g, companionId: null, updatedAt: now } : g);
}

// ─── Pure table reducers ─────────────────────────────────────────────────────

export function addTable(tables: Table[], table: Table): Table[] {
  return [...tables, table];
}

export function updateTable(tables: Table[], id: string, updates: Partial<Table>): Table[] {
  return tables.map(t => t.id === id ? { ...t, ...updates } : t);
}

export function removeTable(tables: Table[], guests: Guest[], id: string): { tables: Table[]; guests: Guest[] } {
  return {
    tables: tables.filter(t => t.id !== id),
    guests: guests.map(g => g.tableId === id ? { ...g, tableId: null } : g),
  };
}

// ─── Pure group reducers ─────────────────────────────────────────────────────

export function addGroup(groups: GuestGroup[], group: GuestGroup): GuestGroup[] {
  return [...groups, group];
}

export function updateGroup(groups: GuestGroup[], id: string, updates: Partial<GuestGroup>): GuestGroup[] {
  const now = new Date().toISOString();
  return groups.map(g => g.id === id ? { ...g, ...updates, updatedAt: now } : g);
}

export function removeGroup(groups: GuestGroup[], guests: Guest[], id: string): { groups: GuestGroup[]; guests: Guest[] } {
  return {
    groups: groups.filter(g => g.id !== id),
    guests: guests.map(g => g.groupId === id ? { ...g, groupId: null } : g),
  };
}

// ─── Pure query helpers ──────────────────────────────────────────────────────

export function getGuestsByTable(guests: Guest[], tableId: string): Guest[] {
  return guests.filter(g => g.tableId === tableId);
}

export function getUnassignedGuests(guests: Guest[]): Guest[] {
  return guests.filter(g => g.rsvpStatus === 'ACCEPTED' && !g.tableId);
}
