import { create } from "zustand";
import type { Task, TaskCategory, AgendaEvent, DayOfItem } from "@/db/schema";
import { addMonths, isBefore, differenceInDays } from "date-fns";
import { getStorage } from "@/lib/kv-storage";
import {
  persistTasks, persistTaskCategories,
  persistAgendaEvents, persistDayOfItems,
} from "@/lib/persistence";
import { notifySync } from "@/lib/starfish";
import { onTaskMutation, onAgendaMutation } from "@/lib/notifications";
import { useSettingsStore } from "@/store/useSettingsStore";

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
    const storage = getStorage();
    if (storage) persistTasks(storage);
    notifySync();
    if (useSettingsStore.getState().notificationsEnabled) onTaskMutation(task, "add");
  },
  updateTask: (id, updates) => {
    const updatedFields = { ...updates, updatedAt: new Date().toISOString() };
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, ...updatedFields } : t
      ),
    }));
    const storage = getStorage();
    if (storage) persistTasks(storage);
    notifySync();
    const updated = get().tasks.find((t) => t.id === id);
    if (updated && useSettingsStore.getState().notificationsEnabled) onTaskMutation(updated, "update");
  },
  removeTask: (id) => {
    const task = get().tasks.find((t) => t.id === id);
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
    const storage = getStorage();
    if (storage) persistTasks(storage);
    notifySync();
    if (task && useSettingsStore.getState().notificationsEnabled) onTaskMutation(task, "remove");
  },
  addCategory: (category) => {
    set((state) => ({ categories: [...state.categories, category] }));
    const storage = getStorage();
    if (storage) persistTaskCategories(storage);
    notifySync();
  },
  updateCategory: (id, updates) => {
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
    const storage = getStorage();
    if (storage) persistTaskCategories(storage);
    notifySync();
  },
  removeCategory: (id) => {
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    }));
    const storage = getStorage();
    if (storage) persistTaskCategories(storage);
    notifySync();
  },
  getOverdueTasks: () => {
    const now = new Date();
    return get().tasks.filter(
      (t) =>
        t.dueDate &&
        isBefore(new Date(t.dueDate), now) &&
        t.status !== "DONE"
    );
  },
  getUrgentTasks: () => {
    const now = new Date();
    return get().tasks.filter((t) => {
      if (!t.dueDate || t.status === "DONE") return false;
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
    if (tasks.length === 0) return 0;
    const done = tasks.filter((t) => t.status === "DONE").length;
    return Math.round((done / tasks.length) * 100);
  },

  // ─── Agenda ──────────────────────────────────────────────────────────
  agendaEvents: [],
  setAgendaEvents: (agendaEvents) => set({ agendaEvents }),
  addAgendaEvent: (event) => {
    set((state) => ({ agendaEvents: [...state.agendaEvents, event] }));
    const storage = getStorage();
    if (storage) persistAgendaEvents(storage);
    notifySync();
    if (useSettingsStore.getState().notificationsEnabled) onAgendaMutation(event, "add");
  },
  updateAgendaEvent: (id, updates) => {
    const updatedFields = { ...updates, updatedAt: new Date().toISOString() };
    set((state) => ({
      agendaEvents: state.agendaEvents.map((e) =>
        e.id === id ? { ...e, ...updatedFields } : e
      ),
    }));
    const storage = getStorage();
    if (storage) persistAgendaEvents(storage);
    notifySync();
    const updated = get().agendaEvents.find((e) => e.id === id);
    if (updated && useSettingsStore.getState().notificationsEnabled) onAgendaMutation(updated, "update");
  },
  removeAgendaEvent: (id) => {
    const event = get().agendaEvents.find((e) => e.id === id);
    set((state) => ({ agendaEvents: state.agendaEvents.filter((e) => e.id !== id) }));
    const storage = getStorage();
    if (storage) persistAgendaEvents(storage);
    notifySync();
    if (event && useSettingsStore.getState().notificationsEnabled) onAgendaMutation(event, "remove");
  },

  // ─── Jour J ──────────────────────────────────────────────────────────
  dayOfItems: [],
  setDayOfItems: (dayOfItems) => set({ dayOfItems }),
  addDayOfItem: (item) => {
    set((state) => ({ dayOfItems: [...state.dayOfItems, item] }));
    const storage = getStorage();
    if (storage) persistDayOfItems(storage);
    notifySync();
  },
  updateDayOfItem: (id, updates) => {
    const updatedFields = { ...updates, updatedAt: new Date().toISOString() };
    set((state) => ({
      dayOfItems: state.dayOfItems.map((i) =>
        i.id === id ? { ...i, ...updatedFields } : i
      ),
    }));
    const storage = getStorage();
    if (storage) persistDayOfItems(storage);
    notifySync();
  },
  removeDayOfItem: (id) => {
    set((state) => ({ dayOfItems: state.dayOfItems.filter((i) => i.id !== id) }));
    const storage = getStorage();
    if (storage) persistDayOfItems(storage);
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
