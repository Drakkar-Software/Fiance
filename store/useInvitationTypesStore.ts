import { create } from "zustand";
import type { InvitationTypeEntity } from "@/db/schema";
import { getStorage } from "@/lib/kv-storage";
import { persistInvitationTypes, persistGuests } from "@/lib/persistence";
import { notifySync } from "@/lib/starfish";
import { useGuestsStore } from "@/store/useGuestsStore";

interface InvitationTypesState {
  invitationTypes: InvitationTypeEntity[];
  setInvitationTypes: (types: InvitationTypeEntity[]) => void;
  addInvitationType: (type: InvitationTypeEntity) => void;
  updateInvitationType: (id: string, updates: Partial<InvitationTypeEntity>) => void;
  removeInvitationType: (id: string) => void;
}

export const useInvitationTypesStore = create<InvitationTypesState>((set) => ({
  invitationTypes: [],
  setInvitationTypes: (invitationTypes) => set({ invitationTypes }),
  addInvitationType: (type) => {
    set((state) => ({ invitationTypes: [...state.invitationTypes, type] }));
    const storage = getStorage();
    if (storage) persistInvitationTypes(storage);
    notifySync();
  },
  updateInvitationType: (id, updates) => {
    set((state) => ({
      invitationTypes: state.invitationTypes.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
      ),
    }));
    const storage = getStorage();
    if (storage) persistInvitationTypes(storage);
    notifySync();
  },
  removeInvitationType: (id) => {
    set((state) => ({
      invitationTypes: state.invitationTypes.filter((t) => t.id !== id),
    }));
    // Cascade: reset any guest with this type to the default "FULL"
    useGuestsStore.getState().setGuests(
      useGuestsStore.getState().guests.map((g) =>
        g.invitationType === id ? { ...g, invitationType: "FULL" } : g
      )
    );
    const storage = getStorage();
    if (storage) {
      persistInvitationTypes(storage);
      persistGuests(storage);
    }
    notifySync();
  },
}));
