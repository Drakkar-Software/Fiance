import type { PlaylistTrack } from './schema.js';

// ─── Playlist tracks ─────────────────────────────────────────────────────────

export function addPlaylistTrack(tracks: PlaylistTrack[], track: PlaylistTrack): PlaylistTrack[] {
  return [...tracks, track];
}

export function updatePlaylistTrack(
  tracks: PlaylistTrack[],
  id: string,
  updates: Partial<PlaylistTrack>,
): PlaylistTrack[] {
  const now = new Date().toISOString();
  return tracks.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: now } : t));
}

export function removePlaylistTrack(tracks: PlaylistTrack[], id: string): PlaylistTrack[] {
  return tracks.filter((t) => t.id !== id);
}
