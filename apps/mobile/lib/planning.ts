import { addMonths } from "date-fns";
import * as Crypto from "expo-crypto";
import type { Task, TaskCategory } from "@fiance/sdk";
import i18n from "@/i18n";

// ─── Default categories ─────────────────────────────────────────────────────

const CATEGORY_KEYS = [
  { key: "planning:categories.admin", icon: "file-text", color: "#3B82F6" },
  { key: "planning:categories.venue", icon: "map-pin", color: "#10B981" },
  { key: "planning:categories.catering", icon: "utensils", color: "#F59E0B" },
  { key: "planning:categories.attire", icon: "sparkles", color: "#EC4899" },
  { key: "planning:categories.photo", icon: "camera", color: "#8B5CF6" },
  { key: "planning:categories.music", icon: "music", color: "#6366F1" },
  { key: "planning:categories.flowers", icon: "flower", color: "#84CC16" },
  { key: "planning:categories.beauty", icon: "heart", color: "#F9A8D4" },
  { key: "planning:categories.guests", icon: "users", color: "#38BDF8" },
  { key: "planning:categories.budget", icon: "credit-card", color: "#F97316" },
  { key: "planning:categories.honeymoon", icon: "plane", color: "#06B6D4" },
  { key: "planning:categories.misc", icon: "more-horizontal", color: "#9CA3AF" },
];

// ─── Template tasks ─────────────────────────────────────────────────────────

interface TemplateTask {
  titleKey: string;
  categoryKey: string;
  monthsBefore: number | null;
  priority: string;
}

const T = "planning:templateTasks";

const TEMPLATE_TASKS: TemplateTask[] = [
  { titleKey: `${T}.setDate`, categoryKey: "planning:categories.admin", monthsBefore: 18, priority: "CRITICAL" },
  { titleKey: `${T}.defineBudget`, categoryKey: "planning:categories.budget", monthsBefore: 18, priority: "CRITICAL" },
  { titleKey: `${T}.guestList`, categoryKey: "planning:categories.guests", monthsBefore: 18, priority: "HIGH" },
  { titleKey: `${T}.ceremonyType`, categoryKey: "planning:categories.admin", monthsBefore: 18, priority: "HIGH" },
  { titleKey: `${T}.bookVenue`, categoryKey: "planning:categories.venue", monthsBefore: 18, priority: "CRITICAL" },
  { titleKey: `${T}.bookPhotographer`, categoryKey: "planning:categories.photo", monthsBefore: 18, priority: "HIGH" },
  { titleKey: `${T}.bookVideographer`, categoryKey: "planning:categories.photo", monthsBefore: 18, priority: "MEDIUM" },
  { titleKey: `${T}.bookCaterer`, categoryKey: "planning:categories.catering", monthsBefore: 12, priority: "CRITICAL" },
  { titleKey: `${T}.bookDj`, categoryKey: "planning:categories.music", monthsBefore: 12, priority: "HIGH" },
  { titleKey: `${T}.bookFlorist`, categoryKey: "planning:categories.flowers", monthsBefore: 12, priority: "MEDIUM" },
  { titleKey: `${T}.publishBanns`, categoryKey: "planning:categories.admin", monthsBefore: 12, priority: "CRITICAL" },
  { titleKey: `${T}.civilPaperwork`, categoryKey: "planning:categories.admin", monthsBefore: 6, priority: "CRITICAL" },
  { titleKey: `${T}.sendInvitations`, categoryKey: "planning:categories.guests", monthsBefore: 6, priority: "HIGH" },
  { titleKey: `${T}.chooseOutfit`, categoryKey: "planning:categories.attire", monthsBefore: 9, priority: "HIGH" },
  { titleKey: `${T}.finalFitting`, categoryKey: "planning:categories.attire", monthsBefore: 2, priority: "HIGH" },
  { titleKey: `${T}.bookHairMakeup`, categoryKey: "planning:categories.beauty", monthsBefore: 9, priority: "MEDIUM" },
  { titleKey: `${T}.trialHairMakeup`, categoryKey: "planning:categories.beauty", monthsBefore: 3, priority: "MEDIUM" },
  { titleKey: `${T}.bookTransport`, categoryKey: "planning:categories.venue", monthsBefore: 9, priority: "MEDIUM" },
  { titleKey: `${T}.rsvpDeadline`, categoryKey: "planning:categories.guests", monthsBefore: 4, priority: "HIGH" },
  { titleKey: `${T}.seatingPlan`, categoryKey: "planning:categories.guests", monthsBefore: 2, priority: "HIGH" },
  { titleKey: `${T}.finalizeMenu`, categoryKey: "planning:categories.catering", monthsBefore: 2, priority: "HIGH" },
  { titleKey: `${T}.payVenue`, categoryKey: "planning:categories.budget", monthsBefore: 1, priority: "CRITICAL" },
  { titleKey: `${T}.payCaterer`, categoryKey: "planning:categories.budget", monthsBefore: 1, priority: "CRITICAL" },
  { titleKey: `${T}.payPhotographer`, categoryKey: "planning:categories.budget", monthsBefore: 1, priority: "HIGH" },
  { titleKey: `${T}.orderCake`, categoryKey: "planning:categories.catering", monthsBefore: 6, priority: "MEDIUM" },
  { titleKey: `${T}.bookHotels`, categoryKey: "planning:categories.venue", monthsBefore: 9, priority: "MEDIUM" },
  { titleKey: `${T}.prepareSpeeches`, categoryKey: "planning:categories.misc", monthsBefore: 1, priority: "MEDIUM" },
  { titleKey: `${T}.preparePlaylist`, categoryKey: "planning:categories.music", monthsBefore: 1, priority: "MEDIUM" },
  { titleKey: `${T}.prepareRings`, categoryKey: "planning:categories.admin", monthsBefore: 3, priority: "HIGH" },
  { titleKey: `${T}.bookHoneymoon`, categoryKey: "planning:categories.honeymoon", monthsBefore: 12, priority: "HIGH" },
  { titleKey: `${T}.weddingInsurance`, categoryKey: "planning:categories.admin", monthsBefore: 6, priority: "MEDIUM" },
  { titleKey: `${T}.nextDayBrunch`, categoryKey: "planning:categories.catering", monthsBefore: 3, priority: "MEDIUM" },
  { titleKey: `${T}.thankGuests`, categoryKey: "planning:categories.guests", monthsBefore: -1, priority: "MEDIUM" },
  { titleKey: `${T}.collectPhotos`, categoryKey: "planning:categories.photo", monthsBefore: -2, priority: "MEDIUM" },
  // ── Additional tasks inspired by the Mariages.net retro-planning ──
  { titleKey: `${T}.findOfficiant`, categoryKey: "planning:categories.admin", monthsBefore: 12, priority: "HIGH" },
  { titleKey: `${T}.sendSaveTheDate`, categoryKey: "planning:categories.guests", monthsBefore: 10, priority: "MEDIUM" },
  { titleKey: `${T}.chooseWitnesses`, categoryKey: "planning:categories.guests", monthsBefore: 8, priority: "HIGH" },
  { titleKey: `${T}.matrimonialRegime`, categoryKey: "planning:categories.admin", monthsBefore: 8, priority: "MEDIUM" },
  { titleKey: `${T}.religiousDocs`, categoryKey: "planning:categories.admin", monthsBefore: 7, priority: "MEDIUM" },
  { titleKey: `${T}.createWeddingWebsite`, categoryKey: "planning:categories.guests", monthsBefore: 6, priority: "MEDIUM" },
  { titleKey: `${T}.chooseGuestGifts`, categoryKey: "planning:categories.misc", monthsBefore: 3, priority: "MEDIUM" },
  { titleKey: `${T}.chooseAccessories`, categoryKey: "planning:categories.attire", monthsBefore: 3, priority: "MEDIUM" },
  { titleKey: `${T}.bookWeddingNightHotel`, categoryKey: "planning:categories.venue", monthsBefore: 3, priority: "MEDIUM" },
  { titleKey: `${T}.bachelorParty`, categoryKey: "planning:categories.misc", monthsBefore: 2, priority: "LOW" },
  { titleKey: `${T}.ceremonyProgram`, categoryKey: "planning:categories.admin", monthsBefore: 2, priority: "MEDIUM" },
  { titleKey: `${T}.lastInfoGuests`, categoryKey: "planning:categories.guests", monthsBefore: 1, priority: "MEDIUM" },
  { titleKey: `${T}.honeymoonDocs`, categoryKey: "planning:categories.honeymoon", monthsBefore: 1, priority: "MEDIUM" },
  { titleKey: `${T}.pickupOutfits`, categoryKey: "planning:categories.attire", monthsBefore: 0, priority: "HIGH" },
  // ── More tasks inspired by the Mariages.net retro-planning (batch 2) ──
  { titleKey: `${T}.announceWedding`, categoryKey: "planning:categories.misc", monthsBefore: 18, priority: "LOW" },
  { titleKey: `${T}.engagementParty`, categoryKey: "planning:categories.misc", monthsBefore: 16, priority: "LOW" },
  { titleKey: `${T}.honeymoonDestination`, categoryKey: "planning:categories.honeymoon", monthsBefore: 15, priority: "MEDIUM" },
  { titleKey: `${T}.bookCeremonyVenue`, categoryKey: "planning:categories.venue", monthsBefore: 14, priority: "HIGH" },
  { titleKey: `${T}.chooseDecoration`, categoryKey: "planning:categories.flowers", monthsBefore: 8, priority: "MEDIUM" },
  { titleKey: `${T}.orderStationery`, categoryKey: "planning:categories.misc", monthsBefore: 8, priority: "MEDIUM" },
  { titleKey: `${T}.confirmGuestAddresses`, categoryKey: "planning:categories.guests", monthsBefore: 7, priority: "MEDIUM" },
  { titleKey: `${T}.menuTasting`, categoryKey: "planning:categories.catering", monthsBefore: 5, priority: "MEDIUM" },
  { titleKey: `${T}.planEntertainment`, categoryKey: "planning:categories.music", monthsBefore: 4, priority: "MEDIUM" },
  { titleKey: `${T}.chooseBouquet`, categoryKey: "planning:categories.flowers", monthsBefore: 3, priority: "MEDIUM" },
  { titleKey: `${T}.firstDanceMusic`, categoryKey: "planning:categories.music", monthsBefore: 2, priority: "LOW" },
  { titleKey: `${T}.collectRings`, categoryKey: "planning:categories.admin", monthsBefore: 1, priority: "HIGH" },
  { titleKey: `${T}.sendSeatingToVenue`, categoryKey: "planning:categories.catering", monthsBefore: 1, priority: "HIGH" },
  { titleKey: `${T}.confirmVendors`, categoryKey: "planning:categories.misc", monthsBefore: 0, priority: "HIGH" },
  { titleKey: `${T}.collectBouquet`, categoryKey: "planning:categories.flowers", monthsBefore: 0, priority: "HIGH" },
  { titleKey: `${T}.reviewVendors`, categoryKey: "planning:categories.misc", monthsBefore: -1, priority: "LOW" },
];

export const TEMPLATE_TASK_COUNT = TEMPLATE_TASKS.length;
export const TEMPLATE_CATEGORY_COUNT = CATEGORY_KEYS.length;

/** Generate default categories with UUIDs */
export function generateDefaultCategories(): TaskCategory[] {
  return CATEGORY_KEYS.map((c, idx) => ({
    id: Crypto.randomUUID(),
    name: i18n.t(c.key),
    icon: c.icon,
    color: c.color,
    sortOrder: idx + 1,
  }));
}

/** Generate template tasks linked to categories */
export function generateTemplateTasks(
  categories: TaskCategory[],
  weddingDate?: string
): Task[] {
  const now = new Date().toISOString();
  const categoryMap = new Map(categories.map((c) => [c.name, c.id]));

  return TEMPLATE_TASKS.map((t) => {
    let dueDate: string | null = null;
    if (t.monthsBefore != null && weddingDate) {
      dueDate = addMonths(new Date(weddingDate), -t.monthsBefore).toISOString();
    }

    const categoryName = i18n.t(t.categoryKey);
    return {
      id: Crypto.randomUUID(),
      categoryId: categoryMap.get(categoryName) || null,
      title: i18n.t(t.titleKey),
      description: null,
      status: "TODO",
      priority: t.priority,
      dueDate,
      monthsBefore: t.monthsBefore,
      isSystem: true,
      vendorId: null,
      reminderDaysBefore: null,
      completedAt: null,
      notes: null,
      createdAt: now,
      updatedAt: now,
    } as Task;
  });
}

/** Recalculate all due dates when wedding date changes */
export function recalculateDueDates(
  tasks: Task[],
  weddingDate: string
): Task[] {
  const wedding = new Date(weddingDate);
  return tasks.map((t) => {
    if (t.monthsBefore == null) return t;
    const dueDate = addMonths(wedding, -t.monthsBefore).toISOString();
    return { ...t, dueDate };
  });
}
