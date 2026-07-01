/**
 * Backup serialisation / deserialisation — pure, no store references.
 * The app-side lib/sync.ts wraps these with store reads/writes.
 */

// NodeNext .js extension required
import { DEFAULT_INVITATION_TYPES, DEFAULT_COMMUNICATION_TEMPLATES, DEFAULT_LEGAL_MILESTONES } from '../domain/types.js';
import { synthesizePrimaryEvent } from '../domain/wedding-events.js';
import { migrateRoleAssignments } from '../domain/wedding-party.js';
import type {
  Wedding,
  Guest,
  Table,
  GuestGroup,
  Vendor,
  QuotePricing,
  Task,
  TaskCategory,
  AgendaEvent,
  DayOfItem,
  Idea,
  IdeaCollection,
  VendorPayment,
  Accommodation,
  Gift,
  InvitationTypeEntity,
  Communication,
  WeddingRole,
  WeddingRoleAssignment,
  SeatingConstraint,
  WeddingEvent,
  GuestMealSelection,
  CommunicationTemplate,
  Document,
  LegalMilestone,
  HoneymoonPlan,
} from '../domain/schema.js';

// v8 → v9: added weddingEvents + guestMealSelections collections;
//          eventId FK on agendaEvents/dayOfItems/vendors
// v9 → v10: added guest logistics fields (shuttleVendorId, shuttlePickupLocation,
//           shuttlePickupTime, parkingNeeded, parkingNotes, arrivalNotes, transportMode);
//           Communication content fields (channel/subject/body/templateId);
//           communicationTemplates collection (seeded with 3 system templates)
// v10 → v11: added documents collection (localUri stripped to "" on backup export —
//            binaries never leave the device; import shows "re-attach" prompt);
//            Vendor comparison fields (comparisonGroupId/isSelected/sortOrder)
// v11 → v12: added legalMilestones collection (seeded with 4 FR admin defaults);
//            honeymoonPlans collection (0–1 row, singleton)
// v12 → v13: replaced the fixed GuestRole enum with a user-created weddingRoles
//            catalog; weddingRoleAssignments now link a guestId to a roleId
//            (external, non-guest role-holders are no longer supported)
export const BACKUP_VERSION = 13;

// ─── WeddingSnapshot ────────────────────────────────────────────────────────

export interface WeddingSnapshot {
  wedding: Wedding | null;
  guests: Guest[];
  tables: Table[];
  guestGroups: GuestGroup[];
  vendors: Vendor[];
  quotePricings: QuotePricing[];
  tasks: Task[];
  taskCategories: TaskCategory[];
  agendaEvents: AgendaEvent[];
  dayOfItems: DayOfItem[];
  ideas: Idea[];
  ideaCollections: IdeaCollection[];
  vendorPayments: VendorPayment[];
  accommodations: Accommodation[];
  gifts: Gift[];
  invitationTypes: InvitationTypeEntity[];
  communications: Communication[];
  weddingRoles: WeddingRole[];
  weddingRoleAssignments: WeddingRoleAssignment[];
  seatingConstraints: SeatingConstraint[];
  weddingEvents: WeddingEvent[];
  guestMealSelections: GuestMealSelection[];
  communicationTemplates: CommunicationTemplate[];
  documents: Document[];
  legalMilestones: LegalMilestone[];
  honeymoonPlans: HoneymoonPlan[];
}

// ─── BackupData ─────────────────────────────────────────────────────────────

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
  weddingRoles?: unknown[];
  weddingRoleAssignments?: unknown[];
  seatingConstraints?: unknown[];
  weddingEvents?: unknown[];
  guestMealSelections?: unknown[];
  communicationTemplates?: unknown[];
  documents?: unknown[];
  legalMilestones?: unknown[];
  honeymoonPlans?: unknown[];
}

// ─── Serialiser ─────────────────────────────────────────────────────────────

/** Pure serialiser: snapshot → backup document */
export function createBackupDocument(snapshot: WeddingSnapshot): BackupData {
  return {
    version: BACKUP_VERSION,
    timestamp: new Date().toISOString(),
    wedding: snapshot.wedding,
    guests: snapshot.guests,
    tables: snapshot.tables,
    guestGroups: snapshot.guestGroups,
    vendors: snapshot.vendors,
    quotePricings: snapshot.quotePricings,
    tasks: snapshot.tasks,
    taskCategories: snapshot.taskCategories,
    agendaEvents: snapshot.agendaEvents,
    dayOfItems: snapshot.dayOfItems,
    ideas: snapshot.ideas,
    ideaCollections: snapshot.ideaCollections,
    vendorPayments: snapshot.vendorPayments,
    accommodations: snapshot.accommodations,
    gifts: snapshot.gifts,
    invitationTypes: snapshot.invitationTypes,
    communications: snapshot.communications,
    weddingRoles: snapshot.weddingRoles,
    weddingRoleAssignments: snapshot.weddingRoleAssignments,
    seatingConstraints: snapshot.seatingConstraints,
    weddingEvents: snapshot.weddingEvents,
    guestMealSelections: snapshot.guestMealSelections,
    communicationTemplates: snapshot.communicationTemplates,
    // Binaries never leave the device: strip localUri so the exported JSON
    // carries metadata only. Import shows a "fichier non inclus" prompt.
    documents: snapshot.documents.map((d) => ({ ...d, localUri: '' })),
    legalMilestones: snapshot.legalMilestones,
    honeymoonPlans: snapshot.honeymoonPlans,
  };
}

// ─── v1→v2 migration helpers ─────────────────────────────────────────────────

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

function migrateQuotePricing(p: Record<string, unknown>): Record<string, unknown> {
  const needsFieldRename =
    (p.forfaitPersonnel != null && p.staffFee == null) ||
    (p.forfaitDeplacement != null && p.travelFee == null);
  const needsKeyRename =
    typeof p.pricingKey === "string" && PRICING_KEY_MAP[p.pricingKey];
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
  if (typeof p.pricingKey === "string" && PRICING_KEY_MAP[p.pricingKey]) {
    migrated.pricingKey = PRICING_KEY_MAP[p.pricingKey];
  }
  return migrated;
}

function migrateIdea(idea: Record<string, unknown>): Record<string, unknown> {
  if (typeof idea.category === "string" && IDEA_CATEGORY_MAP[idea.category]) {
    return { ...idea, category: IDEA_CATEGORY_MAP[idea.category] };
  }
  return idea;
}

// ─── Deserialiser / migration chain ─────────────────────────────────────────

/**
 * Pure deserialiser: backup document → WeddingSnapshot.
 * Runs the v1→v6 migration chain inline.
 * Throws if the backup version is newer than BACKUP_VERSION.
 */
export function restoreFromBackup(doc: BackupData): WeddingSnapshot {
  if (doc.version > BACKUP_VERSION) {
    throw new Error(
      `Backup version ${doc.version} is newer than app version ${BACKUP_VERSION}. Please update Fiancé.`
    );
  }

  // Cast through unknown to access legacy field names (jourJItems etc.)
  const raw = doc as unknown as Record<string, unknown>;

  // v1 → v2: field renames on dayOfItems and pricingKeys
  const dayOfItemsRaw = ((doc.dayOfItems ?? raw.jourJItems ?? []) as unknown[]) as Record<string, unknown>[];
  const quotePricings = ((doc.quotePricings || []) as unknown[] as Record<string, unknown>[]).map(migrateQuotePricing);
  const ideas = ((doc.ideas || []) as unknown[] as Record<string, unknown>[]).map(migrateIdea);

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
  // v9 → v10: added guest logistics fields (additive, no migration needed)
  // v10 → v11: added documents collection (localUri arrives stripped, "" means
  //            re-attach on this device); Vendor comparison fields (additive)
  // v11 → v12: added legalMilestones (seeded with FR defaults when empty);
  //            honeymoonPlans (additive, 0–1 row, no migration needed)
  // v12 → v13: fixed GuestRole enum replaced by a user-created weddingRoles
  //            catalog; legacy enum-based weddingRoleAssignments (and any
  //            external, non-guest entries) are migrated via migrateRoleAssignments

  const now = new Date().toISOString();
  const rawInvTypes = ((doc.invitationTypes || []) as unknown[]) as Record<string, unknown>[];
  const restoredInvitationTypes =
    rawInvTypes.length > 0
      ? rawInvTypes
      : DEFAULT_INVITATION_TYPES.map((t) => ({ ...t, createdAt: now, updatedAt: now }));

  const wedding = (doc.wedding as Wedding | null) ?? null;
  const rawWeddingEvents = (doc.weddingEvents || []) as unknown as WeddingEvent[];
  const synthesizedEvent = rawWeddingEvents.length === 0 ? synthesizePrimaryEvent(wedding) : null;
  const restoredWeddingEvents = synthesizedEvent ? [synthesizedEvent] : rawWeddingEvents;

  const rawTemplates = ((doc.communicationTemplates || []) as unknown[]) as Record<string, unknown>[];
  const restoredCommunicationTemplates =
    rawTemplates.length > 0
      ? rawTemplates
      : DEFAULT_COMMUNICATION_TEMPLATES.map((tpl, i) => ({
          id: `system-template-${i + 1}`,
          ...tpl,
          isSystem: true,
          createdAt: now,
          updatedAt: now,
        }));

  const rawWeddingRoles = (doc.weddingRoles || []) as unknown as WeddingRole[];
  const rawRoleAssignments = (doc.weddingRoleAssignments || []) as unknown[];
  const migratedRoles = rawWeddingRoles.length === 0 ? migrateRoleAssignments(rawRoleAssignments) : null;
  const restoredWeddingRoles = migratedRoles ? migratedRoles.roles : rawWeddingRoles;
  const restoredRoleAssignments = migratedRoles
    ? migratedRoles.assignments
    : (rawRoleAssignments as unknown as WeddingRoleAssignment[]);

  const rawLegalMilestones = ((doc.legalMilestones || []) as unknown[]) as Record<string, unknown>[];
  const restoredLegalMilestones =
    rawLegalMilestones.length > 0
      ? rawLegalMilestones
      : DEFAULT_LEGAL_MILESTONES.map((m, i) => ({
          id: `system-milestone-${i + 1}`,
          type: m.type,
          title: m.title,
          dueDate: null,
          completedDate: null,
          status: 'TODO',
          location: null,
          notes: null,
          documentIds: null,
          reminderDaysBefore: null,
          createdAt: now,
          updatedAt: now,
        }));

  return {
    wedding,
    guests: ((doc.guests || []) as unknown[] as Record<string, unknown>[]).map((g) => ({
      ...g,
      invitationType: migrateInvType(
        (g.invitationType ?? g.invitation_type ?? "FULL") as string
      ),
    })) as unknown as Guest[],
    tables: (doc.tables || []) as unknown as Table[],
    guestGroups: (doc.guestGroups || []) as unknown as GuestGroup[],
    vendors: ((doc.vendors || []) as unknown[] as Record<string, unknown>[]).map((v) => ({
      ...v,
      pppSource: migratePppSource(
        (v.pppSource ?? v.ppp_source ?? null) as string | null
      ),
    })) as unknown as Vendor[],
    quotePricings: quotePricings as unknown as QuotePricing[],
    tasks: ((doc.tasks || []) as unknown[] as Record<string, unknown>[]).map((t) =>
      t.status === "IN_PROGRESS" || t.status === "CANCELLED"
        ? { ...t, status: "TODO" }
        : t
    ) as unknown as Task[],
    taskCategories: (doc.taskCategories || []) as unknown as TaskCategory[],
    agendaEvents: (doc.agendaEvents || []) as unknown as AgendaEvent[],
    dayOfItems: dayOfItemsRaw as unknown as DayOfItem[],
    ideas: ideas as unknown as Idea[],
    ideaCollections: (doc.ideaCollections || []) as unknown as IdeaCollection[],
    vendorPayments: (doc.vendorPayments || []) as unknown as VendorPayment[],
    accommodations: (doc.accommodations || []) as unknown as Accommodation[],
    gifts: (doc.gifts || []) as unknown as Gift[],
    invitationTypes: restoredInvitationTypes as unknown as InvitationTypeEntity[],
    communications: (doc.communications || []) as unknown as Communication[],
    weddingRoles: restoredWeddingRoles,
    weddingRoleAssignments: restoredRoleAssignments,
    seatingConstraints: (doc.seatingConstraints || []) as unknown as SeatingConstraint[],
    weddingEvents: restoredWeddingEvents,
    guestMealSelections: (doc.guestMealSelections || []) as unknown as GuestMealSelection[],
    communicationTemplates: restoredCommunicationTemplates as unknown as CommunicationTemplate[],
    documents: (doc.documents || []) as unknown as Document[],
    legalMilestones: restoredLegalMilestones as unknown as LegalMilestone[],
    honeymoonPlans: (doc.honeymoonPlans || []) as unknown as HoneymoonPlan[],
  };
}

/**
 * Validate and coerce raw unknown input to BackupData.
 * Throws "invalid_backup" string if the shape is unrecognisable.
 */
export function migrateBackup(raw: unknown): BackupData {
  if (
    typeof raw !== "object" ||
    raw === null ||
    typeof (raw as Record<string, unknown>).version !== "number"
  ) {
    throw new Error("invalid_backup");
  }
  return raw as BackupData;
}
