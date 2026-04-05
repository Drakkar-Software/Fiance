// ─── Enums ──────────────────────────────────────────────────────────────────

export type Side = "BRIDE" | "GROOM" | "BOTH";

export type InvitationType =
  | "CEREMONY"
  | "COCKTAIL"
  | "DINNER"
  | "FULL"
  | "NEXT_DAY";

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
  | "SECURITY"
  | "OTHER";

export type VendorStatus =
  | "PROSPECT"
  | "QUOTE_RECEIVED"
  | "NEGOTIATING"
  | "BOOKED"
  | "CANCELLED";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type PricingKey =
  | "cocktail"
  | "repas"
  | "boisson"
  | "lendemain"
  | "vaisselle"
  | "nappe"
  | "vegetarien"
  | "enfant"
  | "presta";

export type PppSource =
  | "COCKTAIL"
  | "DINNER"
  | "FULL"
  | "NEXT_DAY"
  | "CHILD"
  | "VEGETARIAN"
  | "TOTAL"
  | "SLEEPING"
  | null;

export type IdeaCategory =
  | "DECO_TABLE"
  | "DECO_SALLE"
  | "DECO_CEREMONIE"
  | "BOUQUET"
  | "TENUE"
  | "GATEAU"
  | "PHOTO_STYLE"
  | "LIEU"
  | "OTHER";

// ─── Labels ─────────────────────────────────────────────────────────────────

export const VENDOR_TYPE_LABELS: Record<VendorType, string> = {
  CATERER: "Traiteur",
  VENUE: "Lieu de réception",
  PHOTOGRAPHER: "Photographe",
  VIDEOGRAPHER: "Vidéaste",
  DJ: "DJ / Sono",
  BAND: "Groupe / Orchestre",
  FLORIST: "Fleuriste",
  WEDDING_PLANNER: "Wedding planner",
  OFFICIANT: "Officiant de cérémonie",
  HAIR_MAKEUP: "Coiffeur / Maquilleur",
  TRANSPORT: "Location véhicule",
  SHUTTLE: "Navette invités",
  CAKE: "Pâtissier / Wedding cake",
  PHOTO_BOOTH: "Photo booth / Borne photo",
  KIDS_ENTERTAINER: "Animateur enfants",
  STATIONERY: "Faire-part / Graphiste",
  FURNITURE_RENTAL: "Location mobilier / Déco",
  HOTEL: "Hôtel / Hébergement",
  SECURITY: "Sécurité / Agent",
  OTHER: "Autre prestataire",
};

export const INVITATION_TYPE_LABELS: Record<InvitationType, string> = {
  CEREMONY: "Cérémonie uniquement",
  COCKTAIL: "Cocktail uniquement",
  DINNER: "Cocktail + Repas",
  FULL: "Journée complète",
  NEXT_DAY: "Lendemain uniquement",
};

export const RSVP_STATUS_LABELS: Record<RsvpStatus, string> = {
  PENDING: "En attente",
  ACCEPTED: "Accepté",
  DECLINED: "Décliné",
  MAYBE: "Peut-être",
};

export const RSVP_STATUS_COLORS: Record<RsvpStatus, string> = {
  PENDING: "#F59E0B",
  ACCEPTED: "#10B981",
  DECLINED: "#EF4444",
  MAYBE: "#3B82F6",
};

export const VENDOR_STATUS_LABELS: Record<VendorStatus, string> = {
  PROSPECT: "Prospect",
  QUOTE_RECEIVED: "Devis reçu",
  NEGOTIATING: "En négociation",
  BOOKED: "Réservé",
  CANCELLED: "Annulé",
};

export const VENDOR_STATUS_COLORS: Record<VendorStatus, string> = {
  PROSPECT: "#9CA3AF",
  QUOTE_RECEIVED: "#3B82F6",
  NEGOTIATING: "#F59E0B",
  BOOKED: "#10B981",
  CANCELLED: "#EF4444",
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "À faire",
  IN_PROGRESS: "En cours",
  DONE: "Terminée",
  CANCELLED: "Annulée",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Basse",
  MEDIUM: "Moyenne",
  HIGH: "Haute",
  CRITICAL: "Critique",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: "#9CA3AF",
  MEDIUM: "#3B82F6",
  HIGH: "#F59E0B",
  CRITICAL: "#EF4444",
};

export const DIET_LABELS: Record<Diet, string> = {
  STANDARD: "Standard",
  VEGETARIAN: "Végétarien",
  VEGAN: "Végan",
  HALAL: "Halal",
  KOSHER: "Casher",
  ALLERGY: "Allergie",
};

export const IDEA_CATEGORY_LABELS: Record<IdeaCategory, string> = {
  DECO_TABLE: "Décoration de table",
  DECO_SALLE: "Décoration de salle",
  DECO_CEREMONIE: "Décoration cérémonie",
  BOUQUET: "Fleurs & bouquets",
  TENUE: "Tenues",
  GATEAU: "Gâteau & desserts",
  PHOTO_STYLE: "Style photographique",
  LIEU: "Lieu & espace",
  OTHER: "Autre inspiration",
};

export const SIDE_LABELS: Record<Side, string> = {
  BRIDE: "Marié(e) 1",
  GROOM: "Marié(e) 2",
  BOTH: "Les deux",
};

// ─── Budget categories ──────────────────────────────────────────────────────

export const BUDGET_CATEGORIES: Record<string, VendorType[]> = {
  "Lieu & logistique": ["VENUE", "FURNITURE_RENTAL", "SECURITY"],
  Restauration: ["CATERER"],
  "Photographie & vidéo": ["PHOTOGRAPHER", "VIDEOGRAPHER", "PHOTO_BOOTH"],
  "Musique & animation": ["DJ", "BAND", "KIDS_ENTERTAINER"],
  "Fleurs & décoration": ["FLORIST"],
  Beauté: ["HAIR_MAKEUP"],
  Transport: ["TRANSPORT", "SHUTTLE"],
  Hébergement: ["HOTEL"],
  Papeterie: ["STATIONERY"],
  Coordination: ["WEDDING_PLANNER", "OFFICIANT"],
  Gâteau: ["CAKE"],
  Divers: ["OTHER"],
};

// ─── Pricing key to guest counter mapping ───────────────────────────────────

export const PRICING_KEY_GUEST_SOURCE: Record<PricingKey, string> = {
  cocktail: "nb_cocktail",
  repas: "nb_dinner",
  boisson: "nb_dinner",
  lendemain: "nb_next_day",
  vaisselle: "nb_dinner",
  nappe: "nb_dinner",
  vegetarien: "nb_vegetarian",
  enfant: "nb_children",
  presta: "manual",
};

export const PRICING_KEY_LABELS: Record<PricingKey, string> = {
  cocktail: "Cocktail apéritif",
  repas: "Repas",
  boisson: "Boissons",
  lendemain: "Le lendemain",
  vaisselle: "Vaisselle",
  nappe: "Nappe + serviette",
  vegetarien: "Option végétarienne",
  enfant: "Menu enfant",
  presta: "Prix / prestation",
};

// ─── Caterer services ───────────────────────────────────────────────────────

export const CATERER_SERVICES = [
  "Cocktail apéritif",
  "Vin d'honneur",
  "Trou normand",
  "Dîner assis",
  "Buffet",
  "Bar open",
  "Pièce montée",
  "Personnel de service",
  "Vaisselle & linge de table",
  "Décoration de table",
  "Livraison sur site",
  "Installation & débarrassage",
  "Animation / Sono",
] as const;

// ─── Vendor type icons (Ionicons glyph names) ─────────────────────────────

export const VENDOR_TYPE_ICONS: Record<VendorType, string> = {
  CATERER: "restaurant",
  VENUE: "business",
  PHOTOGRAPHER: "camera",
  VIDEOGRAPHER: "videocam",
  DJ: "musical-notes",
  BAND: "musical-notes",
  FLORIST: "flower",
  WEDDING_PLANNER: "clipboard",
  OFFICIANT: "person",
  HAIR_MAKEUP: "cut",
  TRANSPORT: "car",
  SHUTTLE: "bus",
  CAKE: "cafe",
  PHOTO_BOOTH: "aperture",
  KIDS_ENTERTAINER: "happy",
  STATIONERY: "mail",
  FURNITURE_RENTAL: "cube",
  HOTEL: "bed",
  SECURITY: "shield-checkmark",
  OTHER: "ellipsis-horizontal",
};
