// ─── Plain TypeScript entity types ─────────────────────────────────────────
// These replaced Drizzle table definitions when migrating to expo-sqlite/kv-store.
// All types match the shapes previously inferred via Drizzle's $inferSelect.

export interface Wedding {
  id: number;
  partner1Name: string | null;
  partner2Name: string | null;
  weddingDate: string | null;
  venueName: string | null;
  description: string | null;
  faq: string | null; // JSON string of FaqItem[]
  eventPhotos: string | null; // JSON string of EventPhoto[]
  budgetTarget: number | null;
  categoryBudgets: string | null; // JSON: Record<categoryKey, number>
  currency: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface GuestGroup {
  id: string;
  name: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  side: string | null;
  invitationType: string;
  rsvpStatus: string | null;
  rsvpDate: string | null;
  isSleeping: boolean | null;
  childrenCount: number | null;
  diet: string | null;
  dietNotes: string | null;
  groupId: string | null;
  tableId: string | null;
  companionId: string | null;
  noTableNeeded: boolean | null;
  giftDescription: string | null;
  thankYouSent: boolean | null;
  thankYouSentDate: string | null;
  accommodationId: string | null;
  roomNumber: string | null;
  rsvpToken: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface Table {
  id: string;
  name: string;
  capacity: number | null;
  notes: string | null;
  positionX: number | null;
  positionY: number | null;
  shape: string | null;
}

export interface Vendor {
  id: string;
  type: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  status: string | null;
  quoteDate: string | null;
  eventDate: string | null;
  basePrice: number | null;
  pricePerPerson: number | null;
  pppSource: string | null;
  depositAmount: number | null;
  depositPaid: boolean | null;
  depositDueDate: string | null;
  balanceDueDate: string | null;
  validityDate: string | null;
  customFields: string | null;
  notes: string | null;
  rating: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface QuotePricing {
  id: string;
  vendorId: string;
  pricingKey: string;
  pricePerPerson: number | null;
  guestCountOverride: number | null;
  staffFee: number | null;
  travelFee: number | null;
}

export interface VendorPayment {
  id: string;
  vendorId: string;
  amount: number;
  paidDate: string;
  dueDate: string | null;
  method: string | null;
  label: string | null;
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface Accommodation {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  checkInDate: string | null;
  checkOutDate: string | null;
  roomCount: number | null;
  pricePerNight: number | null;
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface Gift {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  url: string | null;
  imageUrl: string | null;
  category: string | null;
  claimed: boolean | null;
  claimedByName: string | null;
  claimedAt: string | null;
  sortOrder: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface TaskCategory {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  sortOrder: number | null;
}

export interface Task {
  id: string;
  categoryId: string | null;
  title: string;
  description: string | null;
  status: string | null;
  priority: string | null;
  dueDate: string | null;
  monthsBefore: number | null;
  isSystem: boolean | null;
  vendorId: string | null;
  assignee: string | null;
  reminderDaysBefore: number | null;
  completedAt: string | null;
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AgendaEvent {
  id: string;
  title: string;
  date: string;
  time: string | null;
  endTime: string | null;
  location: string | null;
  vendorId: string | null;
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface DayOfItem {
  id: string;
  title: string;
  date: string | null;
  time: string;
  endTime: string | null;
  location: string | null;
  responsible: string | null;
  notes: string | null;
  isPublic: boolean | null;
  sortOrder: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface IdeaCollection {
  id: string;
  name: string;
  description: string | null;
  coverIdeaId: string | null;
  sortOrder: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface Idea {
  id: string;
  collectionId: string | null;
  title: string | null;
  notes: string | null;
  imageUri: string | null;
  imageThumbnailUri: string | null;
  sourceUrl: string | null;
  tags: string | null; // JSON array string
  category: string | null;
  vendorId: string | null;
  isFavorite: boolean | null;
  colorPalette: string | null; // JSON array of hex strings
  createdAt: string | null;
  updatedAt: string | null;
}

// ─── Insert type aliases ─────────────────────────────────────────────────────
// With KV storage, there's no schema enforcement — Insert types equal Select types.

export type WeddingInsert = Wedding;
export type GuestInsert = Guest;
export type GuestGroupInsert = GuestGroup;
export type TableInsert = Table;
export type VendorInsert = Vendor;
export type QuotePricingInsert = QuotePricing;
export type VendorPaymentInsert = VendorPayment;
export type AccommodationInsert = Accommodation;
export type GiftInsert = Gift;
export type TaskCategoryInsert = TaskCategory;
export type TaskInsert = Task;
export type AgendaEventInsert = AgendaEvent;
export type DayOfItemInsert = DayOfItem;
export type IdeaCollectionInsert = IdeaCollection;
export type IdeaInsert = Idea;
