import { create } from "zustand";

/**
 * Session-scoped (not persisted) flag: true when the active device's space cap has been
 * proven read-only — either proactively (its saved link-access entry has `write: false`)
 * or authoritatively (a push actually 403'd). See space-sync.ts's push functions and
 * providers.tsx's activateSync for the two setters.
 *
 * Root cause this guards against: a member device can hold a stale read-only cap (e.g.
 * from an invite minted before the owner re-invited as Editor, or from an old space
 * layout) while its local registry role/matrix still says it can edit. Writes then 403
 * silently (the error was only console.warn'd), and the next hydrate's wholesale
 * store replace reverts the edit with zero feedback. This flag makes that non-silent
 * (ReadOnlyBanner) and prevents it (usePermissions forces edit affordances off).
 */
interface SyncAccessState {
  writeDenied: boolean;
  setWriteDenied: (denied: boolean) => void;
}

export const useSyncAccessStore = create<SyncAccessState>((set) => ({
  writeDenied: false,
  setWriteDenied: (denied) => set({ writeDenied: denied }),
}));
