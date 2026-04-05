import { create } from "zustand";
import type { Guest, Table } from "@/db/schema";

export interface GuestCounts {
  total: number;
  accepted: number;
  declined: number;
  pending: number;
  maybe: number;
  nb_cocktail: number;
  nb_dinner: number;
  nb_full: number;
  nb_next_day: number;
  nb_children: number;
  nb_vegetarian: number;
  nb_sleeping: number;
  response_rate: number;
  nb_no_table: number;
}

interface GuestsState {
  guests: Guest[];
  tables: Table[];
  setGuests: (guests: Guest[]) => void;
  setTables: (tables: Table[]) => void;
  addGuest: (guest: Guest) => void;
  updateGuest: (id: string, updates: Partial<Guest>) => void;
  removeGuest: (id: string) => void;
  addTable: (table: Table) => void;
  updateTable: (id: string, updates: Partial<Table>) => void;
  removeTable: (id: string) => void;
  getCounts: () => GuestCounts;
  getGuestsByTable: (tableId: string) => Guest[];
  getUnassignedGuests: () => Guest[];
}

function computeCounts(guests: Guest[]): GuestCounts {
  const accepted = guests.filter((g) => g.rsvpStatus === "ACCEPTED");
  const total = guests.length;
  const declinedCount = guests.filter(
    (g) => g.rsvpStatus === "DECLINED"
  ).length;
  const acceptedCount = accepted.length;

  return {
    total,
    accepted: acceptedCount,
    declined: declinedCount,
    pending: guests.filter((g) => g.rsvpStatus === "PENDING").length,
    maybe: guests.filter((g) => g.rsvpStatus === "MAYBE").length,
    nb_cocktail: accepted.filter((g) =>
      ["COCKTAIL", "DINNER", "FULL"].includes(g.invitationType)
    ).length,
    nb_dinner: accepted.filter((g) =>
      ["DINNER", "FULL"].includes(g.invitationType)
    ).length,
    nb_full: accepted.filter((g) => g.invitationType === "FULL").length,
    nb_next_day: accepted.filter((g) => g.invitationType === "NEXT_DAY").length,
    nb_children: accepted.filter((g) => g.isChild).length,
    nb_vegetarian: accepted.filter((g) =>
      ["VEGETARIAN", "VEGAN"].includes(g.diet || "")
    ).length,
    nb_sleeping: accepted.filter((g) => g.isSleeping).length,
    response_rate:
      total > 0
        ? Math.round(((acceptedCount + declinedCount) / total) * 100)
        : 0,
    nb_no_table: accepted.filter((g) => !g.tableId).length,
  };
}

export const useGuestsStore = create<GuestsState>((set, get) => ({
  guests: [],
  tables: [],
  setGuests: (guests) => set({ guests }),
  setTables: (tables) => set({ tables }),
  addGuest: (guest) =>
    set((state) => ({ guests: [...state.guests, guest] })),
  updateGuest: (id, updates) =>
    set((state) => ({
      guests: state.guests.map((g) =>
        g.id === id
          ? { ...g, ...updates, updatedAt: new Date().toISOString() }
          : g
      ),
    })),
  removeGuest: (id) =>
    set((state) => ({ guests: state.guests.filter((g) => g.id !== id) })),
  addTable: (table) =>
    set((state) => ({ tables: [...state.tables, table] })),
  updateTable: (id, updates) =>
    set((state) => ({
      tables: state.tables.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  removeTable: (id) =>
    set((state) => ({
      tables: state.tables.filter((t) => t.id !== id),
      guests: state.guests.map((g) =>
        g.tableId === id ? { ...g, tableId: null } : g
      ),
    })),
  getCounts: () => computeCounts(get().guests),
  getGuestsByTable: (tableId) =>
    get().guests.filter((g) => g.tableId === tableId),
  getUnassignedGuests: () =>
    get()
      .guests.filter((g) => g.rsvpStatus === "ACCEPTED" && !g.tableId),
}));

/** Hook to get guest count by key — used by budget calculations */
export function useGuestCount(
  key: keyof GuestCounts | null
): number {
  return useGuestsStore((state) => {
    if (!key) return 0;
    const counts = computeCounts(state.guests);
    // If no accepted guests yet, use total as estimate
    const useEstimate = counts.accepted === 0 && counts.total > 0;
    if (useEstimate && key !== "total" && key !== "response_rate") {
      return counts.total;
    }
    return counts[key] ?? 0;
  });
}
