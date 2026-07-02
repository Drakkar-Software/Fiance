// NodeNext .js extension required
import { addMonths } from 'date-fns';
import type { Task, TaskCategory, DayOfItem } from './schema.js';

// ─── Translator injection ────────────────────────────────────────────────────
// The app passes its i18n t() function here instead of importing it directly.
export type Translator = (key: string, opts?: Record<string, unknown>) => string;

// ─── ID generator injection ──────────────────────────────────────────────────
// The app passes crypto.randomUUID / Crypto.randomUUID here.
export type IdGenerator = () => string;

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
];

export const TEMPLATE_TASK_COUNT = TEMPLATE_TASKS.length;
export const TEMPLATE_CATEGORY_COUNT = CATEGORY_KEYS.length;

/** Generate default categories with UUIDs (requires translator + id generator injection) */
export function generateDefaultCategories(
  t: Translator,
  generateId: IdGenerator
): TaskCategory[] {
  return CATEGORY_KEYS.map((c, idx) => ({
    id: generateId(),
    name: t(c.key),
    icon: c.icon,
    color: c.color,
    sortOrder: idx + 1,
  }));
}

/** Generate template tasks linked to categories (requires translator + id generator injection) */
export function generateTemplateTasks(
  categories: TaskCategory[],
  t: Translator,
  generateId: IdGenerator,
  weddingDate?: string
): Task[] {
  const now = new Date().toISOString();
  const categoryMap = new Map(categories.map((c) => [c.name, c.id]));

  return TEMPLATE_TASKS.map((tmpl) => {
    let dueDate: string | null = null;
    if (tmpl.monthsBefore != null && weddingDate) {
      dueDate = addMonths(new Date(weddingDate), -tmpl.monthsBefore).toISOString();
    }

    const categoryName = t(tmpl.categoryKey);
    return {
      id: generateId(),
      categoryId: categoryMap.get(categoryName) || null,
      title: t(tmpl.titleKey),
      description: null,
      status: "TODO",
      priority: tmpl.priority,
      dueDate,
      monthsBefore: tmpl.monthsBefore,
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

// ─── Live day-of run-of-show ─────────────────────────────────────────────────

export interface RunOfShowResult {
  current: DayOfItem | null;
  next: DayOfItem | null;
  completedCount: number;
  total: number;
}

/**
 * Resolves the "current" and "next" day-of item for live mode, given the
 * current time as "HH:mm". Pure — the caller supplies `nowHHmm` so this stays
 * testable without faking the clock.
 *
 * current = the latest item that has started (time <= now) and isn't marked done.
 * next = the first not-done item after current, in time order.
 */
export function resolveRunOfShow(items: DayOfItem[], nowHHmm: string): RunOfShowResult {
  const sorted = [...items].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  const completedCount = sorted.filter((i) => !!i.completedAt).length;

  const started = sorted.filter((i) => (i.time || '') <= nowHHmm);
  const current = [...started].reverse().find((i) => !i.completedAt) ?? null;

  const currentIdx = current ? sorted.indexOf(current) : -1;
  const next = sorted.slice(currentIdx + 1).find((i) => !i.completedAt) ?? null;

  return { current, next, completedCount, total: sorted.length };
}
