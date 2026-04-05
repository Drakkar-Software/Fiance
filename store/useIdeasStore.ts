import { create } from "zustand";
import type { Idea, IdeaCollection } from "@/db/schema";
import type { IdeaCategory } from "@/db/types";
import { getDatabase } from "@/db/provider";
import {
  persistIdea, updateIdeaDb, deleteIdeaDb,
  persistIdeaCollection, updateIdeaCollectionDb, deleteIdeaCollectionDb,
} from "@/lib/persistence";
import { notifySync } from "@/lib/starfish";

interface IdeasState {
  ideas: Idea[];
  collections: IdeaCollection[];
  setIdeas: (ideas: Idea[]) => void;
  setCollections: (collections: IdeaCollection[]) => void;
  addIdea: (idea: Idea) => void;
  updateIdea: (id: string, updates: Partial<Idea>) => void;
  removeIdea: (id: string) => void;
  addCollection: (collection: IdeaCollection) => void;
  updateCollection: (id: string, updates: Partial<IdeaCollection>) => void;
  removeCollection: (id: string) => void;
  getIdeasByCollection: (collectionId: string) => Idea[];
  getIdeasByCategory: (category: IdeaCategory) => Idea[];
  getIdeasByVendor: (vendorId: string) => Idea[];
  getFavorites: () => Idea[];
  getAllTags: () => string[];
  getRecentIdeas: (count: number) => Idea[];
}

export const useIdeasStore = create<IdeasState>((set, get) => ({
  ideas: [],
  collections: [],
  setIdeas: (ideas) => set({ ideas }),
  setCollections: (collections) => set({ collections }),
  addIdea: (idea) => {
    set((state) => ({ ideas: [...state.ideas, idea] }));
    const db = getDatabase();
    if (db) persistIdea(db, idea);
    notifySync();
  },
  updateIdea: (id, updates) => {
    const updatedFields = { ...updates, updatedAt: new Date().toISOString() };
    set((state) => ({
      ideas: state.ideas.map((i) =>
        i.id === id ? { ...i, ...updatedFields } : i
      ),
    }));
    const db = getDatabase();
    if (db) updateIdeaDb(db, id, updatedFields);
    notifySync();
  },
  removeIdea: (id) => {
    set((state) => ({ ideas: state.ideas.filter((i) => i.id !== id) }));
    const db = getDatabase();
    if (db) deleteIdeaDb(db, id);
    notifySync();
  },
  addCollection: (collection) => {
    set((state) => ({ collections: [...state.collections, collection] }));
    const db = getDatabase();
    if (db) persistIdeaCollection(db, collection);
    notifySync();
  },
  updateCollection: (id, updates) => {
    const updatedFields = { ...updates, updatedAt: new Date().toISOString() };
    set((state) => ({
      collections: state.collections.map((c) =>
        c.id === id ? { ...c, ...updatedFields } : c
      ),
    }));
    const db = getDatabase();
    if (db) updateIdeaCollectionDb(db, id, updatedFields);
    notifySync();
  },
  removeCollection: (id) => {
    set((state) => ({
      collections: state.collections.filter((c) => c.id !== id),
      ideas: state.ideas.map((i) =>
        i.collectionId === id ? { ...i, collectionId: null } : i
      ),
    }));
    const db = getDatabase();
    if (db) deleteIdeaCollectionDb(db, id);
    notifySync();
  },
  getIdeasByCollection: (collectionId) =>
    get().ideas.filter((i) => i.collectionId === collectionId),
  getIdeasByCategory: (category) =>
    get().ideas.filter((i) => i.category === category),
  getIdeasByVendor: (vendorId) =>
    get().ideas.filter((i) => i.vendorId === vendorId),
  getFavorites: () => get().ideas.filter((i) => i.isFavorite),
  getAllTags: () => {
    const tags = new Set<string>();
    get().ideas.forEach((i) => {
      if (i.tags) {
        try {
          const parsed = JSON.parse(i.tags) as string[];
          parsed.forEach((t) => tags.add(t));
        } catch {}
      }
    });
    return Array.from(tags).sort();
  },
  getRecentIdeas: (count) =>
    [...get().ideas]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      )
      .slice(0, count),
}));
