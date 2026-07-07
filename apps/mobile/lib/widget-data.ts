import { differenceInDays } from "date-fns";
import i18n from "@/i18n";
import { safeFormat, getDateLocale } from "@/i18n/dateFnsLocale";
import { formatMoney } from "@/components/MoneyDisplay";
import { getPrimaryEvent } from "@fiance/sdk";
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

export interface WidgetLine {
  /** SF Symbol name. */
  icon: string;
  text: string;
}

export interface WidgetData {
  /** Header line: "J-142" / "Jour J" / "Félicitations !" / couple names. */
  title: string;
  /** Secondary header (couple names when the title is the countdown). */
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
  const daysUntil = countdownStr ? differenceInDays(new Date(countdownStr), now) : null;
  const couple = [wedding?.partner1Name, wedding?.partner2Name].filter(Boolean).join(" & ");

  let title: string;
  let subtitle = "";
  if (daysUntil == null) {
    title = couple || "Fiancé";
  } else if (daysUntil < 0) {
    title = t("congratulations");
    subtitle = couple;
  } else if (daysUntil === 0) {
    title = t("widgetToday");
    subtitle = couple;
  } else {
    title = `J-${daysUntil}`;
    subtitle = couple;
  }

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
    lines.push({ icon: "exclamationmark.triangle.fill", text: t("overdue", { count: overdue.length }) });
  }

  vendors
    .filter((v) => v.depositDueDate && !v.depositPaid && withinDays(v.depositDueDate, now, 7))
    .forEach((v) =>
      lines.push({
        icon: "creditcard.fill",
        text: t("deposit", { name: v.name, date: safeFormat(new Date(v.depositDueDate!), "dd/MM") }),
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
    .forEach((v) => lines.push({ icon: "clock.badge.exclamationmark", text: t("quoteExpiring", { name: v.name }) }));

  tasks
    .filter(
      (task) =>
        task.priority === "CRITICAL" &&
        task.status === "TODO" &&
        task.dueDate &&
        withinDays(task.dueDate, now, 30),
    )
    .forEach((task) => lines.push({ icon: "flag.fill", text: task.title }));

  if (counts.no_table_count > 0) {
    lines.push({ icon: "person.2.fill", text: t("noTable", { count: counts.no_table_count }) });
  }
  if (budget.remaining < 0) {
    lines.push({ icon: "eurosign.circle.fill", text: t("overBudget", { amount: formatMoney(Math.abs(budget.remaining)) }) });
  }

  // ── 2. Upcoming agenda events (soonest first) ──
  const today = safeFormat(now, "yyyy-MM-dd");
  [...agendaEvents]
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time || "").localeCompare(b.time || ""))
    .forEach((e) =>
      lines.push({
        icon: "calendar",
        text: `${e.title} · ${dayFmt(e.date)}${e.time ? ` ${e.time}` : ""}`,
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
      }),
    );

  return { title, subtitle, lines: lines.slice(0, 8), empty: t("nothingUpcoming") };
}
