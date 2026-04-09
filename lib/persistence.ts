/**
 * Store↔KV persistence layer
 * Handles hydration on boot and write-through on mutations.
 * Each "persist" function writes the full collection from the matching Zustand store.
 */

import type { SQLiteStorage } from "expo-sqlite/kv-store";
import { useWeddingStore } from "@/store/useWeddingStore";
import { useGuestsStore } from "@/store/useGuestsStore";
import { useVendorsStore } from "@/store/useVendorsStore";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useIdeasStore } from "@/store/useIdeasStore";
import { useAccommodationsStore } from "@/store/useAccommodationsStore";
import { useGiftsStore } from "@/store/useGiftsStore";
import { readCollection, writeCollection } from "./kv-storage";

// ─── Clear all stores (for wedding switching) ──────────────────────────────

export function clearAllStores(): void {
  useWeddingStore.getState().setWedding(null as any);
  useGuestsStore.getState().setGuests([]);
  useGuestsStore.getState().setTables([]);
  useGuestsStore.getState().setGroups([]);
  useVendorsStore.getState().setVendors([]);
  useVendorsStore.getState().setQuotePricings([]);
  useVendorsStore.getState().setVendorPayments([]);
  usePlanningStore.getState().setCategories([]);
  usePlanningStore.getState().setTasks([]);
  usePlanningStore.getState().setAgendaEvents([]);
  usePlanningStore.getState().setDayOfItems([]);
  useIdeasStore.getState().setCollections([]);
  useIdeasStore.getState().setIdeas([]);
  useAccommodationsStore.getState().setAccommodations([]);
  useGiftsStore.getState().setGifts([]);
}

// ─── Hydrate all stores from KV on boot ────────────────────────────────────

export function hydrateAllStores(_storage: SQLiteStorage): void {
  const wedding = readCollection<any>("wedding");
  if (wedding) useWeddingStore.getState().setWedding(wedding);

  useGuestsStore.getState().setGroups(readCollection<any[]>("guestGroups") ?? []);
  useGuestsStore.getState().setTables(readCollection<any[]>("tables") ?? []);
  useGuestsStore.getState().setGuests(readCollection<any[]>("guests") ?? []);

  useVendorsStore.getState().setVendors(readCollection<any[]>("vendors") ?? []);
  useVendorsStore.getState().setQuotePricings(readCollection<any[]>("quotePricings") ?? []);
  useVendorsStore.getState().setVendorPayments(readCollection<any[]>("vendorPayments") ?? []);

  usePlanningStore.getState().setCategories(readCollection<any[]>("taskCategories") ?? []);

  const rawTasks = readCollection<any[]>("tasks") ?? [];
  const normalizedTasks = rawTasks.map((t) =>
    t.status === "IN_PROGRESS" || t.status === "CANCELLED" ? { ...t, status: "TODO" } : t
  );
  usePlanningStore.getState().setTasks(normalizedTasks);

  usePlanningStore.getState().setAgendaEvents(readCollection<any[]>("agendaEvents") ?? []);
  usePlanningStore.getState().setDayOfItems(readCollection<any[]>("dayOfItems") ?? []);

  useIdeasStore.getState().setCollections(readCollection<any[]>("ideaCollections") ?? []);
  useIdeasStore.getState().setIdeas(readCollection<any[]>("ideas") ?? []);

  useAccommodationsStore.getState().setAccommodations(readCollection<any[]>("accommodations") ?? []);

  useGiftsStore.getState().setGifts(readCollection<any[]>("gifts") ?? []);
}

// ─── Collection-level write-through helpers ─────────────────────────────────
// Each function reads the current Zustand state and writes the full collection to KV.

export function persistWedding(_storage: SQLiteStorage): void {
  writeCollection("wedding", useWeddingStore.getState().wedding);
}

export function persistGuests(_storage: SQLiteStorage): void {
  writeCollection("guests", useGuestsStore.getState().guests);
}

export function persistTables(_storage: SQLiteStorage): void {
  writeCollection("tables", useGuestsStore.getState().tables);
}

export function persistGroups(_storage: SQLiteStorage): void {
  writeCollection("guestGroups", useGuestsStore.getState().groups);
}

export function persistVendors(_storage: SQLiteStorage): void {
  writeCollection("vendors", useVendorsStore.getState().vendors);
}

export function persistQuotePricings(_storage: SQLiteStorage): void {
  writeCollection("quotePricings", useVendorsStore.getState().quotePricings);
}

export function persistVendorPayments(_storage: SQLiteStorage): void {
  writeCollection("vendorPayments", useVendorsStore.getState().vendorPayments);
}

export function persistTaskCategories(_storage: SQLiteStorage): void {
  writeCollection("taskCategories", usePlanningStore.getState().categories);
}

export function persistTasks(_storage: SQLiteStorage): void {
  writeCollection("tasks", usePlanningStore.getState().tasks);
}

export function persistAgendaEvents(_storage: SQLiteStorage): void {
  writeCollection("agendaEvents", usePlanningStore.getState().agendaEvents);
}

export function persistDayOfItems(_storage: SQLiteStorage): void {
  writeCollection("dayOfItems", usePlanningStore.getState().dayOfItems);
}

export function persistIdeaCollections(_storage: SQLiteStorage): void {
  writeCollection("ideaCollections", useIdeasStore.getState().collections);
}

export function persistIdeas(_storage: SQLiteStorage): void {
  writeCollection("ideas", useIdeasStore.getState().ideas);
}

export function persistAccommodations(_storage: SQLiteStorage): void {
  writeCollection("accommodations", useAccommodationsStore.getState().accommodations);
}

export function persistGifts(_storage: SQLiteStorage): void {
  writeCollection("gifts", useGiftsStore.getState().gifts);
}

// ─── Bulk restore (for sync pull and import) ────────────────────────────────

export function restoreAllTables(_storage: SQLiteStorage, data: {
  wedding: any;
  guests: any[];
  tables: any[];
  guestGroups: any[];
  vendors: any[];
  quotePricings: any[];
  tasks: any[];
  taskCategories: any[];
  agendaEvents: any[];
  dayOfItems: any[];
  ideas: any[];
  ideaCollections: any[];
  vendorPayments?: any[];
  accommodations?: any[];
  gifts?: any[];
}): void {
  writeCollection("wedding", data.wedding);
  writeCollection("guestGroups", data.guestGroups);
  writeCollection("tables", data.tables);
  writeCollection("accommodations", data.accommodations ?? []);
  writeCollection("guests", data.guests);
  writeCollection("vendors", data.vendors);
  writeCollection("quotePricings", data.quotePricings);
  writeCollection("vendorPayments", data.vendorPayments ?? []);
  writeCollection("taskCategories", data.taskCategories);
  writeCollection("tasks", data.tasks);
  writeCollection("agendaEvents", data.agendaEvents);
  writeCollection("dayOfItems", data.dayOfItems);
  writeCollection("ideaCollections", data.ideaCollections);
  writeCollection("ideas", data.ideas);
  writeCollection("gifts", data.gifts ?? []);
}
