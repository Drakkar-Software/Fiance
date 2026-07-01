import { create } from "zustand";
import type { Contributor } from "@/db/schema";
import { getStorage } from "@/lib/kv-storage";
import { persistContributors } from "@/lib/persistence";
import { notifySync } from "@/lib/starfish";

interface ContributorsState {
  contributors: Contributor[];
  setContributors: (contributors: Contributor[]) => void;
  addContributor: (contributor: Contributor) => void;
  updateContributor: (id: string, updates: Partial<Contributor>) => void;
  removeContributor: (id: string) => void;
}

export const useContributorsStore = create<ContributorsState>((set) => ({
  contributors: [],
  setContributors: (contributors) => set({ contributors }),
  addContributor: (contributor) => {
    set((state) => ({ contributors: [...state.contributors, contributor] }));
    const storage = getStorage();
    if (storage) persistContributors(storage);
    notifySync();
  },
  updateContributor: (id, updates) => {
    set((state) => ({
      contributors: state.contributors.map((c) =>
        c.id === id
          ? { ...c, ...updates, updatedAt: new Date().toISOString() }
          : c
      ),
    }));
    const storage = getStorage();
    if (storage) persistContributors(storage);
    notifySync();
  },
  removeContributor: (id) => {
    set((state) => ({
      contributors: state.contributors.filter((c) => c.id !== id),
    }));
    const storage = getStorage();
    if (storage) persistContributors(storage);
    notifySync();
  },
}));
