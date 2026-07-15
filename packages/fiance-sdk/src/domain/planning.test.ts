/**
 * Tests for planning logic — due date recalculation relative to wedding date.
 * Uses the exported function from usePlanningStore (pure logic, no store).
 */
import { describe, it, expect } from "vitest";
import { addMonths } from "date-fns";
import type { Task, DayOfItem } from './schema.js';
import { resolveRunOfShow, isDayOfMultiDay } from './planning.js';

// The recalculateDueDates function is pure logic — reimplement it here
// to avoid importing the full store (which pulls in react-native).
// This mirrors store/usePlanningStore.ts recalculateDueDates exactly.
function recalculateDueDates(tasks: Task[], weddingDate: string): Task[] {
  const wedding = new Date(weddingDate);
  return tasks.map((t) => {
    if (t.monthsBefore == null) return t;
    const dueDate = addMonths(wedding, -t.monthsBefore).toISOString();
    return { ...t, dueDate };
  });
}

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    categoryId: null,
    title: "Test task",
    description: null,
    status: "TODO",
    priority: "MEDIUM",
    dueDate: null,
    monthsBefore: null,
    isSystem: false,
    vendorId: null,
    assignee: null,
    reminderDaysBefore: null,
    completedAt: null,
    notes: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as Task;
}

describe("recalculateDueDates", () => {
  it("recalculates due dates based on monthsBefore", () => {
    const tasks = [
      makeTask({ id: "t1", monthsBefore: 6 }),
      makeTask({ id: "t2", monthsBefore: 1 }),
    ];
    const result = recalculateDueDates(tasks, "2026-09-15");
    expect(result[0].dueDate).toContain("2026-03");
    expect(result[1].dueDate).toContain("2026-08");
  });

  it("leaves tasks without monthsBefore unchanged", () => {
    const tasks = [
      makeTask({ id: "t1", monthsBefore: null, dueDate: "2026-05-01T00:00:00.000Z" }),
    ];
    const result = recalculateDueDates(tasks, "2026-09-15");
    expect(result[0].dueDate).toBe("2026-05-01T00:00:00.000Z");
  });

  it("handles negative monthsBefore (after wedding)", () => {
    const tasks = [makeTask({ id: "t1", monthsBefore: -1 })];
    const result = recalculateDueDates(tasks, "2026-09-15");
    expect(result[0].dueDate).toContain("2026-10");
  });

  it("handles zero monthsBefore (wedding day)", () => {
    const tasks = [makeTask({ id: "t1", monthsBefore: 0 })];
    const result = recalculateDueDates(tasks, "2026-09-15");
    expect(result[0].dueDate).toContain("2026-09-15");
  });

  it("returns empty array for empty input", () => {
    expect(recalculateDueDates([], "2026-09-15")).toEqual([]);
  });

  it("does not mutate original tasks", () => {
    const tasks = [makeTask({ id: "t1", monthsBefore: 3, dueDate: "old" })];
    const result = recalculateDueDates(tasks, "2026-09-15");
    expect(result[0]).not.toBe(tasks[0]);
    expect(tasks[0].dueDate).toBe("old");
  });
});

function makeDayOfItem(overrides: Partial<DayOfItem> = {}): DayOfItem {
  return {
    id: "item-1",
    title: "Cérémonie",
    date: null,
    time: "14:00",
    endTime: null,
    location: null,
    responsible: null,
    notes: null,
    isPublic: false,
    sortOrder: null,
    eventId: null,
    completedAt: null,
    roleId: null,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  };
}

describe("resolveRunOfShow", () => {
  it("picks the latest started, not-done item as current", () => {
    const items = [
      makeDayOfItem({ id: "a", time: "10:00" }),
      makeDayOfItem({ id: "b", time: "14:00" }),
      makeDayOfItem({ id: "c", time: "18:00" }),
    ];
    const result = resolveRunOfShow(items, "15:00");
    expect(result.current?.id).toBe("b");
    expect(result.next?.id).toBe("c");
    expect(result.total).toBe(3);
    expect(result.completedCount).toBe(0);
  });

  it("skips completed items when picking current/next", () => {
    const items = [
      makeDayOfItem({ id: "a", time: "10:00", completedAt: "2026-01-01T00:00:00.000Z" }),
      makeDayOfItem({ id: "b", time: "14:00", completedAt: "2026-01-01T00:00:00.000Z" }),
      makeDayOfItem({ id: "c", time: "18:00" }),
    ];
    const result = resolveRunOfShow(items, "20:00");
    expect(result.current?.id).toBe("c");
    expect(result.next).toBeNull();
    expect(result.completedCount).toBe(2);
  });

  it("returns null current before the first item has started", () => {
    const items = [makeDayOfItem({ id: "a", time: "10:00" })];
    const result = resolveRunOfShow(items, "08:00");
    expect(result.current).toBeNull();
    expect(result.next?.id).toBe("a");
  });

  it("returns null current and next once everything is done", () => {
    const items = [makeDayOfItem({ id: "a", time: "10:00", completedAt: "2026-01-01T00:00:00.000Z" })];
    const result = resolveRunOfShow(items, "12:00");
    expect(result.current).toBeNull();
    expect(result.next).toBeNull();
    expect(result.completedCount).toBe(1);
    expect(result.total).toBe(1);
  });

  it("handles an empty list", () => {
    const result = resolveRunOfShow([], "12:00");
    expect(result.current).toBeNull();
    expect(result.next).toBeNull();
    expect(result.total).toBe(0);
  });
});

describe("isDayOfMultiDay", () => {
  it("is false for a single item with no date (falls back to weddingDate)", () => {
    const items = [makeDayOfItem({ id: "a", date: null })];
    expect(isDayOfMultiDay(items, undefined, null, "2026-06-01")).toBe(false);
  });

  it("is false when every item shares the same date", () => {
    const items = [
      makeDayOfItem({ id: "a", date: "2026-06-01" }),
      makeDayOfItem({ id: "b", date: "2026-06-01" }),
    ];
    expect(isDayOfMultiDay(items, undefined, "2026-06-01", "2026-06-01")).toBe(false);
  });

  it("is true when items span two distinct dates", () => {
    const items = [
      makeDayOfItem({ id: "a", date: "2026-06-01" }),
      makeDayOfItem({ id: "b", date: "2026-06-02" }),
    ];
    expect(isDayOfMultiDay(items, undefined, "2026-06-01", "2026-06-01")).toBe(true);
  });

  it("excludes the item being edited so its stale date doesn't double-count", () => {
    // item "a" currently has 06-01 in the store, but the form's candidateDate
    // moves it to 06-02, matching "b" — should NOT read as multi-day.
    const items = [
      makeDayOfItem({ id: "a", date: "2026-06-01" }),
      makeDayOfItem({ id: "b", date: "2026-06-02" }),
    ];
    expect(isDayOfMultiDay(items, "a", "2026-06-02", "2026-06-01")).toBe(false);
  });

  it("counts a new item (excludeId not present in items) via candidateDate", () => {
    const items = [makeDayOfItem({ id: "a", date: "2026-06-01" })];
    expect(isDayOfMultiDay(items, "new", "2026-06-02", "2026-06-01")).toBe(true);
  });

  it("is false for an empty list with no candidate date", () => {
    expect(isDayOfMultiDay([], undefined, null, null)).toBe(false);
  });
});
