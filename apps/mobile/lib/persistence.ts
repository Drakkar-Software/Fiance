/**
 * Store↔KV persistence layer
 * Handles hydration on boot and write-through on mutations.
 * Each "persist" function writes the full collection from the matching Zustand store.
 */

import type { SQLiteStorage } from "expo-sqlite/kv-store";
import { useWeddingStore } from "@/store/useWeddingStore";
import { consumePendingWeddingSeed } from "./pending-wedding-seed";
import { useEntitlementsStore } from "@/store/useEntitlementsStore";
import { hydrateOptimisticPurchase, useOptimisticPurchaseStore } from "@/store/useOptimisticPurchaseStore";
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
import { usePermissionsStore } from "@/store/usePermissionsStore";
import { DEFAULT_INVITATION_TYPES, DEFAULT_COMMUNICATION_TEMPLATES, DEFAULT_LEGAL_MILESTONES } from "@/db/types";
import { synthesizePrimaryEvent, migrateRoleAssignments, DEFAULT_PERMISSION_ROLES } from "@fiance/sdk";
import { readCollection, writeCollection } from "./kv-storage";

// ─── Clear all stores (for wedding switching) ──────────────────────────────

export function clearAllStores(): void {
  useEntitlementsStore.getState().setFeatures([]);
  useOptimisticPurchaseStore.getState().clearRecord();
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
  useContributorsStore.getState().setContributors([]);
  useInvitationTypesStore.getState().setInvitationTypes([]);
  useCommunicationsStore.getState().setCommunications([]);
  useWeddingPartyStore.getState().setWeddingRoles([]);
  useWeddingPartyStore.getState().setWeddingRoleAssignments([]);
  useSeatingConstraintsStore.getState().setSeatingConstraints([]);
  useWeddingEventsStore.getState().setWeddingEvents([]);
  useMealSelectionsStore.getState().setMealSelections([]);
  useCommunicationTemplatesStore.getState().setCommunicationTemplates([]);
  useDocumentsStore.getState().setDocuments([]);
  useLegalStore.getState().setLegalMilestones([]);
  useHoneymoonStore.getState().setHoneymoonPlans([]);
  useCeremonyStore.getState().setCeremonyItems([]);
  useSpeechesMusicStore.getState().setSpeeches([]);
  useSpeechesMusicStore.getState().setPlaylistTracks([]);
  usePermissionsStore.getState().setRoles([]);
  usePermissionsStore.getState().setAssignments([]);
}

// ─── Hydrate all stores from KV on boot ────────────────────────────────────

export function hydrateAllStores(_storage: SQLiteStorage): void {
  const entitlements = readCollection<string[]>("entitlements");
  if (entitlements) useEntitlementsStore.getState().setFeatures(entitlements);
  hydrateOptimisticPurchase();

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

  useContributorsStore.getState().setContributors(readCollection<any[]>("contributors") ?? []);

  useCommunicationsStore.getState().setCommunications(readCollection<any[]>("communications") ?? []);

  const storedWeddingRoles = readCollection<any[]>("weddingRoles") ?? [];
  const storedRoleAssignments = readCollection<any[]>("weddingRoleAssignments") ?? [];
  if (storedWeddingRoles.length === 0 && storedRoleAssignments.length > 0) {
    // Legacy enum-based assignments (no roleId yet): derive a role catalog and remap.
    const migrated = migrateRoleAssignments(storedRoleAssignments);
    useWeddingPartyStore.getState().setWeddingRoles(migrated.roles);
    useWeddingPartyStore.getState().setWeddingRoleAssignments(migrated.assignments);
    writeCollection("weddingRoles", migrated.roles);
    writeCollection("weddingRoleAssignments", migrated.assignments);
  } else {
    useWeddingPartyStore.getState().setWeddingRoles(storedWeddingRoles);
    useWeddingPartyStore.getState().setWeddingRoleAssignments(storedRoleAssignments);
  }
  useSeatingConstraintsStore.getState().setSeatingConstraints(readCollection<any[]>("seatingConstraints") ?? []);
  useMealSelectionsStore.getState().setMealSelections(readCollection<any[]>("guestMealSelections") ?? []);
  useDocumentsStore.getState().setDocuments(readCollection<any[]>("documents") ?? []);
  useHoneymoonStore.getState().setHoneymoonPlans(readCollection<any[]>("honeymoonPlans") ?? []);

  const storedWeddingEvents = readCollection<any[]>("weddingEvents") ?? [];
  if (storedWeddingEvents.length > 0) {
    useWeddingEventsStore.getState().setWeddingEvents(storedWeddingEvents);
  } else {
    const synthesized = synthesizePrimaryEvent(wedding ?? null);
    const events = synthesized ? [synthesized] : [];
    useWeddingEventsStore.getState().setWeddingEvents(events);
    if (synthesized) writeCollection("weddingEvents", events);
  }

  const storedInvTypes = readCollection<any[]>("invitationTypes");
  if (storedInvTypes && storedInvTypes.length > 0) {
    useInvitationTypesStore.getState().setInvitationTypes(storedInvTypes);
  } else {
    const now = new Date().toISOString();
    const defaults = DEFAULT_INVITATION_TYPES.map((t) => ({ ...t, createdAt: now, updatedAt: now }));
    useInvitationTypesStore.getState().setInvitationTypes(defaults);
    writeCollection("invitationTypes", defaults);
  }

  const storedTemplates = readCollection<any[]>("communicationTemplates");
  if (storedTemplates && storedTemplates.length > 0) {
    useCommunicationTemplatesStore.getState().setCommunicationTemplates(storedTemplates);
  } else {
    const now = new Date().toISOString();
    const defaultTemplates = DEFAULT_COMMUNICATION_TEMPLATES.map((tpl, i) => ({
      id: `system-template-${i + 1}`,
      ...tpl,
      isSystem: true,
      createdAt: now,
      updatedAt: now,
    }));
    useCommunicationTemplatesStore.getState().setCommunicationTemplates(defaultTemplates);
    writeCollection("communicationTemplates", defaultTemplates);
  }

  const storedMilestones = readCollection<any[]>("legalMilestones");
  if (storedMilestones && storedMilestones.length > 0) {
    useLegalStore.getState().setLegalMilestones(storedMilestones);
  } else {
    const now = new Date().toISOString();
    const defaultMilestones = DEFAULT_LEGAL_MILESTONES.map((m, i) => ({
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
    useLegalStore.getState().setLegalMilestones(defaultMilestones);
    writeCollection("legalMilestones", defaultMilestones);
  }

  useCeremonyStore.getState().setCeremonyItems(readCollection<any[]>("ceremonyItems") ?? []);
  useSpeechesMusicStore.getState().setSpeeches(readCollection<any[]>("speeches") ?? []);
  useSpeechesMusicStore.getState().setPlaylistTracks(readCollection<any[]>("playlistTracks") ?? []);

  usePermissionsStore.getState().setAssignments(readCollection<any[]>("permissionAssignments") ?? []);
  const storedPermissionRoles = readCollection<any[]>("permissionRoles");
  if (storedPermissionRoles && storedPermissionRoles.length > 0) {
    usePermissionsStore.getState().setRoles(storedPermissionRoles);
  } else {
    const now = new Date().toISOString();
    const defaultRoles = DEFAULT_PERMISSION_ROLES.map((r) => ({ ...r, createdAt: now, updatedAt: now }));
    usePermissionsStore.getState().setRoles(defaultRoles);
    writeCollection("permissionRoles", defaultRoles);
  }

  // Apply the couple names + date captured during onboarding, now that the
  // new wedding's DB is active. Consume-once so it never leaks into another wedding.
  const seed = consumePendingWeddingSeed();
  if (seed && (seed.partner1Name || seed.partner2Name || seed.weddingDate)) {
    useWeddingStore.getState().updateWedding({
      partner1Name: seed.partner1Name,
      partner2Name: seed.partner2Name,
      weddingDate: seed.weddingDate,
    });
  }
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

export function persistContributors(_storage: SQLiteStorage): void {
  writeCollection("contributors", useContributorsStore.getState().contributors);
}

export function persistInvitationTypes(_storage: SQLiteStorage): void {
  writeCollection("invitationTypes", useInvitationTypesStore.getState().invitationTypes);
}

export function persistCommunications(_storage: SQLiteStorage): void {
  writeCollection("communications", useCommunicationsStore.getState().communications);
}

export function persistWeddingRoles(_storage: SQLiteStorage): void {
  writeCollection("weddingRoles", useWeddingPartyStore.getState().weddingRoles);
}

export function persistWeddingRoleAssignments(_storage: SQLiteStorage): void {
  writeCollection("weddingRoleAssignments", useWeddingPartyStore.getState().weddingRoleAssignments);
}

export function persistSeatingConstraints(_storage: SQLiteStorage): void {
  writeCollection("seatingConstraints", useSeatingConstraintsStore.getState().seatingConstraints);
}

export function persistWeddingEvents(_storage: SQLiteStorage): void {
  writeCollection("weddingEvents", useWeddingEventsStore.getState().weddingEvents);
}

export function persistMealSelections(_storage: SQLiteStorage): void {
  writeCollection("guestMealSelections", useMealSelectionsStore.getState().mealSelections);
}

export function persistCommunicationTemplates(_storage: SQLiteStorage): void {
  writeCollection("communicationTemplates", useCommunicationTemplatesStore.getState().communicationTemplates);
}

export function persistDocuments(_storage: SQLiteStorage): void {
  writeCollection("documents", useDocumentsStore.getState().documents);
}

export function persistLegalMilestones(_storage: SQLiteStorage): void {
  writeCollection("legalMilestones", useLegalStore.getState().legalMilestones);
}

export function persistHoneymoonPlans(_storage: SQLiteStorage): void {
  writeCollection("honeymoonPlans", useHoneymoonStore.getState().honeymoonPlans);
}

export function persistCeremonyItems(_storage: SQLiteStorage): void {
  writeCollection("ceremonyItems", useCeremonyStore.getState().ceremonyItems);
}

export function persistSpeeches(_storage: SQLiteStorage): void {
  writeCollection("speeches", useSpeechesMusicStore.getState().speeches);
}

export function persistPlaylistTracks(_storage: SQLiteStorage): void {
  writeCollection("playlistTracks", useSpeechesMusicStore.getState().playlistTracks);
}

export function persistPermissionRoles(_storage: SQLiteStorage): void {
  writeCollection("permissionRoles", usePermissionsStore.getState().roles);
}

export function persistPermissionAssignments(_storage: SQLiteStorage): void {
  writeCollection("permissionAssignments", usePermissionsStore.getState().assignments);
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
  contributors?: any[];
  invitationTypes?: any[];
  communications?: any[];
  weddingRoles?: any[];
  weddingRoleAssignments?: any[];
  seatingConstraints?: any[];
  weddingEvents?: any[];
  guestMealSelections?: any[];
  communicationTemplates?: any[];
  documents?: any[];
  legalMilestones?: any[];
  honeymoonPlans?: any[];
  ceremonyItems?: any[];
  speeches?: any[];
  playlistTracks?: any[];
  permissionRoles?: any[];
  permissionAssignments?: any[];
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
  writeCollection("contributors", data.contributors ?? []);
  writeCollection("invitationTypes", data.invitationTypes ?? []);
  writeCollection("communications", data.communications ?? []);
  writeCollection("weddingRoles", data.weddingRoles ?? []);
  writeCollection("weddingRoleAssignments", data.weddingRoleAssignments ?? []);
  writeCollection("seatingConstraints", data.seatingConstraints ?? []);
  writeCollection("weddingEvents", data.weddingEvents ?? []);
  writeCollection("guestMealSelections", data.guestMealSelections ?? []);
  writeCollection("communicationTemplates", data.communicationTemplates ?? []);
  writeCollection("documents", data.documents ?? []);
  writeCollection("legalMilestones", data.legalMilestones ?? []);
  writeCollection("honeymoonPlans", data.honeymoonPlans ?? []);
  writeCollection("ceremonyItems", data.ceremonyItems ?? []);
  writeCollection("speeches", data.speeches ?? []);
  writeCollection("playlistTracks", data.playlistTracks ?? []);
  writeCollection("permissionRoles", data.permissionRoles ?? []);
  writeCollection("permissionAssignments", data.permissionAssignments ?? []);
}
