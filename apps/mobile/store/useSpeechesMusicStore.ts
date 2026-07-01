import { create } from "zustand";
import type { Speech, PlaylistTrack } from "@/db/schema";
import { getStorage } from "@/lib/kv-storage";
import { persistSpeeches, persistPlaylistTracks } from "@/lib/persistence";
import { notifySync } from "@/lib/starfish";

interface SpeechesMusicState {
  // Discours
  speeches: Speech[];
  setSpeeches: (speeches: Speech[]) => void;
  addSpeech: (speech: Speech) => void;
  updateSpeech: (id: string, updates: Partial<Speech>) => void;
  removeSpeech: (id: string) => void;

  // Playlist
  playlistTracks: PlaylistTrack[];
  setPlaylistTracks: (tracks: PlaylistTrack[]) => void;
  addPlaylistTrack: (track: PlaylistTrack) => void;
  updatePlaylistTrack: (id: string, updates: Partial<PlaylistTrack>) => void;
  removePlaylistTrack: (id: string) => void;
}

export const useSpeechesMusicStore = create<SpeechesMusicState>((set) => ({
  // ─── Discours ────────────────────────────────────────────────────────
  speeches: [],
  setSpeeches: (speeches) => set({ speeches }),
  addSpeech: (speech) => {
    set((state) => ({ speeches: [...state.speeches, speech] }));
    const storage = getStorage();
    if (storage) persistSpeeches(storage);
    notifySync();
  },
  updateSpeech: (id, updates) => {
    set((state) => ({
      speeches: state.speeches.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
      ),
    }));
    const storage = getStorage();
    if (storage) persistSpeeches(storage);
    notifySync();
  },
  removeSpeech: (id) => {
    set((state) => ({ speeches: state.speeches.filter((s) => s.id !== id) }));
    const storage = getStorage();
    if (storage) persistSpeeches(storage);
    notifySync();
  },

  // ─── Playlist ────────────────────────────────────────────────────────
  playlistTracks: [],
  setPlaylistTracks: (playlistTracks) => set({ playlistTracks }),
  addPlaylistTrack: (track) => {
    set((state) => ({ playlistTracks: [...state.playlistTracks, track] }));
    const storage = getStorage();
    if (storage) persistPlaylistTracks(storage);
    notifySync();
  },
  updatePlaylistTrack: (id, updates) => {
    set((state) => ({
      playlistTracks: state.playlistTracks.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
      ),
    }));
    const storage = getStorage();
    if (storage) persistPlaylistTracks(storage);
    notifySync();
  },
  removePlaylistTrack: (id) => {
    set((state) => ({ playlistTracks: state.playlistTracks.filter((t) => t.id !== id) }));
    const storage = getStorage();
    if (storage) persistPlaylistTracks(storage);
    notifySync();
  },
}));
