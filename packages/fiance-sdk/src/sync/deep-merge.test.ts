import { describe, it, expect } from 'vitest';
import { deepMerge, stableStringify } from './deep-merge.js';

describe('deepMerge', () => {
  it('unions disjoint fields from base and overlay', () => {
    const base = { name: 'Alice', table: 't1' };
    const overlay = { diet: 'vegan' };
    expect(deepMerge(base, overlay)).toEqual({ name: 'Alice', table: 't1', diet: 'vegan' });
  });

  it('overlay wins on an overlapping leaf', () => {
    const base = { name: 'Alice' };
    const overlay = { name: 'Alicia' };
    expect(deepMerge(base, overlay)).toEqual({ name: 'Alicia' });
  });

  it('recurses into nested plain objects', () => {
    const base = { meta: { groupId: 'g1', tableId: 't1' } };
    const overlay = { meta: { tableId: 't2' } };
    expect(deepMerge(base, overlay)).toEqual({ meta: { groupId: 'g1', tableId: 't2' } });
  });

  it('replaces arrays wholesale with overlay (no element merge)', () => {
    const base = { tags: ['a', 'b'] };
    const overlay = { tags: ['c'] };
    expect(deepMerge(base, overlay)).toEqual({ tags: ['c'] });
  });

  it('returns overlay unchanged when base is null', () => {
    expect(deepMerge(null, { name: 'Alice' })).toEqual({ name: 'Alice' });
  });

  it('returns overlay unchanged when base is not a plain object', () => {
    expect(deepMerge('not-an-object', { name: 'Alice' })).toEqual({ name: 'Alice' });
  });

  it('keeps a key only present in base', () => {
    const base = { name: 'Alice', legacyField: 'x' };
    const overlay = { name: 'Alicia' };
    expect(deepMerge(base, overlay)).toEqual({ name: 'Alicia', legacyField: 'x' });
  });
});

describe('stableStringify', () => {
  it('produces the same string regardless of key order', () => {
    const a = { b: 1, a: 2 };
    const b = { a: 2, b: 1 };
    expect(stableStringify(a)).toBe(stableStringify(b));
  });

  it('sorts nested object keys too', () => {
    const a = { outer: { z: 1, y: 2 } };
    const b = { outer: { y: 2, z: 1 } };
    expect(stableStringify(a)).toBe(stableStringify(b));
  });

  it('distinguishes genuinely different content', () => {
    expect(stableStringify({ name: 'Alice' })).not.toBe(stableStringify({ name: 'Alicia' }));
  });

  it('is stable across repeated calls on the same value', () => {
    const v = { name: 'Alice', meta: { tableId: 't1' } };
    expect(stableStringify(v)).toBe(stableStringify(v));
  });
});
