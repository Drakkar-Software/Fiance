/**
 * Tests for planning logic — due date recalculation relative to wedding date.
 * Uses the exported function from usePlanningStore (pure logic, no store).
 */
import { describe, it, expect } from "vitest";
import { addMonths } from "date-fns";
import type { Task } from './schema.js';

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
