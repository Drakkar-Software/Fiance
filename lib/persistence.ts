/**
 * Store↔SQLite persistence layer
 * Handles hydration on boot and write-through on mutations
 */

import { Platform } from "react-native";
import { eq } from "drizzle-orm";
import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import * as schema from "@/db/schema";
import { useWeddingStore } from "@/store/useWeddingStore";
import { useGuestsStore } from "@/store/useGuestsStore";
import { useVendorsStore } from "@/store/useVendorsStore";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useIdeasStore } from "@/store/useIdeasStore";

type DrizzleDB = ExpoSQLiteDatabase<typeof schema>;

// ─── Clear all stores (for wedding switching) ──────────────────────────────

export function clearAllStores(): void {
  useWeddingStore.getState().setWedding(null as any);
  useGuestsStore.getState().setGuests([]);
  useGuestsStore.getState().setTables([]);
  useGuestsStore.getState().setGroups([]);
  useVendorsStore.getState().setVendors([]);
  useVendorsStore.getState().setQuotePricings([]);
  usePlanningStore.getState().setCategories([]);
  usePlanningStore.getState().setTasks([]);
  usePlanningStore.getState().setAgendaEvents([]);
  usePlanningStore.getState().setDayOfItems([]);
  useIdeasStore.getState().setCollections([]);
  useIdeasStore.getState().setIdeas([]);
}

// ─── Web: localStorage persistence (SQLite unavailable) ─────────────────────

const WEB_STORAGE_KEY = "wedding_data";

export function loadFromLocalStorage(): boolean {
  if (Platform.OS !== "web") return false;
  try {
    const raw = localStorage.getItem(WEB_STORAGE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data?.version) return false;

    if (data.wedding) useWeddingStore.getState().setWedding(data.wedding);
    if (data.guestGroups) useGuestsStore.getState().setGroups(data.guestGroups);
    if (data.guests) useGuestsStore.getState().setGuests(data.guests);
    if (data.tables) useGuestsStore.getState().setTables(data.tables);
    if (data.vendors) useVendorsStore.getState().setVendors(data.vendors);
    if (data.quotePricings) useVendorsStore.getState().setQuotePricings(data.quotePricings);
    if (data.taskCategories) usePlanningStore.getState().setCategories(data.taskCategories);
    if (data.tasks) {
      const normalized = data.tasks.map((t: any) =>
        t.status === "IN_PROGRESS" || t.status === "CANCELLED"
          ? { ...t, status: "TODO" }
          : t
      );
      usePlanningStore.getState().setTasks(normalized);
    }
    if (data.agendaEvents) usePlanningStore.getState().setAgendaEvents(data.agendaEvents);
    const dayOfItems = data.dayOfItems ?? data.jourJItems;
    if (dayOfItems) usePlanningStore.getState().setDayOfItems(dayOfItems);
    if (data.ideaCollections) useIdeasStore.getState().setCollections(data.ideaCollections);
    if (data.ideas) useIdeasStore.getState().setIdeas(data.ideas);
    return true;
  } catch {
    return false;
  }
}

// ─── Hydrate all stores from SQLite on boot ─────────────────────────────────

export async function hydrateAllStores(db: DrizzleDB): Promise<void> {
  // Wedding (singleton)
  const weddingRows = db.select().from(schema.wedding).all();
  if (weddingRows.length > 0) {
    useWeddingStore.getState().setWedding(weddingRows[0]);
  }

  // Guest groups (must load before guests due to FK)
  const groupRows = db.select().from(schema.guestGroups).all();
  useGuestsStore.getState().setGroups(groupRows);

  // Tables (must load before guests due to FK)
  const tableRows = db.select().from(schema.tables).all();
  useGuestsStore.getState().setTables(tableRows);

  // Guests
  const guestRows = db.select().from(schema.guests).all();
  useGuestsStore.getState().setGuests(guestRows);

  // Vendors
  const vendorRows = db.select().from(schema.vendors).all();
  useVendorsStore.getState().setVendors(vendorRows);

  // Quote pricings
  const pricingRows = db.select().from(schema.quotePricing).all();
  useVendorsStore.getState().setQuotePricings(pricingRows);

  // Task categories
  const categoryRows = db.select().from(schema.taskCategories).all();
  usePlanningStore.getState().setCategories(categoryRows);

  // Tasks (normalize legacy IN_PROGRESS/CANCELLED → TODO)
  const taskRows = db.select().from(schema.tasks).all();
  const normalizedTasks = taskRows.map((t) => {
    if (t.status === "IN_PROGRESS" || t.status === "CANCELLED") {
      const fixed = { ...t, status: "TODO" as const };
      try { updateTaskDb(db, t.id, { status: "TODO" }); } catch {}
      return fixed;
    }
    return t;
  });
  usePlanningStore.getState().setTasks(normalizedTasks);

  // Agenda events
  const agendaRows = db.select().from(schema.agendaEvents).all();
  usePlanningStore.getState().setAgendaEvents(agendaRows);

  // Jour J items
  const dayOfRows = db.select().from(schema.dayOfItems).all();
  usePlanningStore.getState().setDayOfItems(dayOfRows);

  // Idea collections
  const collectionRows = db.select().from(schema.ideaCollections).all();
  useIdeasStore.getState().setCollections(collectionRows);

  // Ideas
  const ideaRows = db.select().from(schema.ideas).all();
  useIdeasStore.getState().setIdeas(ideaRows);
}

// ─── Write-through helpers ──────────────────────────────────────────────────

// Wedding
export function persistWedding(db: DrizzleDB, updates: Partial<schema.Wedding>) {
  db.insert(schema.wedding).values({ id: 1, ...updates }).onConflictDoUpdate({
    target: schema.wedding.id,
    set: updates,
  }).run();
}

// Guests
export function persistGuest(db: DrizzleDB, guest: schema.Guest) {
  db.insert(schema.guests).values(guest).onConflictDoUpdate({
    target: schema.guests.id,
    set: guest,
  }).run();
}

export function updateGuestDb(db: DrizzleDB, id: string, updates: Partial<schema.Guest>) {
  db.update(schema.guests).set(updates).where(eq(schema.guests.id, id)).run();
}

export function deleteGuestDb(db: DrizzleDB, id: string) {
  db.delete(schema.guests).where(eq(schema.guests.id, id)).run();
}

// Tables
export function persistTable(db: DrizzleDB, table: schema.Table) {
  db.insert(schema.tables).values(table).onConflictDoUpdate({
    target: schema.tables.id,
    set: table,
  }).run();
}

export function updateTableDb(db: DrizzleDB, id: string, updates: Partial<schema.Table>) {
  db.update(schema.tables).set(updates).where(eq(schema.tables.id, id)).run();
}

export function deleteTableDb(db: DrizzleDB, id: string) {
  // Unassign guests first
  db.update(schema.guests).set({ tableId: null }).where(eq(schema.guests.tableId, id)).run();
  db.delete(schema.tables).where(eq(schema.tables.id, id)).run();
}

// Guest Groups
export function persistGuestGroup(db: DrizzleDB, group: schema.GuestGroup) {
  db.insert(schema.guestGroups).values(group).onConflictDoUpdate({
    target: schema.guestGroups.id,
    set: group,
  }).run();
}

export function updateGuestGroupDb(db: DrizzleDB, id: string, updates: Partial<schema.GuestGroup>) {
  db.update(schema.guestGroups).set(updates).where(eq(schema.guestGroups.id, id)).run();
}

export function deleteGuestGroupDb(db: DrizzleDB, id: string) {
  // Unassign guests first
  db.update(schema.guests).set({ groupId: null }).where(eq(schema.guests.groupId, id)).run();
  db.delete(schema.guestGroups).where(eq(schema.guestGroups.id, id)).run();
}

// Vendors
export function persistVendor(db: DrizzleDB, vendor: schema.Vendor) {
  db.insert(schema.vendors).values(vendor).onConflictDoUpdate({
    target: schema.vendors.id,
    set: vendor,
  }).run();
}

export function updateVendorDb(db: DrizzleDB, id: string, updates: Partial<schema.Vendor>) {
  db.update(schema.vendors).set(updates).where(eq(schema.vendors.id, id)).run();
}

export function deleteVendorDb(db: DrizzleDB, id: string) {
  db.delete(schema.quotePricing).where(eq(schema.quotePricing.vendorId, id)).run();
  db.delete(schema.vendors).where(eq(schema.vendors.id, id)).run();
}

// Quote Pricing
export function persistQuotePricing(db: DrizzleDB, pricing: schema.QuotePricing) {
  db.insert(schema.quotePricing).values(pricing).onConflictDoUpdate({
    target: schema.quotePricing.id,
    set: pricing,
  }).run();
}

export function updateQuotePricingDb(db: DrizzleDB, id: string, updates: Partial<schema.QuotePricing>) {
  db.update(schema.quotePricing).set(updates).where(eq(schema.quotePricing.id, id)).run();
}

export function deleteQuotePricingDb(db: DrizzleDB, id: string) {
  db.delete(schema.quotePricing).where(eq(schema.quotePricing.id, id)).run();
}

// Tasks
export function persistTask(db: DrizzleDB, task: schema.Task) {
  db.insert(schema.tasks).values(task).onConflictDoUpdate({
    target: schema.tasks.id,
    set: task,
  }).run();
}

export function updateTaskDb(db: DrizzleDB, id: string, updates: Partial<schema.Task>) {
  db.update(schema.tasks).set(updates).where(eq(schema.tasks.id, id)).run();
}

export function deleteTaskDb(db: DrizzleDB, id: string) {
  db.delete(schema.tasks).where(eq(schema.tasks.id, id)).run();
}

// Task Categories
export function persistTaskCategory(db: DrizzleDB, category: schema.TaskCategory) {
  db.insert(schema.taskCategories).values(category).onConflictDoUpdate({
    target: schema.taskCategories.id,
    set: category,
  }).run();
}

export function updateTaskCategoryDb(db: DrizzleDB, id: string, updates: Partial<schema.TaskCategory>) {
  db.update(schema.taskCategories).set(updates).where(eq(schema.taskCategories.id, id)).run();
}

export function deleteTaskCategoryDb(db: DrizzleDB, id: string) {
  db.delete(schema.taskCategories).where(eq(schema.taskCategories.id, id)).run();
}

// Agenda Events
export function persistAgendaEvent(db: DrizzleDB, event: schema.AgendaEvent) {
  db.insert(schema.agendaEvents).values(event).onConflictDoUpdate({
    target: schema.agendaEvents.id,
    set: event,
  }).run();
}

export function updateAgendaEventDb(db: DrizzleDB, id: string, updates: Partial<schema.AgendaEvent>) {
  db.update(schema.agendaEvents).set(updates).where(eq(schema.agendaEvents.id, id)).run();
}

export function deleteAgendaEventDb(db: DrizzleDB, id: string) {
  db.delete(schema.agendaEvents).where(eq(schema.agendaEvents.id, id)).run();
}

// Jour J Items
export function persistDayOfItem(db: DrizzleDB, item: schema.DayOfItem) {
  db.insert(schema.dayOfItems).values(item).onConflictDoUpdate({
    target: schema.dayOfItems.id,
    set: item,
  }).run();
}

export function updateDayOfItemDb(db: DrizzleDB, id: string, updates: Partial<schema.DayOfItem>) {
  db.update(schema.dayOfItems).set(updates).where(eq(schema.dayOfItems.id, id)).run();
}

export function deleteDayOfItemDb(db: DrizzleDB, id: string) {
  db.delete(schema.dayOfItems).where(eq(schema.dayOfItems.id, id)).run();
}

// Ideas
export function persistIdea(db: DrizzleDB, idea: schema.Idea) {
  db.insert(schema.ideas).values(idea).onConflictDoUpdate({
    target: schema.ideas.id,
    set: idea,
  }).run();
}

export function updateIdeaDb(db: DrizzleDB, id: string, updates: Partial<schema.Idea>) {
  db.update(schema.ideas).set(updates).where(eq(schema.ideas.id, id)).run();
}

export function deleteIdeaDb(db: DrizzleDB, id: string) {
  db.delete(schema.ideas).where(eq(schema.ideas.id, id)).run();
}

// Idea Collections
export function persistIdeaCollection(db: DrizzleDB, collection: schema.IdeaCollection) {
  db.insert(schema.ideaCollections).values(collection).onConflictDoUpdate({
    target: schema.ideaCollections.id,
    set: collection,
  }).run();
}

export function updateIdeaCollectionDb(db: DrizzleDB, id: string, updates: Partial<schema.IdeaCollection>) {
  db.update(schema.ideaCollections).set(updates).where(eq(schema.ideaCollections.id, id)).run();
}

export function deleteIdeaCollectionDb(db: DrizzleDB, id: string) {
  // Unassign ideas first
  db.update(schema.ideas).set({ collectionId: null }).where(eq(schema.ideas.collectionId, id)).run();
  db.delete(schema.ideaCollections).where(eq(schema.ideaCollections.id, id)).run();
}

// ─── Bulk restore (for sync pull) ───────────────────────────────────────────

export function restoreAllTables(db: DrizzleDB, data: {
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
}) {
  // Clear all tables (order matters for FK constraints)
  db.delete(schema.ideas).run();
  db.delete(schema.ideaCollections).run();
  db.delete(schema.dayOfItems).run();
  db.delete(schema.agendaEvents).run();
  db.delete(schema.tasks).run();
  db.delete(schema.taskCategories).run();
  db.delete(schema.quotePricing).run();
  db.delete(schema.vendors).run();
  db.delete(schema.guests).run();
  db.delete(schema.tables).run();
  db.delete(schema.guestGroups).run();

  // Re-insert (order matters for FK constraints)
  if (data.wedding) {
    db.update(schema.wedding).set(data.wedding).where(eq(schema.wedding.id, 1)).run();
  }
  for (const row of data.guestGroups) db.insert(schema.guestGroups).values(row).run();
  for (const row of data.tables) db.insert(schema.tables).values(row).run();
  for (const row of data.guests) db.insert(schema.guests).values(row).run();
  for (const row of data.vendors) db.insert(schema.vendors).values(row).run();
  for (const row of data.quotePricings) db.insert(schema.quotePricing).values(row).run();
  for (const row of data.taskCategories) db.insert(schema.taskCategories).values(row).run();
  for (const row of data.tasks) db.insert(schema.tasks).values(row).run();
  for (const row of data.agendaEvents) db.insert(schema.agendaEvents).values(row).run();
  for (const row of data.dayOfItems) db.insert(schema.dayOfItems).values(row).run();
  for (const row of data.ideaCollections) db.insert(schema.ideaCollections).values(row).run();
  for (const row of data.ideas) db.insert(schema.ideas).values(row).run();
}
