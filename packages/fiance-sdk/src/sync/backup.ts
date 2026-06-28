/**
 * Backup serialisation / deserialisation — pure, no store references.
 * The app-side lib/sync.ts wraps these with store reads/writes.
 */

// NodeNext .js extension required
import { DEFAULT_INVITATION_TYPES } from '../domain/types.js';
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
} from '../domain/schema.js';

// v6 → v7: added communications collection
export const BACKUP_VERSION = 7;

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

  const now = new Date().toISOString();
  const rawInvTypes = ((doc.invitationTypes || []) as unknown[]) as Record<string, unknown>[];
  const restoredInvitationTypes =
    rawInvTypes.length > 0
      ? rawInvTypes
      : DEFAULT_INVITATION_TYPES.map((t) => ({ ...t, createdAt: now, updatedAt: now }));

  return {
    wedding: (doc.wedding as Wedding | null) ?? null,
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
