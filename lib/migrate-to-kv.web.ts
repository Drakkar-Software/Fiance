/**
 * Web stub for migrate-to-kv — only handles localStorage → AsyncStorage migration.
 * No expo-sqlite imports (no SQLite on web).
 */

import { readCollection, writeCollection } from "./kv-storage";
import type { SQLiteStorage } from "expo-sqlite/kv-store";

const MIGRATION_FLAG = "__migrated_to_kv";

function migrateFromLocalStorage(): void {
  try {
    const raw = localStorage.getItem("wedding_data");
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!data?.version) return;

    if (data.wedding) writeCollection("wedding", data.wedding);
    if (data.guestGroups) writeCollection("guestGroups", data.guestGroups);
    if (data.guests) writeCollection("guests", data.guests);
    if (data.tables) writeCollection("tables", data.tables);
    if (data.vendors) writeCollection("vendors", data.vendors);
    if (data.quotePricings) writeCollection("quotePricings", data.quotePricings);
    if (data.vendorPayments) writeCollection("vendorPayments", data.vendorPayments);
    if (data.accommodations) writeCollection("accommodations", data.accommodations);
    if (data.gifts) writeCollection("gifts", data.gifts);
    if (data.taskCategories) writeCollection("taskCategories", data.taskCategories);
    if (data.tasks) writeCollection("tasks", data.tasks);
    if (data.agendaEvents) writeCollection("agendaEvents", data.agendaEvents);
    if (data.dayOfItems ?? data.jourJItems)
      writeCollection("dayOfItems", data.dayOfItems ?? data.jourJItems);
    if (data.ideaCollections) writeCollection("ideaCollections", data.ideaCollections);
    if (data.ideas) writeCollection("ideas", data.ideas);

    localStorage.removeItem("wedding_data");
  } catch (err) {
    console.warn("[migrate-to-kv] localStorage migration failed:", err);
  }
}

export function migrateToKvIfNeeded(_kv: SQLiteStorage | null, _dbFileName: string): void {
  if (readCollection<any>(MIGRATION_FLAG)) return;
  migrateFromLocalStorage();
  writeCollection(MIGRATION_FLAG, "true");
}
