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
  nb_cocktail: number;
  nb_dinner: number;
  nb_full: number;
  nb_both_days: number;
  nb_children: number;
  nb_vegetarian: number;
  nb_sleeping: number;
  response_rate: number;
  nb_no_table: number;
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
    nb_cocktail: accepted.filter((g) =>
      ["COCKTAIL", "FULL", "BOTH_DAYS"].includes(g.invitationType)
    ).length,
    nb_dinner: accepted.filter((g) =>
      ["FULL", "BOTH_DAYS"].includes(g.invitationType)
    ).length,
    nb_full: accepted.filter((g) => g.invitationType === "FULL").length,
    nb_both_days: accepted.filter((g) => g.invitationType === "BOTH_DAYS").length,
    nb_children: accepted.filter((g) => g.isChild).length,
    nb_vegetarian: accepted.filter((g) =>
      ["VEGETARIAN", "VEGAN"].includes(g.diet || "")
    ).length,
    nb_sleeping: accepted.filter((g) => g.isSleeping).length,
    response_rate:
      total > 0
        ? Math.round(((acceptedCount + declinedCount) / total) * 100)
        : 0,
    nb_no_table: accepted.filter((g) => !g.tableId && !g.noTableNeeded).length,
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
    const guest = get().guests.find((g) => g.id === id);
    if (guest?.companionId) {
      const cId = guest.companionId;
      const now = new Date().toISOString();
      set((state) => ({
        guests: state.guests.map((g) =>
          g.id === cId ? { ...g, companionId: null, updatedAt: now } : g
        ),
      }));
      const db = getDatabase();
      if (db) updateGuestDb(db, cId, { companionId: null, updatedAt: now });
    }
    set((state) => ({ guests: state.guests.filter((g) => g.id !== id) }));
    const db = getDatabase();
    if (db) deleteGuestDb(db, id);
    notifySync();
  },
  linkCompanion: (guestId, companionId) => {
    const now = new Date().toISOString();
    const oldState = get().guests;
    const oldCompanionOfGuest = oldState.find((g) => g.companionId === guestId && g.id !== companionId);
    const oldCompanionOfTarget = oldState.find((g) => g.companionId === companionId && g.id !== guestId);
    set((state) => ({
      guests: state.guests.map((g) => {
        if (g.id === guestId) return { ...g, companionId, updatedAt: now };
        if (g.id === companionId) return { ...g, companionId: guestId, updatedAt: now };
        if (oldCompanionOfGuest && g.id === oldCompanionOfGuest.id) return { ...g, companionId: null, updatedAt: now };
        if (oldCompanionOfTarget && g.id === oldCompanionOfTarget.id) return { ...g, companionId: null, updatedAt: now };
        return g;
      }),
    }));
    const db = getDatabase();
    if (db) {
      updateGuestDb(db, guestId, { companionId, updatedAt: now });
      updateGuestDb(db, companionId, { companionId: guestId, updatedAt: now });
      if (oldCompanionOfGuest) updateGuestDb(db, oldCompanionOfGuest.id, { companionId: null, updatedAt: now });
      if (oldCompanionOfTarget) updateGuestDb(db, oldCompanionOfTarget.id, { companionId: null, updatedAt: now });
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
