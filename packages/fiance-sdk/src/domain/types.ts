// ─── Enums ──────────────────────────────────────────────────────────────────

export type InvitationType =
  | "CEREMONY"
  | "COCKTAIL"
  | "FULL"
  | "BOTH_DAYS";

export type RsvpStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "MAYBE";

export type Diet =
  | "STANDARD"
  | "VEGETARIAN"
  | "VEGAN"
  | "HALAL"
  | "KOSHER"
  | "ALLERGY";

export type VendorType =
  | "CATERER"
  | "VENUE"
  | "PHOTOGRAPHER"
  | "VIDEOGRAPHER"
  | "DJ"
  | "BAND"
  | "FLORIST"
  | "WEDDING_PLANNER"
  | "OFFICIANT"
  | "HAIR_MAKEUP"
  | "TRANSPORT"
  | "SHUTTLE"
  | "CAKE"
  | "PHOTO_BOOTH"
  | "KIDS_ENTERTAINER"
  | "STATIONERY"
  | "FURNITURE_RENTAL"
  | "HOTEL"
  | "CLOTHING"
  | "SECURITY"
  | "OTHER";

export type VendorStatus =
  | "PROSPECT"
  | "QUOTE_RECEIVED"
  | "NEGOTIATING"
  | "BOOKED"
  | "CANCELLED";

export type PlanningAspect = "preparation" | "agenda" | "day-of";

export const PLANNING_ASPECT_LABELS: Record<PlanningAspect, string> = {
  preparation: "planning:aspects.preparation",
  agenda: "planning:aspects.agenda",
  "day-of": "planning:aspects.day-of",
};

export type TaskStatus = "TODO" | "DONE";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type PricingKey =
  | "cocktail"
  | "dinner"
  | "drinks"
  | "next-day"
  | "tableware"
  | "linen"
  | "vegetarian"
  | "child"
  | "service";

export type PppSource =
  | "COCKTAIL"
  | "DINNER"
  | "FULL"
  | "BOTH_DAYS"
  | "CHILD"
  | "VEGETARIAN"
  | "TOTAL"
  | "SLEEPING"
  | null;

export type IdeaCategory =
  | "TABLE_DECOR"
  | "VENUE_DECOR"
  | "CEREMONY_DECOR"
  | "BOUQUET"
  | "ATTIRE"
  | "CAKE"
  | "PHOTO_STYLE"
  | "VENUE"
  | "OTHER";

export type SeatingConstraintType = "MUST_SIT_TOGETHER" | "MUST_NOT_SIT_TOGETHER";

export type WeddingEventType =
  | "CIVIL"
  | "RELIGIOUS"
  | "LAIC"
  | "COCKTAIL"
  | "DINNER"
  | "BRUNCH"
  | "OTHER";

export type CeremonyItemKind =
  | "ENTRANCE"
  | "READING"
  | "SONG"
  | "PRAYER"
  | "VOWS"
  | "RINGS"
  | "BLESSING"
  | "HOMILY"
  | "PROCESSION"
  | "OTHER";

export type PlaylistMoment =
  | "ARRIVAL"
  | "CEREMONY"
  | "COCKTAIL"
  | "ENTRANCE"
  | "FIRST_DANCE"
  | "DINNER"
  | "PARTY"
  | "CAKE"
  | "EXIT"
  | "OTHER";

export type MealChoice = "STANDARD" | "VEGETARIAN" | "VEGAN" | "CHILD" | "CUSTOM";

export type CommunicationChannel = "EMAIL" | "POSTAL" | "SMS" | "WHATSAPP" | "OTHER";

export type DocumentOwnerType = "WEDDING" | "VENDOR" | "GUEST" | "LEGAL" | "HONEYMOON";

export type LegalMilestoneType =
  | "PUBLICATION_BANS"
  | "CIVIL_APPOINTMENT"
  | "CONTRACT_SIGNING"
  | "DOCUMENTS_DEADLINE"
  | "CUSTOM";

export type LegalMilestoneStatus = "TODO" | "DONE" | "NA";

export type TransportMode = "car" | "train" | "shuttle" | "taxi";

// ─── Labels ─────────────────────────────────────────────────────────────────

export const VENDOR_TYPE_LABELS: Record<VendorType, string> = {
  CATERER: "vendors:types.CATERER",
  VENUE: "vendors:types.VENUE",
  PHOTOGRAPHER: "vendors:types.PHOTOGRAPHER",
  VIDEOGRAPHER: "vendors:types.VIDEOGRAPHER",
  DJ: "vendors:types.DJ",
  BAND: "vendors:types.BAND",
  FLORIST: "vendors:types.FLORIST",
  WEDDING_PLANNER: "vendors:types.WEDDING_PLANNER",
  OFFICIANT: "vendors:types.OFFICIANT",
  HAIR_MAKEUP: "vendors:types.HAIR_MAKEUP",
  TRANSPORT: "vendors:types.TRANSPORT",
  SHUTTLE: "vendors:types.SHUTTLE",
  CAKE: "vendors:types.CAKE",
  PHOTO_BOOTH: "vendors:types.PHOTO_BOOTH",
  KIDS_ENTERTAINER: "vendors:types.KIDS_ENTERTAINER",
  STATIONERY: "vendors:types.STATIONERY",
  FURNITURE_RENTAL: "vendors:types.FURNITURE_RENTAL",
  HOTEL: "vendors:types.HOTEL",
  CLOTHING: "vendors:types.CLOTHING",
  SECURITY: "vendors:types.SECURITY",
  OTHER: "vendors:types.OTHER",
};

export const INVITATION_TYPE_LABELS: Record<InvitationType, string> = {
  CEREMONY: "guests:invitationTypes.CEREMONY",
  COCKTAIL: "guests:invitationTypes.COCKTAIL",
  FULL: "guests:invitationTypes.FULL",
  BOTH_DAYS: "guests:invitationTypes.BOTH_DAYS",
};

/** Seed data for the built-in invitation types (French labels = app primary language) */
export const DEFAULT_INVITATION_TYPES = [
  { id: "CEREMONY", label: "Cérémonie uniquement", isDefault: true, needsSleeping: false },
  { id: "COCKTAIL", label: "Cocktail uniquement", isDefault: true, needsSleeping: false },
  { id: "FULL", label: "Journée complète", isDefault: true, needsSleeping: false },
] as const;

export const RSVP_STATUS_LABELS: Record<RsvpStatus, string> = {
  PENDING: "guests:rsvp.PENDING",
  ACCEPTED: "guests:rsvp.ACCEPTED",
  DECLINED: "guests:rsvp.DECLINED",
  MAYBE: "guests:rsvp.MAYBE",
};

export const RSVP_STATUS_COLORS: Record<RsvpStatus, string> = {
  PENDING:  "#c9922f", // mustard
  ACCEPTED: "#6e7a4a", // olive
  DECLINED: "#EF4444",
  MAYBE:    "#6b8aa3", // GP blue
};

export const VENDOR_STATUS_LABELS: Record<VendorStatus, string> = {
  PROSPECT: "vendors:status.PROSPECT",
  QUOTE_RECEIVED: "vendors:status.QUOTE_RECEIVED",
  NEGOTIATING: "vendors:status.NEGOTIATING",
  BOOKED: "vendors:status.BOOKED",
  CANCELLED: "vendors:status.CANCELLED",
};

export const VENDOR_STATUS_COLORS: Record<VendorStatus, string> = {
  PROSPECT:       "#8a8373", // mute
  QUOTE_RECEIVED: "#6b8aa3", // GP blue
  NEGOTIATING:    "#c9922f", // mustard
  BOOKED:         "#6e7a4a", // olive
  CANCELLED:      "#EF4444",
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "planning:status.TODO",
  DONE: "planning:status.DONE",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "planning:priority.LOW",
  MEDIUM: "planning:priority.MEDIUM",
  HIGH: "planning:priority.HIGH",
  CRITICAL: "planning:priority.CRITICAL",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  LOW:      "#8a8373", // mute
  MEDIUM:   "#6b8aa3", // GP blue
  HIGH:     "#c9922f", // mustard
  CRITICAL: "#EF4444",
};

export const DIET_LABELS: Record<Diet, string> = {
  STANDARD: "guests:diet.STANDARD",
  VEGETARIAN: "guests:diet.VEGETARIAN",
  VEGAN: "guests:diet.VEGAN",
  HALAL: "guests:diet.HALAL",
  KOSHER: "guests:diet.KOSHER",
  ALLERGY: "guests:diet.ALLERGY",
};

export const IDEA_CATEGORY_LABELS: Record<IdeaCategory, string> = {
  TABLE_DECOR: "ideas:categories.TABLE_DECOR",
  VENUE_DECOR: "ideas:categories.VENUE_DECOR",
  CEREMONY_DECOR: "ideas:categories.CEREMONY_DECOR",
  BOUQUET: "ideas:categories.BOUQUET",
  ATTIRE: "ideas:categories.ATTIRE",
  CAKE: "ideas:categories.CAKE",
  PHOTO_STYLE: "ideas:categories.PHOTO_STYLE",
  VENUE: "ideas:categories.VENUE",
  OTHER: "ideas:categories.OTHER",
};

/** Seed data for the "create default roles" button (French labels = app primary language). No roles ship pre-built. */
export const DEFAULT_WEDDING_ROLES = [
  "Officiant·e",
  "Témoin",
  "Demoiselle d'honneur",
  "Garçon d'honneur",
  "Porteur d'alliances",
  "Demoiselle de fleurs",
  "Placeur",
] as const;

/** Legacy GuestRole enum value → French name, for migrating pre-existing role assignments. */
export const LEGACY_GUEST_ROLE_NAMES: Record<string, string> = {
  OFFICIANT: "Officiant·e",
  WITNESS: "Témoin",
  BRIDESMAID: "Demoiselle d'honneur",
  GROOMSMAN: "Garçon d'honneur",
  RING_BEARER: "Porteur d'alliances",
  FLOWER_GIRL: "Demoiselle de fleurs",
  USHER: "Placeur",
  OTHER: "Autre rôle",
};

export const SEATING_CONSTRAINT_TYPE_LABELS: Record<SeatingConstraintType, string> = {
  MUST_SIT_TOGETHER: "guests:seatingConstraints.type.MUST_SIT_TOGETHER",
  MUST_NOT_SIT_TOGETHER: "guests:seatingConstraints.type.MUST_NOT_SIT_TOGETHER",
};

export const WEDDING_EVENT_TYPE_LABELS: Record<WeddingEventType, string> = {
  CIVIL: "planning:events.type.CIVIL",
  RELIGIOUS: "planning:events.type.RELIGIOUS",
  LAIC: "planning:events.type.LAIC",
  COCKTAIL: "planning:events.type.COCKTAIL",
  DINNER: "planning:events.type.DINNER",
  BRUNCH: "planning:events.type.BRUNCH",
  OTHER: "planning:events.type.OTHER",
};

export const CEREMONY_ITEM_KIND_LABELS: Record<CeremonyItemKind, string> = {
  ENTRANCE: "planning:ceremony.kinds.ENTRANCE",
  READING: "planning:ceremony.kinds.READING",
  SONG: "planning:ceremony.kinds.SONG",
  PRAYER: "planning:ceremony.kinds.PRAYER",
  VOWS: "planning:ceremony.kinds.VOWS",
  RINGS: "planning:ceremony.kinds.RINGS",
  BLESSING: "planning:ceremony.kinds.BLESSING",
  HOMILY: "planning:ceremony.kinds.HOMILY",
  PROCESSION: "planning:ceremony.kinds.PROCESSION",
  OTHER: "planning:ceremony.kinds.OTHER",
};

export const PLAYLIST_MOMENT_LABELS: Record<PlaylistMoment, string> = {
  ARRIVAL: "planning:music.moments.ARRIVAL",
  CEREMONY: "planning:music.moments.CEREMONY",
  COCKTAIL: "planning:music.moments.COCKTAIL",
  ENTRANCE: "planning:music.moments.ENTRANCE",
  FIRST_DANCE: "planning:music.moments.FIRST_DANCE",
  DINNER: "planning:music.moments.DINNER",
  PARTY: "planning:music.moments.PARTY",
  CAKE: "planning:music.moments.CAKE",
  EXIT: "planning:music.moments.EXIT",
  OTHER: "planning:music.moments.OTHER",
};

export const MEAL_CHOICE_LABELS: Record<MealChoice, string> = {
  STANDARD: "guests:mealChoice.STANDARD",
  VEGETARIAN: "guests:mealChoice.VEGETARIAN",
  VEGAN: "guests:mealChoice.VEGAN",
  CHILD: "guests:mealChoice.CHILD",
  CUSTOM: "guests:mealChoice.CUSTOM",
};

export const COMMUNICATION_CHANNEL_LABELS: Record<CommunicationChannel, string> = {
  EMAIL: "guests:communications.channel.EMAIL",
  POSTAL: "guests:communications.channel.POSTAL",
  SMS: "guests:communications.channel.SMS",
  WHATSAPP: "guests:communications.channel.WHATSAPP",
  OTHER: "guests:communications.channel.OTHER",
};

export const DOCUMENT_OWNER_TYPE_LABELS: Record<DocumentOwnerType, string> = {
  WEDDING: "vendors:documents.ownerType.WEDDING",
  VENDOR: "vendors:documents.ownerType.VENDOR",
  GUEST: "vendors:documents.ownerType.GUEST",
  LEGAL: "vendors:documents.ownerType.LEGAL",
  HONEYMOON: "vendors:documents.ownerType.HONEYMOON",
};

export const LEGAL_MILESTONE_TYPE_LABELS: Record<LegalMilestoneType, string> = {
  PUBLICATION_BANS: "planning:legal.type.PUBLICATION_BANS",
  CIVIL_APPOINTMENT: "planning:legal.type.CIVIL_APPOINTMENT",
  CONTRACT_SIGNING: "planning:legal.type.CONTRACT_SIGNING",
  DOCUMENTS_DEADLINE: "planning:legal.type.DOCUMENTS_DEADLINE",
  CUSTOM: "planning:legal.type.CUSTOM",
};

export const LEGAL_MILESTONE_STATUS_LABELS: Record<LegalMilestoneStatus, string> = {
  TODO: "planning:legal.status.TODO",
  DONE: "planning:legal.status.DONE",
  NA: "planning:legal.status.NA",
};

export const TRANSPORT_MODE_LABELS: Record<TransportMode, string> = {
  car: "guests:logistics.transportMode.car",
  train: "guests:logistics.transportMode.train",
  shuttle: "guests:logistics.transportMode.shuttle",
  taxi: "guests:logistics.transportMode.taxi",
};

/** FR seed data for system communication templates, mirrors DEFAULT_INVITATION_TYPES seeding pattern */
export const DEFAULT_COMMUNICATION_TEMPLATES = [
  {
    name: "Save-the-date",
    channel: "EMAIL" as const,
    subject: "Réservez la date !",
    body: "Bonjour {{guest.firstName}},\n\n{{wedding.partner1Name}} & {{wedding.partner2Name}} se marient le {{wedding.weddingDate}} et seraient ravis de vous compter parmi les invités. Réservez la date, les détails suivront !",
  },
  {
    name: "Faire-part officiel",
    channel: "POSTAL" as const,
    subject: "Faire-part de mariage",
    body: "Bonjour {{guest.firstName}},\n\n{{wedding.partner1Name}} & {{wedding.partner2Name}} ont le plaisir de vous inviter à leur mariage le {{wedding.weddingDate}} à {{wedding.venueName}}.",
  },
  {
    name: "Relance RSVP",
    channel: "EMAIL" as const,
    subject: "N'oubliez pas de répondre !",
    body: "Bonjour {{guest.firstName}},\n\nNous n'avons pas encore reçu votre réponse pour le mariage du {{wedding.weddingDate}}. Merci de nous faire savoir si vous serez des nôtres !",
  },
] as const;

/** FR seed data for legal milestones, mirrors DEFAULT_INVITATION_TYPES seeding pattern */
export const DEFAULT_LEGAL_MILESTONES = [
  { type: "PUBLICATION_BANS" as const, title: "Publication des bans" },
  { type: "CIVIL_APPOINTMENT" as const, title: "RDV à la mairie" },
  { type: "DOCUMENTS_DEADLINE" as const, title: "Dossier de mariage complet" },
  { type: "CONTRACT_SIGNING" as const, title: "Signature des contrats prestataires" },
] as const;


// ─── Budget categories ──────────────────────────────────────────────────────

export const BUDGET_CATEGORIES: Record<string, VendorType[]> = {
  venue: ["VENUE", "FURNITURE_RENTAL", "SECURITY"],
  catering: ["CATERER"],
  photo_video: ["PHOTOGRAPHER", "VIDEOGRAPHER", "PHOTO_BOOTH"],
  music_entertainment: ["DJ", "BAND", "KIDS_ENTERTAINER"],
  flowers_decor: ["FLORIST"],
  beauty: ["HAIR_MAKEUP", "CLOTHING"],
  transport: ["TRANSPORT", "SHUTTLE"],
  accommodation: ["HOTEL"],
  stationery: ["STATIONERY"],
  coordination: ["WEDDING_PLANNER", "OFFICIANT"],
  cake: ["CAKE"],
  other: ["OTHER"],
};

export const BUDGET_CATEGORY_LABELS: Record<string, string> = {
  venue: "budget:categories.venue",
  catering: "budget:categories.catering",
  photo_video: "budget:categories.photo_video",
  music_entertainment: "budget:categories.music_entertainment",
  flowers_decor: "budget:categories.flowers_decor",
  beauty: "budget:categories.beauty",
  transport: "budget:categories.transport",
  accommodation: "budget:categories.accommodation",
  stationery: "budget:categories.stationery",
  coordination: "budget:categories.coordination",
  cake: "budget:categories.cake",
  other: "budget:categories.other",
};

// ─── Budget allocation templates ────────────────────────────────────────────

export interface BudgetTemplate {
  /** Suggested total budget in euros */
  budget: number;
  /** Allocation ratios per category (must sum to 1.0) */
  ratios: Record<string, number>;
}

export const BUDGET_ALLOCATION_TEMPLATES: Record<string, BudgetTemplate> = {
  intimate: {
    budget: 10_000,
    ratios: {
      venue: 0.20, catering: 0.40, photo_video: 0.12, music_entertainment: 0.04,
      flowers_decor: 0.05, beauty: 0.04, transport: 0.02, accommodation: 0.02,
      stationery: 0.02, coordination: 0.03, cake: 0.02, other: 0.04,
    },
  },
  classic: {
    budget: 20_000,
    ratios: {
      venue: 0.20, catering: 0.37, photo_video: 0.10, music_entertainment: 0.06,
      flowers_decor: 0.07, beauty: 0.04, transport: 0.03, accommodation: 0.02,
      stationery: 0.02, coordination: 0.04, cake: 0.02, other: 0.03,
    },
  },
  luxe: {
    budget: 45_000,
    ratios: {
      venue: 0.20, catering: 0.32, photo_video: 0.10, music_entertainment: 0.08,
      flowers_decor: 0.10, beauty: 0.04, transport: 0.03, accommodation: 0.03,
      stationery: 0.02, coordination: 0.04, cake: 0.02, other: 0.02,
    },
  },
};

export const BUDGET_TEMPLATE_LABELS: Record<string, string> = {
  intimate: "budget:templates.intimate",
  classic: "budget:templates.classic",
  luxe: "budget:templates.luxe",
};

// ─── Pricing key to guest counter mapping ───────────────────────────────────

export const PRICING_KEY_GUEST_SOURCE: Record<PricingKey, string> = {
  cocktail: "cocktail_count",
  dinner: "dinner_count",
  drinks: "dinner_count",
  "next-day": "both_days_count",
  tableware: "dinner_count",
  linen: "dinner_count",
  vegetarian: "vegetarian_count",
  child: "children_count",
  service: "manual",
};

/**
 * Maps a guest invitation type to the GuestCounts field used for per-guest dynamic pricing.
 * Exact per-type counts (a guest of type X is billed the price of type X), NOT cumulative —
 * so each pricing line reflects only its own invitation type's headcount.
 */
export const INVITATION_TYPE_GUEST_SOURCE: Record<InvitationType, string> = {
  CEREMONY:  "inv_ceremony_count",
  COCKTAIL:  "inv_cocktail_count",
  FULL:      "inv_full_count",
  BOTH_DAYS: "inv_both_days_count",
};

export const PRICING_KEY_LABELS: Record<PricingKey, string> = {
  cocktail: "vendors:pricingKeys.cocktail",
  dinner: "vendors:pricingKeys.dinner",
  drinks: "vendors:pricingKeys.drinks",
  "next-day": "vendors:pricingKeys.next-day",
  tableware: "vendors:pricingKeys.tableware",
  linen: "vendors:pricingKeys.linen",
  vegetarian: "vendors:pricingKeys.vegetarian",
  child: "vendors:pricingKeys.child",
  service: "vendors:pricingKeys.service",
};

// ─── Caterer services ───────────────────────────────────────────────────────

export const CATERER_SERVICES = [
  "vendors:catererServices.0",
  "vendors:catererServices.1",
  "vendors:catererServices.2",
  "vendors:catererServices.3",
  "vendors:catererServices.4",
  "vendors:catererServices.5",
  "vendors:catererServices.6",
  "vendors:catererServices.7",
  "vendors:catererServices.8",
  "vendors:catererServices.9",
  "vendors:catererServices.10",
  "vendors:catererServices.11",
  "vendors:catererServices.12",
] as const;

// icons stay in apps/mobile/lib/vendor-icons.ts
// VENDOR_TYPE_ICONS (lucide-react-native) is intentionally omitted from the SDK.
