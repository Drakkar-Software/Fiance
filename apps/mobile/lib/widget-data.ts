import { differenceInDays } from "date-fns";
import i18n from "@/i18n";
import { safeFormat, getDateLocale } from "@/i18n/dateFnsLocale";
import { formatMoney } from "@/components/MoneyDisplay";
import { getPrimaryEvent } from "@fiance/sdk";

import { isAgendaEventUpcoming } from "@/lib/agenda-upcoming";
import { useWeddingStore } from "@/store/useWeddingStore";
import { useWeddingEventsStore } from "@/store/useWeddingEventsStore";
import { useVendorsStore } from "@/store/useVendorsStore";
import { useGuestsStore, computeCounts } from "@/store/useGuestsStore";
import { usePlanningStore } from "@/store/usePlanningStore";
import { computeBudgetSummary } from "@/store/useBudgetStore";

// Builds the iOS widget payload from current store state. Everything is
// pre-localized here (the native widget can't call i18next), so the widget
// component just renders strings. Mirrors the home dashboard's warnings +
// agenda/tasks summary. Priority-ordered so short widgets fill their space
// with whatever matters most: warnings first, then agenda, then tasks.
//
// `tone` mirrors the home dashboard's own color language (see
// app/(tabs)/home/index.tsx) so a line reads the same way here as it does in
// the app: clay = critical/overdue/over-budget, mustard = due soon, blue =
// agenda, mute = a plain upcoming task.

export type WidgetTone = "critical" | "warning" | "info" | "neutral";

export interface WidgetLine {
  /** SF Symbol name. */
  icon: string;
  text: string;
  tone: WidgetTone;
}

export interface WidgetData {
  /** Days left, when a wedding date is set and hasn't passed/arrived yet. */
  daysUntil: number | null;
  /** Localized unit label for `daysUntil` ("jours" / "days"). */
  dayUnitLabel: string;
  /** Headline shown instead of the digit when there's no date, it's today, or it has passed. */
  headline: string;
  /** Wedding date, formatted ("sam. 12 sept. 2026"). Empty when no date is set. */
  dateLabel: string;
  /** Couple names. */
  subtitle: string;
  /** Priority-ordered content lines; the widget slices to its size capacity. */
  lines: WidgetLine[];
  /** Shown when there are no lines at all. */
  empty: string;
}

const t = (key: string, opts?: Record<string, unknown>): string =>
  i18n.t(key, { ns: "dashboard", ...opts }) as string;

const withinDays = (dateStr: string, now: Date, max: number): boolean => {
  const days = differenceInDays(new Date(dateStr), now);
  return days >= 0 && days <= max;
};

const dayFmt = (dateStr: string): string =>
  safeFormat(new Date(dateStr + "T00:00:00"), "d MMM", { locale: getDateLocale() });

export function buildWidgetData(): WidgetData {
  const now = new Date();
  const wedding = useWeddingStore.getState().wedding;
  const weddingEvents = useWeddingEventsStore.getState().weddingEvents;
  const { vendors, quotePricings, vendorPayments } = useVendorsStore.getState();
  const guests = useGuestsStore.getState().guests;
  const { tasks, agendaEvents } = usePlanningStore.getState();

  // ── Countdown ──
  const primaryEvent = getPrimaryEvent(weddingEvents);
  const countdownStr = primaryEvent?.date ?? wedding?.weddingDate ?? null;
  const daysUntilRaw = countdownStr ? differenceInDays(new Date(countdownStr), now) : null;
  const couple = [wedding?.partner1Name, wedding?.partner2Name].filter(Boolean).join(" & ");

  let daysUntil: number | null = null;
  let headline = "";
  if (daysUntilRaw == null) {
    headline = couple || "Fiancé";
  } else if (daysUntilRaw < 0) {
    headline = t("congratulations");
  } else if (daysUntilRaw === 0) {
    headline = t("widgetToday");
  } else {
    daysUntil = daysUntilRaw;
  }
  const dateLabel = countdownStr
    ? safeFormat(new Date(countdownStr + "T00:00:00"), "EEE d MMM yyyy", { locale: getDateLocale() })
    : "";

  // ── Budget summary (non-hook, mirrors useBudgetSummary) ──
  const counts = computeCounts(guests);
  let categoryBudgets: Record<string, number> | null = null;
  if (wedding?.categoryBudgets) {
    try {
      categoryBudgets = JSON.parse(wedding.categoryBudgets) as Record<string, number>;
    } catch {
      categoryBudgets = null;
    }
  }
  const budget = computeBudgetSummary(
    wedding?.budgetTarget ?? 0,
    vendors,
    quotePricings,
    counts,
    categoryBudgets,
    vendorPayments,
  );

  const lines: WidgetLine[] = [];

  // ── 1. Warnings, most urgent first (same thresholds as home) ──
  const overdue = tasks.filter(
    (task) => task.dueDate && new Date(task.dueDate) < now && task.status !== "DONE",
  );
  if (overdue.length > 0) {
    lines.push({
      icon: "exclamationmark.triangle.fill",
      text: t("overdue", { count: overdue.length }),
      tone: "critical",
    });
  }

  vendors
    .filter((v) => v.depositDueDate && !v.depositPaid && withinDays(v.depositDueDate, now, 7))
    .forEach((v) =>
      lines.push({
        icon: "creditcard.fill",
        text: t("deposit", { name: v.name, date: safeFormat(new Date(v.depositDueDate!), "dd/MM") }),
        tone: "warning",
      }),
    );

  vendors
    .filter(
      (v) =>
        v.validityDate &&
        v.status !== "BOOKED" &&
        v.status !== "CANCELLED" &&
        withinDays(v.validityDate, now, 7),
    )
    .forEach((v) =>
      lines.push({ icon: "clock.badge.exclamationmark", text: t("quoteExpiring", { name: v.name }), tone: "warning" }),
    );

  tasks
    .filter(
      (task) =>
        task.priority === "CRITICAL" &&
        task.status === "TODO" &&
        task.dueDate &&
        withinDays(task.dueDate, now, 30),
    )
    .forEach((task) => lines.push({ icon: "flag.fill", text: task.title, tone: "critical" }));

  if (counts.no_table_count > 0) {
    lines.push({ icon: "person.2.fill", text: t("noTable", { count: counts.no_table_count }), tone: "warning" });
  }
  if (budget.remaining < 0) {
    lines.push({
      icon: "eurosign.circle.fill",
      text: t("overBudget", { amount: formatMoney(Math.abs(budget.remaining)) }),
      tone: "critical",
    });
  }

  // ── 2. Upcoming agenda events (soonest first) ──
  [...agendaEvents]
    .filter((e) => isAgendaEventUpcoming(e, now))
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time || "").localeCompare(b.time || ""))
    .forEach((e) =>
      lines.push({
        icon: "calendar",
        text: `${e.title} · ${dayFmt(e.date)}${e.time ? ` ${e.time}` : ""}`,
        tone: "info",
      }),
    );

  // ── 3. Next TODO tasks (by due date, undated last) ──
  [...tasks]
    .filter((task) => task.status === "TODO")
    .sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    })
    .forEach((task) =>
      lines.push({
        icon: "circle",
        text: `${task.title}${task.dueDate ? ` · ${dayFmt(task.dueDate)}` : ""}`,
        tone: "neutral",
      }),
    );

  return {
    daysUntil,
    dayUnitLabel: t("days"),
    headline,
    dateLabel,
    subtitle: couple,
    lines: lines.slice(0, 8),
    empty: t("nothingUpcoming"),
  };
}
