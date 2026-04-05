import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// ─── Wedding (singleton) ────────────────────────────────────────────────────

export const wedding = sqliteTable("wedding", {
  id: integer("id").primaryKey(),
  partner1Name: text("partner1_name"),
  partner2Name: text("partner2_name"),
  weddingDate: text("wedding_date"),
  venueName: text("venue_name"),
  budgetTarget: real("budget_target"),
  currency: text("currency").default("EUR"),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

// ─── Guests ─────────────────────────────────────────────────────────────────

export const guests = sqliteTable("guests", {
  id: text("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  side: text("side"), // BRIDE | GROOM | BOTH
  invitationType: text("invitation_type").notNull(), // CEREMONY | COCKTAIL | DINNER | FULL | NEXT_DAY
  rsvpStatus: text("rsvp_status").default("PENDING"), // PENDING | ACCEPTED | DECLINED | MAYBE
  rsvpDate: text("rsvp_date"),
  isSleeping: integer("is_sleeping", { mode: "boolean" }).default(false),
  isChild: integer("is_child", { mode: "boolean" }).default(false),
  diet: text("diet").default("STANDARD"), // STANDARD | VEGETARIAN | VEGAN | HALAL | KOSHER | ALLERGY
  dietNotes: text("diet_notes"),
  tableId: text("table_id").references(() => tables.id),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  notes: text("notes"),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

// ─── Tables ─────────────────────────────────────────────────────────────────

export const tables = sqliteTable("tables", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  capacity: integer("capacity"),
  notes: text("notes"),
});

// ─── Vendors ────────────────────────────────────────────────────────────────

export const vendors = sqliteTable("vendors", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  contactName: text("contact_name"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  status: text("status").default("PROSPECT"), // PROSPECT | QUOTE_RECEIVED | NEGOTIATING | BOOKED | CANCELLED
  quoteDate: text("quote_date"),
  eventDate: text("event_date"),
  basePrice: real("base_price"),
  pricePerPerson: real("price_per_person"),
  pppSource: text("ppp_source"), // invitation_type key for dynamic calc
  depositAmount: real("deposit_amount"),
  depositPaid: integer("deposit_paid", { mode: "boolean" }).default(false),
  depositDueDate: text("deposit_due_date"),
  balanceDueDate: text("balance_due_date"),
  validityDate: text("validity_date"),
  customFields: text("custom_fields"), // JSON string
  notes: text("notes"),
  rating: integer("rating").default(0),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

// ─── Quote Pricing (caterers) ───────────────────────────────────────────────

export const quotePricing = sqliteTable("quote_pricing", {
  id: text("id").primaryKey(),
  vendorId: text("vendor_id")
    .notNull()
    .references(() => vendors.id, { onDelete: "cascade" }),
  pricingKey: text("pricing_key").notNull(), // cocktail | repas | boisson | lendemain | vaisselle | nappe | vegetarien | enfant | presta
  pricePerPerson: real("price_per_person"),
  guestCountOverride: integer("guest_count_override"),
  forfaitPersonnel: real("forfait_personnel"),
  forfaitDeplacement: real("forfait_deplacement"),
});

// ─── Task Categories ────────────────────────────────────────────────────────

export const taskCategories = sqliteTable("task_categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon"),
  color: text("color"),
  sortOrder: integer("sort_order"),
});

// ─── Tasks ──────────────────────────────────────────────────────────────────

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  categoryId: text("category_id").references(() => taskCategories.id),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("TODO"), // TODO | IN_PROGRESS | DONE | CANCELLED
  priority: text("priority").default("MEDIUM"), // LOW | MEDIUM | HIGH | CRITICAL
  dueDate: text("due_date"),
  monthsBefore: integer("months_before"),
  isSystem: integer("is_system", { mode: "boolean" }).default(false),
  vendorId: text("vendor_id").references(() => vendors.id),
  reminderDaysBefore: integer("reminder_days_before"),
  completedAt: text("completed_at"),
  notes: text("notes"),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

// ─── Idea Collections ───────────────────────────────────────────────────────

export const ideaCollections = sqliteTable("idea_collections", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  coverIdeaId: text("cover_idea_id"),
  sortOrder: integer("sort_order"),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

// ─── Ideas ──────────────────────────────────────────────────────────────────

export const ideas = sqliteTable("ideas", {
  id: text("id").primaryKey(),
  collectionId: text("collection_id").references(() => ideaCollections.id),
  title: text("title"),
  notes: text("notes"),
  imageUri: text("image_uri"),
  imageThumbnailUri: text("image_thumbnail_uri"),
  sourceUrl: text("source_url"),
  tags: text("tags"), // JSON array string
  category: text("category"), // DECO_TABLE | DECO_SALLE | DECO_CEREMONIE | BOUQUET | TENUE | GATEAU | PHOTO_STYLE | LIEU | OTHER
  vendorId: text("vendor_id").references(() => vendors.id),
  isFavorite: integer("is_favorite", { mode: "boolean" }).default(false),
  colorPalette: text("color_palette"), // JSON array of hex strings
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

// ─── Type exports ───────────────────────────────────────────────────────────

export type Wedding = typeof wedding.$inferSelect;
export type WeddingInsert = typeof wedding.$inferInsert;
export type Guest = typeof guests.$inferSelect;
export type GuestInsert = typeof guests.$inferInsert;
export type Table = typeof tables.$inferSelect;
export type TableInsert = typeof tables.$inferInsert;
export type Vendor = typeof vendors.$inferSelect;
export type VendorInsert = typeof vendors.$inferInsert;
export type QuotePricing = typeof quotePricing.$inferSelect;
export type QuotePricingInsert = typeof quotePricing.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type TaskInsert = typeof tasks.$inferInsert;
export type TaskCategory = typeof taskCategories.$inferSelect;
export type TaskCategoryInsert = typeof taskCategories.$inferInsert;
export type Idea = typeof ideas.$inferSelect;
export type IdeaInsert = typeof ideas.$inferInsert;
export type IdeaCollection = typeof ideaCollections.$inferSelect;
export type IdeaCollectionInsert = typeof ideaCollections.$inferInsert;
