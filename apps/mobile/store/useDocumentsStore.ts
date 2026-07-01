import { create } from "zustand";
import type { Document } from "@/db/schema";
import {
  addDocument as sdkAdd,
  updateDocument as sdkUpdate,
  removeDocument as sdkRemove,
  getDocumentsForOwner as sdkGetForOwner,
} from "@fiance/sdk";
import { getStorage } from "@/lib/kv-storage";
import { persistDocuments } from "@/lib/persistence";
import { notifySync } from "@/lib/starfish";

interface DocumentsState {
  documents: Document[];
  setDocuments: (documents: Document[]) => void;
  addDocument: (doc: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  removeDocument: (id: string) => void;
  getDocumentsForOwner: (ownerType: string, ownerId: string) => Document[];
}

export const useDocumentsStore = create<DocumentsState>((set, get) => ({
  documents: [],
  setDocuments: (documents) => set({ documents }),
  addDocument: (doc) => {
    set((s) => ({ documents: sdkAdd(s.documents, doc) }));
    const storage = getStorage();
    if (storage) persistDocuments(storage);
    notifySync();
  },
  updateDocument: (id, updates) => {
    set((s) => ({ documents: sdkUpdate(s.documents, id, updates) }));
    const storage = getStorage();
    if (storage) persistDocuments(storage);
    notifySync();
  },
  removeDocument: (id) => {
    set((s) => ({ documents: sdkRemove(s.documents, id) }));
    const storage = getStorage();
    if (storage) persistDocuments(storage);
    notifySync();
  },
  getDocumentsForOwner: (ownerType, ownerId) => sdkGetForOwner(get().documents, ownerType, ownerId),
}));
