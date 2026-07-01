import { describe, it, expect } from 'vitest';
import type { PlaylistTrack } from './schema.js';
import { addPlaylistTrack, updatePlaylistTrack, removePlaylistTrack } from './playlist.js';

function makeTrack(overrides: Partial<PlaylistTrack> = {}): PlaylistTrack {
  return {
    id: 'track1',
    title: 'Perfect',
    artist: 'Ed Sheeran',
    moment: 'FIRST_DANCE',
    dayOfItemId: null,
    mustPlay: null,
    notes: null,
    sortOrder: null,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  };
}

describe('addPlaylistTrack', () => {
  it('appends to list', () => {
    const result = addPlaylistTrack([], makeTrack());
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('track1');
  });
});

describe('updatePlaylistTrack', () => {
  it('updates matching entry and stamps updatedAt', () => {
    const result = updatePlaylistTrack([makeTrack()], 'track1', { mustPlay: true });
    expect(result[0].mustPlay).toBe(true);
    expect(result[0].updatedAt).not.toBeNull();
  });

  it('ignores non-matching id', () => {
    const result = updatePlaylistTrack([makeTrack()], 'other', { mustPlay: true });
    expect(result[0].mustPlay).toBeNull();
  });
});

describe('removePlaylistTrack', () => {
  it('removes matching entry', () => {
    const result = removePlaylistTrack([makeTrack(), makeTrack({ id: 'track2' })], 'track1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('track2');
  });
});
