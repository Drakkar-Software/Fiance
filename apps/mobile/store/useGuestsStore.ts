import { create } from "zustand";
import type { Guest, Table, GuestGroup } from "@fiance/sdk";
import {
  computeCounts,
  addGuest as sdkAddGuest,
  updateGuest as sdkUpdateGuest,
  removeGuest as sdkRemoveGuest,
  linkCompanion as sdkLinkCompanion,
  unlinkCompanion as sdkUnlinkCompanion,
  addTable as sdkAddTable,
  updateTable as sdkUpdateTable,
  removeTable as sdkRemoveTable,
  addGroup as sdkAddGroup,
  updateGroup as sdkUpdateGroup,
  removeGroup as sdkRemoveGroup,
  getGuestsByTable as sdkGetGuestsByTable,
  getUnassignedGuests as sdkGetUnassignedGuests,
} from "@fiance/sdk";
export type { GuestCounts } from "@fiance/sdk";
import { getStorage } from "@/lib/kv-storage";
import { persistGuests, persistTables, persistGroups } from "@/lib/persistence";
import { notifySync } from "@/lib/starfish";

// Re-export computeCounts so existing callers of the store module still work
export { computeCounts };

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
  getCounts: () => ReturnType<typeof computeCounts>;
  getGuestsByTable: (tableId: string) => Guest[];
  getUnassignedGuests: () => Guest[];
}

export const useGuestsStore = create<GuestsState>((set, get) => ({
  guests: [],
  tables: [],
  groups: [],
  setGuests: (guests) => set({ guests }),
  setTables: (tables) => set({ tables }),
  setGroups: (groups) => set({ groups }),
  addGuest: (guest) => {
    set((s) => ({ guests: sdkAddGuest(s.guests, guest) }));
    const storage = getStorage();
    if (storage) persistGuests(storage);
    notifySync();
  },
  updateGuest: (id, updates) => {
    set((s) => ({ guests: sdkUpdateGuest(s.guests, id, updates) }));
    const storage = getStorage();
    if (storage) persistGuests(storage);
    notifySync();
  },
  removeGuest: (id) => {
    set((s) => ({ guests: sdkRemoveGuest(s.guests, id) }));
    const storage = getStorage();
    if (storage) persistGuests(storage);
    notifySync();
  },
  linkCompanion: (guestId, companionId) => {
    set((s) => ({ guests: sdkLinkCompanion(s.guests, guestId, companionId) }));
    const storage = getStorage();
    if (storage) persistGuests(storage);
    notifySync();
  },
  unlinkCompanion: (guestId) => {
    set((s) => ({ guests: sdkUnlinkCompanion(s.guests, guestId) }));
    const storage = getStorage();
    if (storage) persistGuests(storage);
    notifySync();
  },
  addTable: (table) => {
    set((s) => ({ tables: sdkAddTable(s.tables, table) }));
    const storage = getStorage();
    if (storage) persistTables(storage);
    notifySync();
  },
  updateTable: (id, updates) => {
    set((s) => ({ tables: sdkUpdateTable(s.tables, id, updates) }));
    const storage = getStorage();
    if (storage) persistTables(storage);
    notifySync();
  },
  removeTable: (id) => {
    set((s) => sdkRemoveTable(s.tables, s.guests, id));
    const storage = getStorage();
    if (storage) {
      persistTables(storage);
      persistGuests(storage);
    }
    notifySync();
  },
  addGroup: (group) => {
    set((s) => ({ groups: sdkAddGroup(s.groups, group) }));
    const storage = getStorage();
    if (storage) persistGroups(storage);
    notifySync();
  },
  updateGroup: (id, updates) => {
    set((s) => ({ groups: sdkUpdateGroup(s.groups, id, updates) }));
    const storage = getStorage();
    if (storage) persistGroups(storage);
    notifySync();
  },
  removeGroup: (id) => {
    set((s) => sdkRemoveGroup(s.groups, s.guests, id));
    const storage = getStorage();
    if (storage) {
      persistGroups(storage);
      persistGuests(storage);
    }
    notifySync();
  },
  getCounts: () => computeCounts(get().guests),
  getGuestsByTable: (tableId) => sdkGetGuestsByTable(get().guests, tableId),
  getUnassignedGuests: () => sdkGetUnassignedGuests(get().guests),
}));

/** Hook to get guest count by key — used by budget calculations */
export function useGuestCount(key: keyof ReturnType<typeof computeCounts> | null): number {
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
