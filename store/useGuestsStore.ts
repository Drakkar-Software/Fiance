import { create } from "zustand";
import type { Guest, Table, GuestGroup } from "@/db/schema";
import { getDatabase } from "@/db/provider";
import {
  persistGuest, updateGuestDb, deleteGuestDb,
  persistTable, updateTableDb, deleteTableDb,
  persistGuestGroup, updateGuestGroupDb, deleteGuestGroupDb,
} from "@/lib/persistence";
import { notifySync } from "@/lib/starfish";

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
  children_count: number;
  vegetarian_count: number;
  sleeping_count: number;
  response_rate: number;
  no_table_count: number;
  no_accommodation_count: number;
  thank_you_pending_count: number;
}

interface GuestsState {
  guests: Guest[];
  tables: Table[];
  groups: GuestGroup[];
  setGuests: (guests: Guest[]) => void;
  setTables: (tables: Table[]) => void;
  setGroups: (groups: GuestGroup[]) => void;
  addGuest: (guest: Guest) => void;
  updateGuest: (id: string, updates: Partial<Guest>) => void;
  removeGuest: (id: string) => void;
  linkCompanion: (guestId: string, companionId: string) => void;
  unlinkCompanion: (guestId: string) => void;
  addTable: (table: Table) => void;
  updateTable: (id: string, updates: Partial<Table>) => void;
  removeTable: (id: string) => void;
  addGroup: (group: GuestGroup) => void;
  updateGroup: (id: string, updates: Partial<GuestGroup>) => void;
  removeGroup: (id: string) => void;
  getCounts: () => GuestCounts;
  getGuestsByTable: (tableId: string) => Guest[];
  getUnassignedGuests: () => Guest[];
}

export function computeCounts(guests: Guest[]): GuestCounts {
  const accepted = guests.filter((g) => g.rsvpStatus === "ACCEPTED");
  const total = guests.length;
  const declinedCount = guests.filter((g) => g.rsvpStatus === "DECLINED").length;
  const acceptedCount = accepted.length;

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

export const useGuestsStore = create<GuestsState>((set, get) => ({
  guests: [],
  tables: [],
  groups: [],
  setGuests: (guests) => set({ guests }),
  setTables: (tables) => set({ tables }),
  setGroups: (groups) => set({ groups }),
  addGuest: (guest) => {
    set((state) => ({ guests: [...state.guests, guest] }));
    const db = getDatabase();
    if (db) persistGuest(db, guest);
    notifySync();
  },
  updateGuest: (id, updates) => {
    set((state) => ({
      guests: state.guests.map((g) =>
        g.id === id
          ? { ...g, ...updates, updatedAt: new Date().toISOString() }
          : g
      ),
    }));
    const db = getDatabase();
    if (db) updateGuestDb(db, id, { ...updates, updatedAt: new Date().toISOString() });
    notifySync();
  },
  removeGuest: (id) => {
    const now = new Date().toISOString();
    // Clear all companion links pointing to or from the deleted guest
    const allGuests = get().guests;
    const guest = allGuests.find((g) => g.id === id);
    const pointingToDeleted = allGuests.filter(
      (g) => g.id !== id && (g.companionId === id)
    );
    const toUnlink = guest?.companionId
      ? [...pointingToDeleted.filter((g) => g.id !== guest.companionId), { id: guest.companionId }]
      : pointingToDeleted;
    if (toUnlink.length > 0) {
      const ids = new Set(toUnlink.map((g) => g.id));
      set((state) => ({
        guests: state.guests.map((g) =>
          ids.has(g.id) ? { ...g, companionId: null, updatedAt: now } : g
        ),
      }));
      const db = getDatabase();
      if (db) {
        for (const u of toUnlink) {
          updateGuestDb(db, u.id, { companionId: null, updatedAt: now });
        }
      }
    }
    set((state) => ({ guests: state.guests.filter((g) => g.id !== id) }));
    const db = getDatabase();
    if (db) deleteGuestDb(db, id);
    notifySync();
  },
  linkCompanion: (guestId, companionId) => {
    const now = new Date().toISOString();
    // Capture old companions inside set() for consistency, but also outside for DB writes
    let oldCompanionOfGuestId: string | null = null;
    let oldCompanionOfTargetId: string | null = null;
    set((state) => {
      const ocg = state.guests.find((g) => g.companionId === guestId && g.id !== companionId);
      const oct = state.guests.find((g) => g.companionId === companionId && g.id !== guestId);
      oldCompanionOfGuestId = ocg?.id ?? null;
      oldCompanionOfTargetId = oct?.id ?? null;
      return {
        guests: state.guests.map((g) => {
          if (g.id === guestId) return { ...g, companionId, updatedAt: now };
          if (g.id === companionId) return { ...g, companionId: guestId, updatedAt: now };
          if (ocg && g.id === ocg.id) return { ...g, companionId: null, updatedAt: now };
          if (oct && g.id === oct.id) return { ...g, companionId: null, updatedAt: now };
          return g;
        }),
      };
    });
    const db = getDatabase();
    if (db) {
      updateGuestDb(db, guestId, { companionId, updatedAt: now });
      updateGuestDb(db, companionId, { companionId: guestId, updatedAt: now });
      if (oldCompanionOfGuestId) updateGuestDb(db, oldCompanionOfGuestId, { companionId: null, updatedAt: now });
      if (oldCompanionOfTargetId) updateGuestDb(db, oldCompanionOfTargetId, { companionId: null, updatedAt: now });
    }
    notifySync();
  },
  unlinkCompanion: (guestId) => {
    const guest = get().guests.find((g) => g.id === guestId);
    if (!guest?.companionId) return;
    const cId = guest.companionId;
    const now = new Date().toISOString();
    set((state) => ({
      guests: state.guests.map((g) => {
        if (g.id === guestId || g.id === cId) return { ...g, companionId: null, updatedAt: now };
        return g;
      }),
    }));
    const db = getDatabase();
    if (db) {
      updateGuestDb(db, guestId, { companionId: null, updatedAt: now });
      updateGuestDb(db, cId, { companionId: null, updatedAt: now });
    }
    notifySync();
  },
  addTable: (table) => {
    set((state) => ({ tables: [...state.tables, table] }));
    const db = getDatabase();
    if (db) persistTable(db, table);
    notifySync();
  },
  updateTable: (id, updates) => {
    set((state) => ({
      tables: state.tables.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
    const db = getDatabase();
    if (db) updateTableDb(db, id, updates);
    notifySync();
  },
  removeTable: (id) => {
    set((state) => ({
      tables: state.tables.filter((t) => t.id !== id),
      guests: state.guests.map((g) =>
        g.tableId === id ? { ...g, tableId: null } : g
      ),
    }));
    const db = getDatabase();
    if (db) deleteTableDb(db, id);
    notifySync();
  },
  addGroup: (group) => {
    set((state) => ({ groups: [...state.groups, group] }));
    const db = getDatabase();
    if (db) persistGuestGroup(db, group);
    notifySync();
  },
  updateGroup: (id, updates) => {
    const now = new Date().toISOString();
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === id ? { ...g, ...updates, updatedAt: now } : g
      ),
    }));
    const db = getDatabase();
    if (db) updateGuestGroupDb(db, id, { ...updates, updatedAt: now });
    notifySync();
  },
  removeGroup: (id) => {
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== id),
      guests: state.guests.map((g) =>
        g.groupId === id ? { ...g, groupId: null } : g
      ),
    }));
    const db = getDatabase();
    if (db) deleteGuestGroupDb(db, id);
    notifySync();
  },
  getCounts: () => computeCounts(get().guests),
  getGuestsByTable: (tableId) =>
    get().guests.filter((g) => g.tableId === tableId),
  getUnassignedGuests: () =>
    get().guests.filter((g) => g.rsvpStatus === "ACCEPTED" && !g.tableId),
}));

/** Hook to get guest count by key — used by budget calculations */
export function useGuestCount(key: keyof GuestCounts | null): number {
  return useGuestsStore((state) => {
    if (!key) return 0;
    const counts = computeCounts(state.guests);
    const useEstimate = counts.accepted === 0 && counts.total > 0;
    if (useEstimate && key !== "total" && key !== "response_rate") {
      return counts.total;
    }
    return counts[key] ?? 0;
  });
}
