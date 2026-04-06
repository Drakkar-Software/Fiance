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

export type PlanningAspect = "preparation" | "agenda" | "day-of";

export const PLANNING_ASPECT_LABELS: Record<PlanningAspect, string> = {
  preparation: "planning:aspects.preparation",
  agenda: "planning:aspects.agenda",
  "day-of": "planning:aspects.day-of",
};

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";

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
  | "NEXT_DAY"
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
  SECURITY: "vendors:types.SECURITY",
  OTHER: "vendors:types.OTHER",
};

export const INVITATION_TYPE_LABELS: Record<InvitationType, string> = {
  CEREMONY: "guests:invitationTypes.CEREMONY",
  COCKTAIL: "guests:invitationTypes.COCKTAIL",
  DINNER: "guests:invitationTypes.DINNER",
  FULL: "guests:invitationTypes.FULL",
  NEXT_DAY: "guests:invitationTypes.NEXT_DAY",
};

export const RSVP_STATUS_LABELS: Record<RsvpStatus, string> = {
  PENDING: "guests:rsvp.PENDING",
  ACCEPTED: "guests:rsvp.ACCEPTED",
  DECLINED: "guests:rsvp.DECLINED",
  MAYBE: "guests:rsvp.MAYBE",
};

export const RSVP_STATUS_COLORS: Record<RsvpStatus, string> = {
  PENDING: "#F59E0B",
  ACCEPTED: "#10B981",
  DECLINED: "#EF4444",
  MAYBE: "#3B82F6",
};

export const VENDOR_STATUS_LABELS: Record<VendorStatus, string> = {
  PROSPECT: "vendors:status.PROSPECT",
  QUOTE_RECEIVED: "vendors:status.QUOTE_RECEIVED",
  NEGOTIATING: "vendors:status.NEGOTIATING",
  BOOKED: "vendors:status.BOOKED",
  CANCELLED: "vendors:status.CANCELLED",
};

export const VENDOR_STATUS_COLORS: Record<VendorStatus, string> = {
  PROSPECT: "#9CA3AF",
  QUOTE_RECEIVED: "#3B82F6",
  NEGOTIATING: "#F59E0B",
  BOOKED: "#10B981",
  CANCELLED: "#EF4444",
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "planning:status.TODO",
  IN_PROGRESS: "planning:status.IN_PROGRESS",
  DONE: "planning:status.DONE",
  CANCELLED: "planning:status.CANCELLED",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "planning:priority.LOW",
  MEDIUM: "planning:priority.MEDIUM",
  HIGH: "planning:priority.HIGH",
  CRITICAL: "planning:priority.CRITICAL",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: "#9CA3AF",
  MEDIUM: "#3B82F6",
  HIGH: "#F59E0B",
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

export const SIDE_LABELS: Record<Side, string> = {
  BRIDE: "guests:side.BRIDE",
  GROOM: "guests:side.GROOM",
  BOTH: "guests:side.BOTH",
};

// ─── Budget categories ──────────────────────────────────────────────────────

export const BUDGET_CATEGORIES: Record<string, VendorType[]> = {
  venue: ["VENUE", "FURNITURE_RENTAL", "SECURITY"],
  catering: ["CATERER"],
  photo_video: ["PHOTOGRAPHER", "VIDEOGRAPHER", "PHOTO_BOOTH"],
  music_entertainment: ["DJ", "BAND", "KIDS_ENTERTAINER"],
  flowers_decor: ["FLORIST"],
  beauty: ["HAIR_MAKEUP"],
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

// ─── Pricing key to guest counter mapping ───────────────────────────────────

export const PRICING_KEY_GUEST_SOURCE: Record<PricingKey, string> = {
  cocktail: "nb_cocktail",
  dinner: "nb_dinner",
  drinks: "nb_dinner",
  "next-day": "nb_next_day",
  tableware: "nb_dinner",
  linen: "nb_dinner",
  vegetarian: "nb_vegetarian",
  child: "nb_children",
  service: "manual",
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

// ─── Vendor type icons (Lucide components) ─────────────────────────────────

import type { LucideIcon } from "lucide-react-native";
import {
  UtensilsCrossed,
  Building2,
  Camera,
  Video,
  Music,
  Flower2,
  ClipboardList,
  User,
  Scissors,
  Car,
  Bus,
  Cake,
  Aperture,
  Smile,
  Mail,
  Box,
  Hotel,
  ShieldCheck,
  Ellipsis,
} from "lucide-react-native";

export const VENDOR_TYPE_ICONS: Record<VendorType, LucideIcon> = {
  CATERER: UtensilsCrossed,
  VENUE: Building2,
  PHOTOGRAPHER: Camera,
  VIDEOGRAPHER: Video,
  DJ: Music,
  BAND: Music,
  FLORIST: Flower2,
  WEDDING_PLANNER: ClipboardList,
  OFFICIANT: User,
  HAIR_MAKEUP: Scissors,
  TRANSPORT: Car,
  SHUTTLE: Bus,
  CAKE: Cake,
  PHOTO_BOOTH: Aperture,
  KIDS_ENTERTAINER: Smile,
  STATIONERY: Mail,
  FURNITURE_RENTAL: Box,
  HOTEL: Hotel,
  SECURITY: ShieldCheck,
  OTHER: Ellipsis,
};
