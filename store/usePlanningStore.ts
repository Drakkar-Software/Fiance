import { create } from "zustand";
import type { Task, TaskCategory } from "@/db/schema";
import { addMonths, isBefore, differenceInDays } from "date-fns";

interface PlanningState {
  tasks: Task[];
  categories: TaskCategory[];
  setTasks: (tasks: Task[]) => void;
  setCategories: (categories: TaskCategory[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  addCategory: (category: TaskCategory) => void;
  updateCategory: (id: string, updates: Partial<TaskCategory>) => void;
  removeCategory: (id: string) => void;
  getOverdueTasks: () => Task[];
  getUrgentTasks: () => Task[];
  getCriticalUnstarted: () => Task[];
  getTasksByCategory: (categoryId: string) => Task[];
  getCompletionRate: () => number;
}

export const usePlanningStore = create<PlanningState>((set, get) => ({
  tasks: [],
  categories: [],
  setTasks: (tasks) => set({ tasks }),
  setCategories: (categories) => set({ categories }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? { ...t, ...updates, updatedAt: new Date().toISOString() }
          : t
      ),
    })),
  removeTask: (id) =>
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
  addCategory: (category) =>
    set((state) => ({ categories: [...state.categories, category] })),
  updateCategory: (id, updates) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),
  removeCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    })),
  getOverdueTasks: () => {
    const now = new Date();
    return get().tasks.filter(
      (t) =>
        t.dueDate &&
        isBefore(new Date(t.dueDate), now) &&
        t.status !== "DONE" &&
        t.status !== "CANCELLED"
    );
  },
  getUrgentTasks: () => {
    const now = new Date();
    return get().tasks.filter((t) => {
      if (!t.dueDate || t.status === "DONE" || t.status === "CANCELLED")
        return false;
      const days = differenceInDays(new Date(t.dueDate), now);
      return days >= 0 && days <= 7;
    });
  },
  getCriticalUnstarted: () => {
    const now = new Date();
    return get().tasks.filter((t) => {
      if (
        t.priority !== "CRITICAL" ||
        t.status !== "TODO" ||
        !t.dueDate
      )
        return false;
      const days = differenceInDays(new Date(t.dueDate), now);
      return days >= 0 && days <= 30;
    });
  },
  getTasksByCategory: (categoryId) =>
    get().tasks.filter((t) => t.categoryId === categoryId),
  getCompletionRate: () => {
    const { tasks } = get();
    const active = tasks.filter((t) => t.status !== "CANCELLED");
    if (active.length === 0) return 0;
    const done = active.filter((t) => t.status === "DONE").length;
    return Math.round((done / active.length) * 100);
  },
}));

/** Recalculate due dates for all tasks with months_before offset */
export function recalculateDueDates(
  tasks: Task[],
  weddingDate: string
): Task[] {
  const wedding = new Date(weddingDate);
  return tasks.map((t) => {
    if (t.monthsBefore == null) return t;
    const dueDate = addMonths(wedding, -t.monthsBefore);
    return { ...t, dueDate: dueDate.toISOString() };
  });
}
