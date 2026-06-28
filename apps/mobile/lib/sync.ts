/**
 * Cloud sync utilities for Fiancé
 * Handles backup document creation and restoration via Starfish
 */

import type { SQLiteStorage } from "expo-sqlite/kv-store";
import { useWeddingStore } from "@/store/useWeddingStore";
import { useGuestsStore } from "@/store/useGuestsStore";
import { useVendorsStore } from "@/store/useVendorsStore";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useIdeasStore } from "@/store/useIdeasStore";
import { useAccommodationsStore } from "@/store/useAccommodationsStore";
import { useGiftsStore } from "@/store/useGiftsStore";
import { useInvitationTypesStore } from "@/store/useInvitationTypesStore";
import { useCommunicationsStore } from "@/store/useCommunicationsStore";
import { DEFAULT_INVITATION_TYPES } from "@fiance/sdk";
import { restoreAllTables, hydrateAllStores } from "./persistence";

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
  vendorPayments: unknown[];
  accommodations: unknown[];
  gifts: unknown[];
  invitationTypes?: unknown[];
  communications?: unknown[];
}

// v6 → v7: added communications collection
const BACKUP_VERSION = 7;

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
    vendorPayments: useVendorsStore.getState().vendorPayments,
    accommodations: useAccommodationsStore.getState().accommodations,
    gifts: useGiftsStore.getState().gifts,
    invitationTypes: useInvitationTypesStore.getState().invitationTypes,
    communications: useCommunicationsStore.getState().communications,
  };
}

/** Restore all stores + KV storage from a pulled backup document */
export function restoreFromBackup(
  data: Record<string, unknown>,
  storage: SQLiteStorage | null,
): void {
  const backup = data as unknown as BackupData;

  if (backup.version > BACKUP_VERSION) {
    throw new Error(
      `Backup version ${backup.version} is newer than app version ${BACKUP_VERSION}. Please update Fiancé.`
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

  // v3 → v4: added companionId field on guests (nullable, no migration needed)
  // v4 → v5: added vendorPayments, accommodations, gifts tables + new guest columns
  // v5 → v6: added invitationTypes collection (user-configurable)
  // v6 → v7: added communications collection (user-created, with embedded recipients)

  const now = new Date().toISOString();
  const rawInvTypes = (backup.invitationTypes || []) as any[];
  const restoredInvitationTypes = rawInvTypes.length > 0
    ? rawInvTypes
    : DEFAULT_INVITATION_TYPES.map((t) => ({ ...t, createdAt: now, updatedAt: now }));

  const restoredData = {
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
    vendorPayments: (backup.vendorPayments || []) as any[],
    accommodations: (backup.accommodations || []) as any[],
    gifts: (backup.gifts || []) as any[],
    invitationTypes: restoredInvitationTypes,
    communications: (backup.communications || []) as any[],
  };

  // Write to KV storage then re-hydrate stores from it
  if (storage) {
    restoreAllTables(storage, restoredData);
    hydrateAllStores(storage);
  } else {
    // KV not ready (shouldn't happen in normal flow, but hydrate stores directly)
    if (restoredData.wedding) useWeddingStore.getState().setWedding(restoredData.wedding as any);
    useGuestsStore.getState().setGroups(restoredData.guestGroups);
    useGuestsStore.getState().setGuests(restoredData.guests);
    useGuestsStore.getState().setTables(restoredData.tables);
    useVendorsStore.getState().setVendors(restoredData.vendors);
    useVendorsStore.getState().setQuotePricings(restoredData.quotePricings);
    useVendorsStore.getState().setVendorPayments(restoredData.vendorPayments);
    usePlanningStore.getState().setCategories(restoredData.taskCategories);
    usePlanningStore.getState().setTasks(restoredData.tasks);
    usePlanningStore.getState().setAgendaEvents(restoredData.agendaEvents);
    usePlanningStore.getState().setDayOfItems(restoredData.dayOfItems);
    useIdeasStore.getState().setCollections(restoredData.ideaCollections);
    useIdeasStore.getState().setIdeas(restoredData.ideas);
    useAccommodationsStore.getState().setAccommodations(restoredData.accommodations);
    useGiftsStore.getState().setGifts(restoredData.gifts);
    useInvitationTypesStore.getState().setInvitationTypes(restoredData.invitationTypes);
    useCommunicationsStore.getState().setCommunications(restoredData.communications);
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
