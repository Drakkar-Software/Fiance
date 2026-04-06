/**
 * Cloud sync utilities for WeddingOS
 * Handles backup document creation and restoration via Starfish
 */

import { Platform } from "react-native";
import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import type * as schema from "@/db/schema";
import { useWeddingStore } from "@/store/useWeddingStore";
import { useGuestsStore } from "@/store/useGuestsStore";
import { useVendorsStore } from "@/store/useVendorsStore";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useIdeasStore } from "@/store/useIdeasStore";
import { restoreAllTables, hydrateAllStores } from "./persistence";

type DrizzleDB = ExpoSQLiteDatabase<typeof schema>;

export interface BackupData {
  version: number;
  timestamp: string;
  wedding: unknown;
  guests: unknown[];
  tables: unknown[];
  guestGroups: unknown[];
  vendors: unknown[];
  quotePricings: unknown[];
  tasks: unknown[];
  taskCategories: unknown[];
  agendaEvents: unknown[];
  dayOfItems: unknown[];
  ideas: unknown[];
  ideaCollections: unknown[];
}

const BACKUP_VERSION = 3;

const WEB_STORAGE_KEY = "wedding_data";

/** Save all store state to localStorage (web only, called after every mutation) */
export function saveToLocalStorage(): void {
  if (Platform.OS !== "web") return;
  try {
    localStorage.setItem(WEB_STORAGE_KEY, JSON.stringify(createBackupDocument()));
  } catch (err) {
    console.warn("[sync] saveToLocalStorage failed:", err);
  }
}

/** Collect all domain store state into a single backup document */
export function createBackupDocument(): Record<string, unknown> {
  return {
    version: BACKUP_VERSION,
    timestamp: new Date().toISOString(),
    wedding: useWeddingStore.getState().wedding,
    guests: useGuestsStore.getState().guests,
    tables: useGuestsStore.getState().tables,
    guestGroups: useGuestsStore.getState().groups,
    vendors: useVendorsStore.getState().vendors,
    quotePricings: useVendorsStore.getState().quotePricings,
    tasks: usePlanningStore.getState().tasks,
    taskCategories: usePlanningStore.getState().categories,
    agendaEvents: usePlanningStore.getState().agendaEvents,
    dayOfItems: usePlanningStore.getState().dayOfItems,
    ideas: useIdeasStore.getState().ideas,
    ideaCollections: useIdeasStore.getState().collections,
  };
}

/** Restore all stores + SQLite from a pulled backup document */
export function restoreFromBackup(
  data: Record<string, unknown>,
  db: DrizzleDB | null,
): void {
  const backup = data as unknown as BackupData;

  if (backup.version > BACKUP_VERSION) {
    throw new Error(
      `Backup version ${backup.version} is newer than app version ${BACKUP_VERSION}. Please update WeddingOS.`
    );
  }

  // Backward compat: migrate v1 → v2 field names
  const raw = data as any;
  const dayOfItems = backup.dayOfItems ?? raw.jourJItems ?? [];
  const quotePricings = ((backup.quotePricings || []) as any[]).map(migrateQuotePricing);
  const ideas = ((backup.ideas || []) as any[]).map(migrateIdea);

  // v2 → v3: migrate DINNER/NEXT_DAY invitation types and pppSource
  const migrateInvType = (t: string) =>
    t === "DINNER" ? "FULL" : t === "NEXT_DAY" ? "BOTH_DAYS" : t;
  const migratePppSource = (s: string | null) =>
    s === "DINNER" ? "FULL" : s === "NEXT_DAY" ? "BOTH_DAYS" : s;

  if (db) {
    // Native: write to SQLite (source of truth) then re-hydrate stores from it
    restoreAllTables(db, {
      wedding: backup.wedding,
      guests: ((backup.guests || []) as any[]).map((g: any) => ({
        ...g,
        invitationType: migrateInvType(g.invitationType ?? g.invitation_type ?? "FULL"),
      })),
      tables: (backup.tables || []) as any[],
      guestGroups: (backup.guestGroups || []) as any[],
      vendors: ((backup.vendors || []) as any[]).map((v: any) => ({
        ...v,
        pppSource: migratePppSource(v.pppSource ?? v.ppp_source ?? null),
      })),
      quotePricings: quotePricings as any[],
      tasks: ((backup.tasks || []) as any[]).map((t: any) =>
        t.status === "IN_PROGRESS" || t.status === "CANCELLED"
          ? { ...t, status: "TODO" }
          : t
      ),
      taskCategories: (backup.taskCategories || []) as any[],
      agendaEvents: (backup.agendaEvents || []) as any[],
      dayOfItems: dayOfItems as any[],
      ideas: ideas as any[],
      ideaCollections: (backup.ideaCollections || []) as any[],
    });
    hydrateAllStores(db);
  } else {
    // Web: hydrate Zustand stores directly from the backup data
    if (backup.wedding) useWeddingStore.getState().setWedding(backup.wedding as any);
    useGuestsStore.getState().setGroups((backup.guestGroups || []) as any[]);
    useGuestsStore.getState().setGuests(
      ((backup.guests || []) as any[]).map((g: any) => ({
        ...g,
        invitationType: migrateInvType(g.invitationType ?? g.invitation_type ?? "FULL"),
      }))
    );
    useGuestsStore.getState().setTables((backup.tables || []) as any[]);
    useVendorsStore.getState().setVendors(
      ((backup.vendors || []) as any[]).map((v: any) => ({
        ...v,
        pppSource: migratePppSource(v.pppSource ?? v.ppp_source ?? null),
      }))
    );
    useVendorsStore.getState().setQuotePricings(quotePricings as any[]);
    usePlanningStore.getState().setCategories((backup.taskCategories || []) as any[]);
    const restoredTasks = ((backup.tasks || []) as any[]).map((t: any) =>
      t.status === "IN_PROGRESS" || t.status === "CANCELLED"
        ? { ...t, status: "TODO" }
        : t
    );
    usePlanningStore.getState().setTasks(restoredTasks);
    usePlanningStore.getState().setAgendaEvents((backup.agendaEvents || []) as any[]);
    usePlanningStore.getState().setDayOfItems(dayOfItems as any[]);
    useIdeasStore.getState().setCollections((backup.ideaCollections || []) as any[]);
    useIdeasStore.getState().setIdeas(ideas as any[]);
    saveToLocalStorage();
  }
}

// ─── v1 → v2 migration helpers ────────────────────────────────────────────

const PRICING_KEY_MAP: Record<string, string> = {
  repas: "dinner",
  boisson: "drinks",
  lendemain: "next-day",
  vaisselle: "tableware",
  nappe: "linen",
  vegetarien: "vegetarian",
  enfant: "child",
  presta: "service",
};

const IDEA_CATEGORY_MAP: Record<string, string> = {
  DECO_TABLE: "TABLE_DECOR",
  DECO_SALLE: "VENUE_DECOR",
  DECO_CEREMONIE: "CEREMONY_DECOR",
  TENUE: "ATTIRE",
  GATEAU: "CAKE",
  LIEU: "VENUE",
};

function migrateQuotePricing(p: any): any {
  const needsFieldRename = (p.forfaitPersonnel != null && p.staffFee == null) ||
    (p.forfaitDeplacement != null && p.travelFee == null);
  const needsKeyRename = p.pricingKey && PRICING_KEY_MAP[p.pricingKey];
  if (!needsFieldRename && !needsKeyRename) return p;

  const migrated = { ...p };
  if (p.forfaitPersonnel != null && p.staffFee == null) {
    migrated.staffFee = p.forfaitPersonnel;
    delete migrated.forfaitPersonnel;
  }
  if (p.forfaitDeplacement != null && p.travelFee == null) {
    migrated.travelFee = p.forfaitDeplacement;
    delete migrated.forfaitDeplacement;
  }
  if (needsKeyRename) {
    migrated.pricingKey = PRICING_KEY_MAP[p.pricingKey];
  }
  return migrated;
}

function migrateIdea(idea: any): any {
  if (idea.category && IDEA_CATEGORY_MAP[idea.category]) {
    return { ...idea, category: IDEA_CATEGORY_MAP[idea.category] };
  }
  return idea;
}
