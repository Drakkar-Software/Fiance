import { create } from "zustand";
import type { Task, TaskCategory, AgendaEvent, DayOfItem } from "@/db/schema";
import { addMonths, isBefore, differenceInDays } from "date-fns";
import { getDatabase } from "@/db/provider";
import {
  persistTask, updateTaskDb, deleteTaskDb,
  persistTaskCategory, updateTaskCategoryDb, deleteTaskCategoryDb,
  persistAgendaEvent, updateAgendaEventDb, deleteAgendaEventDb,
  persistDayOfItem, updateDayOfItemDb, deleteDayOfItemDb,
} from "@/lib/persistence";
import { notifySync } from "@/lib/starfish";

interface PlanningState {
  // Préparatifs
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

  // Agenda
  agendaEvents: AgendaEvent[];
  setAgendaEvents: (events: AgendaEvent[]) => void;
  addAgendaEvent: (event: AgendaEvent) => void;
  updateAgendaEvent: (id: string, updates: Partial<AgendaEvent>) => void;
  removeAgendaEvent: (id: string) => void;

  // Jour J
  dayOfItems: DayOfItem[];
  setDayOfItems: (items: DayOfItem[]) => void;
  addDayOfItem: (item: DayOfItem) => void;
  updateDayOfItem: (id: string, updates: Partial<DayOfItem>) => void;
  removeDayOfItem: (id: string) => void;
}

export const usePlanningStore = create<PlanningState>((set, get) => ({
  // ─── Préparatifs ─────────────────────────────────────────────────────
  tasks: [],
  categories: [],
  setTasks: (tasks) => set({ tasks }),
  setCategories: (categories) => set({ categories }),
  addTask: (task) => {
    set((state) => ({ tasks: [...state.tasks, task] }));
    const db = getDatabase();
    if (db) persistTask(db, task);
    notifySync();
  },
  updateTask: (id, updates) => {
    const updatedFields = { ...updates, updatedAt: new Date().toISOString() };
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, ...updatedFields } : t
      ),
    }));
    const db = getDatabase();
    if (db) updateTaskDb(db, id, updatedFields);
    notifySync();
  },
  removeTask: (id) => {
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
    const db = getDatabase();
    if (db) deleteTaskDb(db, id);
    notifySync();
  },
  addCategory: (category) => {
    set((state) => ({ categories: [...state.categories, category] }));
    const db = getDatabase();
    if (db) persistTaskCategory(db, category);
    notifySync();
  },
  updateCategory: (id, updates) => {
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
    const db = getDatabase();
    if (db) updateTaskCategoryDb(db, id, updates);
    notifySync();
  },
  removeCategory: (id) => {
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    }));
    const db = getDatabase();
    if (db) deleteTaskCategoryDb(db, id);
    notifySync();
  },
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
      if (t.priority !== "CRITICAL" || t.status !== "TODO" || !t.dueDate)
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

  // ─── Agenda ──────────────────────────────────────────────────────────
  agendaEvents: [],
  setAgendaEvents: (agendaEvents) => set({ agendaEvents }),
  addAgendaEvent: (event) => {
    set((state) => ({ agendaEvents: [...state.agendaEvents, event] }));
    const db = getDatabase();
    if (db) persistAgendaEvent(db, event);
    notifySync();
  },
  updateAgendaEvent: (id, updates) => {
    const updatedFields = { ...updates, updatedAt: new Date().toISOString() };
    set((state) => ({
      agendaEvents: state.agendaEvents.map((e) =>
        e.id === id ? { ...e, ...updatedFields } : e
      ),
    }));
    const db = getDatabase();
    if (db) updateAgendaEventDb(db, id, updatedFields);
    notifySync();
  },
  removeAgendaEvent: (id) => {
    set((state) => ({ agendaEvents: state.agendaEvents.filter((e) => e.id !== id) }));
    const db = getDatabase();
    if (db) deleteAgendaEventDb(db, id);
    notifySync();
  },

  // ─── Jour J ──────────────────────────────────────────────────────────
  dayOfItems: [],
  setDayOfItems: (dayOfItems) => set({ dayOfItems }),
  addDayOfItem: (item) => {
    set((state) => ({ dayOfItems: [...state.dayOfItems, item] }));
    const db = getDatabase();
    if (db) persistDayOfItem(db, item);
    notifySync();
  },
  updateDayOfItem: (id, updates) => {
    const updatedFields = { ...updates, updatedAt: new Date().toISOString() };
    set((state) => ({
      dayOfItems: state.dayOfItems.map((i) =>
        i.id === id ? { ...i, ...updatedFields } : i
      ),
    }));
    const db = getDatabase();
    if (db) updateDayOfItemDb(db, id, updatedFields);
    notifySync();
  },
  removeDayOfItem: (id) => {
    set((state) => ({ dayOfItems: state.dayOfItems.filter((i) => i.id !== id) }));
    const db = getDatabase();
    if (db) deleteDayOfItemDb(db, id);
    notifySync();
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
