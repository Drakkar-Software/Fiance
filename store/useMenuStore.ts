import { create } from "zustand";
import type { MenuOption } from "@/db/schema";
import { getDatabase } from "@/db/provider";
import {
  persistMenuOption,
  updateMenuOptionDb,
  deleteMenuOptionDb,
} from "@/lib/persistence";
import { notifySync } from "@/lib/starfish";

interface MenuState {
  options: MenuOption[];
  setOptions: (options: MenuOption[]) => void;
  addOption: (option: MenuOption) => void;
  updateOption: (id: string, updates: Partial<MenuOption>) => void;
  removeOption: (id: string) => void;
  getOptionsByCourse: (course: string) => MenuOption[];
}

export const useMenuStore = create<MenuState>((set, get) => ({
  options: [],
  setOptions: (options) => set({ options }),
  addOption: (option) => {
    set((state) => ({ options: [...state.options, option] }));
    const db = getDatabase();
    if (db) persistMenuOption(db, option);
    notifySync();
  },
  updateOption: (id, updates) => {
    set((state) => ({
      options: state.options.map((o) =>
        o.id === id
          ? { ...o, ...updates, updatedAt: new Date().toISOString() }
          : o
      ),
    }));
    const db = getDatabase();
    if (db) updateMenuOptionDb(db, id, { ...updates, updatedAt: new Date().toISOString() });
    notifySync();
  },
  removeOption: (id) => {
    set((state) => ({ options: state.options.filter((o) => o.id !== id) }));
    const db = getDatabase();
    if (db) deleteMenuOptionDb(db, id);
    notifySync();
  },
  getOptionsByCourse: (course) =>
    get()
      .options.filter((o) => o.course === course)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
}));
