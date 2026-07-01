import type { Speech } from './schema.js';

// ─── Speech assignments ──────────────────────────────────────────────────────

export function addSpeech(speeches: Speech[], speech: Speech): Speech[] {
  return [...speeches, speech];
}

export function updateSpeech(
  speeches: Speech[],
  id: string,
  updates: Partial<Speech>,
): Speech[] {
  const now = new Date().toISOString();
  return speeches.map((s) => (s.id === id ? { ...s, ...updates, updatedAt: now } : s));
}

export function removeSpeech(speeches: Speech[], id: string): Speech[] {
  return speeches.filter((s) => s.id !== id);
}
