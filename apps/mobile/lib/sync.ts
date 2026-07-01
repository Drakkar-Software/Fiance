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
import { useContributorsStore } from "@/store/useContributorsStore";
import { useInvitationTypesStore } from "@/store/useInvitationTypesStore";
import { useCommunicationsStore } from "@/store/useCommunicationsStore";
import { useWeddingPartyStore } from "@/store/useWeddingPartyStore";
import { useSeatingConstraintsStore } from "@/store/useSeatingConstraintsStore";
import { useWeddingEventsStore } from "@/store/useWeddingEventsStore";
import { useMealSelectionsStore } from "@/store/useMealSelectionsStore";
import { useCommunicationTemplatesStore } from "@/store/useCommunicationTemplatesStore";
import { useDocumentsStore } from "@/store/useDocumentsStore";
import { useLegalStore } from "@/store/useLegalStore";
import { useHoneymoonStore } from "@/store/useHoneymoonStore";
import { useCeremonyStore } from "@/store/useCeremonyStore";
import { useSpeechesMusicStore } from "@/store/useSpeechesMusicStore";
import { DEFAULT_INVITATION_TYPES, DEFAULT_COMMUNICATION_TEMPLATES, DEFAULT_LEGAL_MILESTONES, synthesizePrimaryEvent, migrateRoleAssignments } from "@fiance/sdk";
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
  contributors?: unknown[];
  invitationTypes?: unknown[];
  communications?: unknown[];
  weddingRoles?: unknown[];
  weddingRoleAssignments?: unknown[];
  seatingConstraints?: unknown[];
  weddingEvents?: unknown[];
  guestMealSelections?: unknown[];
  communicationTemplates?: unknown[];
  documents?: unknown[];
  legalMilestones?: unknown[];
  honeymoonPlans?: unknown[];
  ceremonyItems?: unknown[];
  speeches?: unknown[];
  playlistTracks?: unknown[];
}

// v8 → v9: added weddingEvents + guestMealSelections collections;
//          eventId FK on agendaEvents/dayOfItems/vendors
// v9 → v10: added guest logistics fields; Communication content fields;
//           communicationTemplates collection (seeded with 3 system templates)
// v10 → v11: added documents collection (localUri stripped to "" on export);
//            Vendor comparison fields (comparisonGroupId/isSelected/sortOrder)
// v11 → v12: added legalMilestones (seeded with FR defaults); honeymoonPlans (0–1 row)
// v12 → v13: fixed GuestRole enum replaced by a user-created weddingRoles catalog;
//            weddingRoleAssignments now link guestId → roleId (external, non-guest
//            role-holders are no longer supported and are dropped on migration)
// v13 → v14: added contributors collection (additive, no migration)
// v14 → v15: added ceremonyItems, speeches, playlistTracks collections
//            (additive, no migration); dayOfItems gained completedAt/roleId fields
const BACKUP_VERSION = 15;

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
    contributors: useContributorsStore.getState().contributors,
    invitationTypes: useInvitationTypesStore.getState().invitationTypes,
    communications: useCommunicationsStore.getState().communications,
    weddingRoles: useWeddingPartyStore.getState().weddingRoles,
    weddingRoleAssignments: useWeddingPartyStore.getState().weddingRoleAssignments,
    seatingConstraints: useSeatingConstraintsStore.getState().seatingConstraints,
    weddingEvents: useWeddingEventsStore.getState().weddingEvents,
    guestMealSelections: useMealSelectionsStore.getState().mealSelections,
    communicationTemplates: useCommunicationTemplatesStore.getState().communicationTemplates,
    // Binaries never leave the device: strip localUri, metadata only.
    documents: useDocumentsStore.getState().documents.map((d) => ({ ...d, localUri: "" })),
    legalMilestones: useLegalStore.getState().legalMilestones,
    honeymoonPlans: useHoneymoonStore.getState().honeymoonPlans,
    ceremonyItems: useCeremonyStore.getState().ceremonyItems,
    speeches: useSpeechesMusicStore.getState().speeches,
    playlistTracks: useSpeechesMusicStore.getState().playlistTracks,
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
  // v7 → v8: added weddingRoleAssignments, seatingConstraints collections (additive, no migration)
  // v8 → v9: added weddingEvents collection; auto-migrate a synthetic primary event
  //          from wedding.weddingDate/venueName when no WeddingEvent rows exist yet
  // v12 → v13: fixed GuestRole enum replaced by a user-created weddingRoles catalog;
  //            legacy enum-based weddingRoleAssignments migrated via migrateRoleAssignments

  const now = new Date().toISOString();
  const rawInvTypes = (backup.invitationTypes || []) as any[];
  const restoredInvitationTypes = rawInvTypes.length > 0
    ? rawInvTypes
    : DEFAULT_INVITATION_TYPES.map((t) => ({ ...t, createdAt: now, updatedAt: now }));

  const rawWeddingEvents = (backup.weddingEvents || []) as any[];
  const synthesizedEvent = rawWeddingEvents.length === 0 ? synthesizePrimaryEvent(backup.wedding as any) : null;
  const restoredWeddingEvents = synthesizedEvent ? [synthesizedEvent] : rawWeddingEvents;

  const rawTemplates = (backup.communicationTemplates || []) as any[];
  const restoredCommunicationTemplates = rawTemplates.length > 0
    ? rawTemplates
    : DEFAULT_COMMUNICATION_TEMPLATES.map((tpl, i) => ({
        id: `system-template-${i + 1}`,
        ...tpl,
        isSystem: true,
        createdAt: now,
        updatedAt: now,
      }));

  const rawWeddingRoles = (backup.weddingRoles || []) as any[];
  const rawRoleAssignments = (backup.weddingRoleAssignments || []) as any[];
  const migratedRoles = rawWeddingRoles.length === 0 ? migrateRoleAssignments(rawRoleAssignments) : null;
  const restoredWeddingRoles = migratedRoles ? migratedRoles.roles : rawWeddingRoles;
  const restoredRoleAssignments = migratedRoles ? migratedRoles.assignments : rawRoleAssignments;

  const rawLegalMilestones = (backup.legalMilestones || []) as any[];
  const restoredLegalMilestones = rawLegalMilestones.length > 0
    ? rawLegalMilestones
    : DEFAULT_LEGAL_MILESTONES.map((m, i) => ({
        id: `system-milestone-${i + 1}`,
        type: m.type,
        title: m.title,
        dueDate: null,
        completedDate: null,
        status: "TODO",
        location: null,
        notes: null,
        documentIds: null,
        reminderDaysBefore: null,
        createdAt: now,
        updatedAt: now,
      }));

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
    contributors: (backup.contributors || []) as any[],
    invitationTypes: restoredInvitationTypes,
    communications: (backup.communications || []) as any[],
    weddingRoles: restoredWeddingRoles,
    weddingRoleAssignments: restoredRoleAssignments,
    seatingConstraints: (backup.seatingConstraints || []) as any[],
    weddingEvents: restoredWeddingEvents,
    guestMealSelections: (backup.guestMealSelections || []) as any[],
    communicationTemplates: restoredCommunicationTemplates,
    documents: (backup.documents || []) as any[],
    legalMilestones: restoredLegalMilestones,
    honeymoonPlans: (backup.honeymoonPlans || []) as any[],
    ceremonyItems: (backup.ceremonyItems || []) as any[],
    speeches: (backup.speeches || []) as any[],
    playlistTracks: (backup.playlistTracks || []) as any[],
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
    useContributorsStore.getState().setContributors(restoredData.contributors);
    useInvitationTypesStore.getState().setInvitationTypes(restoredData.invitationTypes);
    useCommunicationsStore.getState().setCommunications(restoredData.communications);
    useWeddingPartyStore.getState().setWeddingRoles(restoredData.weddingRoles);
    useWeddingPartyStore.getState().setWeddingRoleAssignments(restoredData.weddingRoleAssignments);
    useSeatingConstraintsStore.getState().setSeatingConstraints(restoredData.seatingConstraints);
    useWeddingEventsStore.getState().setWeddingEvents(restoredData.weddingEvents);
    useMealSelectionsStore.getState().setMealSelections(restoredData.guestMealSelections);
    useCommunicationTemplatesStore.getState().setCommunicationTemplates(restoredData.communicationTemplates);
    useDocumentsStore.getState().setDocuments(restoredData.documents);
    useLegalStore.getState().setLegalMilestones(restoredData.legalMilestones);
    useHoneymoonStore.getState().setHoneymoonPlans(restoredData.honeymoonPlans);
    useCeremonyStore.getState().setCeremonyItems(restoredData.ceremonyItems);
    useSpeechesMusicStore.getState().setSpeeches(restoredData.speeches);
    useSpeechesMusicStore.getState().setPlaylistTracks(restoredData.playlistTracks);
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
