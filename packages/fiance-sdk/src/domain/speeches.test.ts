import { describe, it, expect } from 'vitest';
import type { Speech } from './schema.js';
import { addSpeech, updateSpeech, removeSpeech } from './speeches.js';

function makeSpeech(overrides: Partial<Speech> = {}): Speech {
  return {
    id: 'speech1',
    title: 'Discours du témoin',
    guestId: null,
    speakerName: null,
    roleId: null,
    durationMin: null,
    dayOfItemId: null,
    content: null,
    sortOrder: null,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  };
}

describe('addSpeech', () => {
  it('appends to list', () => {
    const result = addSpeech([], makeSpeech());
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('speech1');
  });
});

describe('updateSpeech', () => {
  it('updates matching entry and stamps updatedAt', () => {
    const result = updateSpeech([makeSpeech()], 'speech1', { durationMin: 5 });
    expect(result[0].durationMin).toBe(5);
    expect(result[0].updatedAt).not.toBeNull();
  });

  it('ignores non-matching id', () => {
    const result = updateSpeech([makeSpeech()], 'other', { durationMin: 5 });
    expect(result[0].durationMin).toBeNull();
  });
});

describe('removeSpeech', () => {
  it('removes matching entry', () => {
    const result = removeSpeech([makeSpeech(), makeSpeech({ id: 'speech2' })], 'speech1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('speech2');
  });
});
