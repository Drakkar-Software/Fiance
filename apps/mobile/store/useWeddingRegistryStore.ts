import { create } from "zustand";
import type { WeddingRegistry, WeddingRegistryEntry } from "@/lib/wedding-registry";
import {
  loadRegistry,
  saveRegistry,
  createWeddingEntry,
  deleteWeddingEntry,
  setActiveWeddingEntry,
  updateWeddingEntry,
} from "@/lib/wedding-registry";
import { useRevenueCatStore } from "@/store/useRevenueCatStore";

interface WeddingRegistryState {
  registry: WeddingRegistry | null;
  isLoaded: boolean;

  load: () => Promise<void>;
  createWedding: (label: string, seedPhrase?: string, serverUrl?: string, spaceId?: string, role?: "owner" | "member") => Promise<WeddingRegistryEntry>;
  switchWedding: (id: string) => Promise<void>;
  deleteWedding: (id: string) => Promise<void>;
  updateWedding: (id: string, updates: Partial<Pick<WeddingRegistryEntry, "label" | "seedPhrase" | "serverUrl" | "syncDisabled" | "spaceId" | "role" | "weddingNodeId" | "syncNamespace" | "roleId" | "permissions" | "inviteSubjectId" | "revocationGeneration" | "revokedEntries" | "ownerId">>) => Promise<void>;
}

export const useWeddingRegistryStore = create<WeddingRegistryState>((set, get) => ({
  registry: null,
  isLoaded: false,

  load: async () => {
    const registry = await loadRegistry();
    set({ registry, isLoaded: true });
  },

  createWedding: async (label, seedPhrase, serverUrl, spaceId, role) => {
    const entry = await createWeddingEntry(label, seedPhrase, serverUrl, spaceId, role);
    const registry = await loadRegistry();
    // Reset BEFORE the registry update below triggers React's re-render, so
    // RevenueCatInitializer/SyncInitializer never observe the previous active
    // wedding's stale premium flag on the very first render of the new one —
    // relying on RevenueCatInitializer's own effect to reset it is too late,
    // since effects run after render and can race a sibling's render-time read.
    useRevenueCatStore.getState().setPremium(false);
    set({ registry });
    return entry;
  },

  switchWedding: async (id) => {
    await setActiveWeddingEntry(id);
    const registry = await loadRegistry();
    useRevenueCatStore.getState().setPremium(false); // see createWedding
    set({ registry });
  },

  deleteWedding: async (id) => {
    await deleteWeddingEntry(id);
    const registry = await loadRegistry();
    useRevenueCatStore.getState().setPremium(false); // see createWedding
    set({ registry });
  },

  updateWedding: async (id, updates) => {
    await updateWeddingEntry(id, updates);
    const registry = await loadRegistry();
    set({ registry });
  },
}));
