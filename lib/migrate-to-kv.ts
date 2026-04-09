/**
 * One-time migration from legacy storage to expo-sqlite/kv-store.
 * - Native: reads old Drizzle SQLite tables and writes them to KV.
 * - Web: reads old localStorage blob and writes it to KV.
 *
 * Safe to call on every boot — skips immediately if already migrated.
 */

import { Platform } from "react-native";
import { openDatabaseSync } from "expo-sqlite";
import { SQLiteStorage } from "expo-sqlite/kv-store";
import { readCollection, writeCollection } from "./kv-storage";

const MIGRATION_FLAG = "__migrated_to_kv";

// ─── Boolean conversion ──────────────────────────────────────────────────────
// SQLite stores booleans as 0/1 integers; KV stores camelCase JS objects.

function toBool(v: unknown): boolean | null {
  if (v === null || v === undefined) return null;
  return v !== 0 && v !== false;
}

// ─── Snake → camelCase mappers per table ────────────────────────────────────

function mapWedding(row: any) {
  return {
    id: row.id,
    partner1Name: row.partner1_name ?? null,
    partner2Name: row.partner2_name ?? null,
    weddingDate: row.wedding_date ?? null,
    venueName: row.venue_name ?? null,
    description: row.description ?? null,
    faq: row.faq ?? null,
    eventPhotos: row.event_photos ?? null,
    budgetTarget: row.budget_target ?? null,
    categoryBudgets: row.category_budgets ?? null,
    currency: row.currency ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

function mapGuestGroup(row: any) {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

function mapGuest(row: any) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    side: row.side ?? null,
    invitationType: row.invitation_type,
    rsvpStatus: row.rsvp_status ?? null,
    rsvpDate: row.rsvp_date ?? null,
    isSleeping: toBool(row.is_sleeping),
    childrenCount: row.children_count ?? null,
    diet: row.diet ?? null,
    dietNotes: row.diet_notes ?? null,
    groupId: row.group_id ?? null,
    tableId: row.table_id ?? null,
    companionId: row.companion_id ?? null,
    noTableNeeded: toBool(row.no_table_needed),
    giftDescription: row.gift_description ?? null,
    thankYouSent: toBool(row.thank_you_sent),
    thankYouSentDate: row.thank_you_sent_date ?? null,
    accommodationId: row.accommodation_id ?? null,
    roomNumber: row.room_number ?? null,
    rsvpToken: row.rsvp_token ?? null,
    email: row.email ?? null,
    phone: row.phone ?? null,
    address: row.address ?? null,
    notes: row.notes ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

function mapTable(row: any) {
  return {
    id: row.id,
    name: row.name,
    capacity: row.capacity ?? null,
    notes: row.notes ?? null,
    positionX: row.position_x ?? null,
    positionY: row.position_y ?? null,
    shape: row.shape ?? null,
  };
}

function mapVendor(row: any) {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    contactName: row.contact_name ?? null,
    phone: row.phone ?? null,
    email: row.email ?? null,
    website: row.website ?? null,
    status: row.status ?? null,
    quoteDate: row.quote_date ?? null,
    eventDate: row.event_date ?? null,
    basePrice: row.base_price ?? null,
    pricePerPerson: row.price_per_person ?? null,
    pppSource: row.ppp_source ?? null,
    depositAmount: row.deposit_amount ?? null,
    depositPaid: toBool(row.deposit_paid),
    depositDueDate: row.deposit_due_date ?? null,
    balanceDueDate: row.balance_due_date ?? null,
    validityDate: row.validity_date ?? null,
    customFields: row.custom_fields ?? null,
    notes: row.notes ?? null,
    rating: row.rating ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

function mapQuotePricing(row: any) {
  return {
    id: row.id,
    vendorId: row.vendor_id,
    pricingKey: row.pricing_key,
    pricePerPerson: row.price_per_person ?? null,
    guestCountOverride: row.guest_count_override ?? null,
    staffFee: row.staff_fee ?? null,
    travelFee: row.travel_fee ?? null,
  };
}

function mapVendorPayment(row: any) {
  return {
    id: row.id,
    vendorId: row.vendor_id,
    amount: row.amount,
    paidDate: row.paid_date,
    dueDate: row.due_date ?? null,
    method: row.method ?? null,
    label: row.label ?? null,
    notes: row.notes ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

function mapAccommodation(row: any) {
  return {
    id: row.id,
    name: row.name,
    address: row.address ?? null,
    phone: row.phone ?? null,
    website: row.website ?? null,
    checkInDate: row.check_in_date ?? null,
    checkOutDate: row.check_out_date ?? null,
    roomCount: row.room_count ?? null,
    pricePerNight: row.price_per_night ?? null,
    notes: row.notes ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

function mapGift(row: any) {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? null,
    price: row.price ?? null,
    url: row.url ?? null,
    imageUrl: row.image_url ?? null,
    category: row.category ?? null,
    claimed: toBool(row.claimed),
    claimedByName: row.claimed_by_name ?? null,
    claimedAt: row.claimed_at ?? null,
    sortOrder: row.sort_order ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

function mapTaskCategory(row: any) {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon ?? null,
    color: row.color ?? null,
    sortOrder: row.sort_order ?? null,
  };
}

function mapTask(row: any) {
  return {
    id: row.id,
    categoryId: row.category_id ?? null,
    title: row.title,
    description: row.description ?? null,
    status: row.status ?? null,
    priority: row.priority ?? null,
    dueDate: row.due_date ?? null,
    monthsBefore: row.months_before ?? null,
    isSystem: toBool(row.is_system),
    vendorId: row.vendor_id ?? null,
    assignee: row.assignee ?? null,
    reminderDaysBefore: row.reminder_days_before ?? null,
    completedAt: row.completed_at ?? null,
    notes: row.notes ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

function mapAgendaEvent(row: any) {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    time: row.time ?? null,
    endTime: row.end_time ?? null,
    location: row.location ?? null,
    vendorId: row.vendor_id ?? null,
    notes: row.notes ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

function mapDayOfItem(row: any) {
  return {
    id: row.id,
    title: row.title,
    date: row.date ?? null,
    time: row.time,
    endTime: row.end_time ?? null,
    location: row.location ?? null,
    responsible: row.responsible ?? null,
    notes: row.notes ?? null,
    isPublic: toBool(row.is_public),
    sortOrder: row.sort_order ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

function mapIdeaCollection(row: any) {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? null,
    coverIdeaId: row.cover_idea_id ?? null,
    sortOrder: row.sort_order ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

function mapIdea(row: any) {
  return {
    id: row.id,
    collectionId: row.collection_id ?? null,
    title: row.title ?? null,
    notes: row.notes ?? null,
    imageUri: row.image_uri ?? null,
    imageThumbnailUri: row.image_thumbnail_uri ?? null,
    sourceUrl: row.source_url ?? null,
    tags: row.tags ?? null,
    category: row.category ?? null,
    vendorId: row.vendor_id ?? null,
    isFavorite: toBool(row.is_favorite),
    colorPalette: row.color_palette ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

// ─── Table existence check ───────────────────────────────────────────────────

function tableExists(db: ReturnType<typeof openDatabaseSync>, name: string): boolean {
  return (
    (db.getFirstSync<{ count: number }>(
      `SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='${name}'`
    )?.count ?? 0) > 0
  );
}

function readTable<T>(
  db: ReturnType<typeof openDatabaseSync>,
  tableName: string,
  mapper: (row: any) => T
): T[] {
  if (!tableExists(db, tableName)) return [];
  try {
    return (db.getAllSync(`SELECT * FROM ${tableName}`) as any[]).map(mapper);
  } catch {
    return [];
  }
}

// ─── Native migration: SQLite → KV ──────────────────────────────────────────

function migrateFromSQLite(kv: SQLiteStorage, dbFileName: string): boolean {
  try {
    const db = openDatabaseSync(dbFileName);
    if (!tableExists(db, "wedding")) {
      db.closeSync();
      return false;
    }

    const weddingRows = readTable(db, "wedding", mapWedding);
    if (weddingRows.length > 0) kv.setItemSync("wedding", JSON.stringify(weddingRows[0]));

    kv.setItemSync("guestGroups", JSON.stringify(readTable(db, "guest_groups", mapGuestGroup)));
    kv.setItemSync("guests", JSON.stringify(readTable(db, "guests", mapGuest)));
    kv.setItemSync("tables", JSON.stringify(readTable(db, "tables", mapTable)));
    kv.setItemSync("vendors", JSON.stringify(readTable(db, "vendors", mapVendor)));
    kv.setItemSync("quotePricings", JSON.stringify(readTable(db, "quote_pricing", mapQuotePricing)));
    kv.setItemSync("vendorPayments", JSON.stringify(readTable(db, "vendor_payments", mapVendorPayment)));
    kv.setItemSync("accommodations", JSON.stringify(readTable(db, "accommodations", mapAccommodation)));
    kv.setItemSync("gifts", JSON.stringify(readTable(db, "gifts", mapGift)));
    kv.setItemSync("taskCategories", JSON.stringify(readTable(db, "task_categories", mapTaskCategory)));
    kv.setItemSync("tasks", JSON.stringify(readTable(db, "tasks", mapTask)));
    kv.setItemSync("agendaEvents", JSON.stringify(readTable(db, "agenda_events", mapAgendaEvent)));
    kv.setItemSync("dayOfItems", JSON.stringify(readTable(db, "day_of_items", mapDayOfItem)));
    kv.setItemSync("ideaCollections", JSON.stringify(readTable(db, "idea_collections", mapIdeaCollection)));
    kv.setItemSync("ideas", JSON.stringify(readTable(db, "ideas", mapIdea)));

    db.closeSync();
    return true;
  } catch (err) {
    console.warn("[migrate-to-kv] SQLite migration failed:", err);
    return false;
  }
}

// ─── Web migration: localStorage blob → AsyncStorage keys ───────────────────

function migrateFromLocalStorage(): boolean {
  try {
    const raw = localStorage.getItem("wedding_data");
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data?.version) return false;

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
    return true;
  } catch (err) {
    console.warn("[migrate-to-kv] localStorage migration failed:", err);
    return false;
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Runs a one-time migration from legacy storage into the given KV store.
 * Safe to call on every boot — no-ops if migration was already done.
 */
export function migrateToKvIfNeeded(kv: SQLiteStorage | null, dbFileName: string): void {
  // readCollection handles both old raw "true" and new JSON-encoded values
  if (readCollection<any>(MIGRATION_FLAG)) return;

  if (Platform.OS === "web") {
    migrateFromLocalStorage();
  } else if (kv) {
    migrateFromSQLite(kv, dbFileName);
  }

  writeCollection(MIGRATION_FLAG, "true");
}
