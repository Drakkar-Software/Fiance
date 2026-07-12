import { describe, it, expect } from 'vitest';
import {
  mergeCollectionDoc,
  buildCollectionDoc,
  buildSingletonDoc,
  readSingletonEntity,
  mergeSingletonDoc,
  asCollectionDoc,
  liveItems,
  collectionNodeId,
  isCollectionNodeId,
  TOMBSTONE_TTL_MS,
  COLLECTION_DOC_FMT,
  type CollectionDoc,
  type CollectionState,
} from './collection-doc.js';

const doc = (partial: Partial<CollectionDoc>): CollectionDoc => ({
  fmt: COLLECTION_DOC_FMT,
  items: {},
  rev: {},
  tombstones: {},
  ...partial,
});

const entity = (id: string, extra: Record<string, unknown> = {}) => ({ id, ...extra });

describe('collectionNodeId / isCollectionNodeId', () => {
  it('builds a deterministic sentinel id and recognises it', () => {
    const id = collectionNodeId('guest', 'wed-1');
    expect(id).toBe('col:guest:wed-1');
    expect(isCollectionNodeId(id)).toBe(true);
    expect(isCollectionNodeId('some-guest-uuid')).toBe(false);
  });
});

describe('asCollectionDoc', () => {
  it('coerces null / partial / legacy payloads to a well-formed doc', () => {
    expect(asCollectionDoc(null)).toEqual(doc({}));
    expect(asCollectionDoc(undefined)).toEqual(doc({}));
    expect(asCollectionDoc({ items: { g1: entity('g1') } })).toEqual(
      doc({ items: { g1: entity('g1') } }),
    );
    // An array or primitive is not a doc → empty doc.
    expect(asCollectionDoc([1, 2, 3])).toEqual(doc({}));
  });
});

describe('liveItems', () => {
  it('returns items minus tombstoned ids', () => {
    const d = doc({
      items: { g1: entity('g1'), g2: entity('g2') },
      rev: { g1: 1, g2: 1 },
      tombstones: { g2: 5 },
    });
    expect(liveItems(d).map((e) => e.id)).toEqual(['g1']);
  });
});

describe('mergeCollectionDoc — concurrent adds', () => {
  it('unions adds to different ids without clobbering', () => {
    const remote = doc({ items: { GA: entity('GA') }, rev: { GA: 10 } });
    const local = doc({ items: { GB: entity('GB') }, rev: { GB: 11 } });
    const out = mergeCollectionDoc(remote, local);
    expect(Object.keys(out.items).sort()).toEqual(['GA', 'GB']);
    expect(out.rev).toEqual({ GA: 10, GB: 11 });
  });

  it('a remote-only entity (peer add, not yet hydrated) survives a local push', () => {
    const remote = doc({ items: { PEER: entity('PEER') }, rev: { PEER: 7 } });
    const local = doc({ items: { MINE: entity('MINE') }, rev: { MINE: 8 } });
    const out = mergeCollectionDoc(remote, local);
    expect(out.items.PEER).toBeDefined();
    expect(out.items.MINE).toBeDefined();
  });
});

describe('mergeCollectionDoc — same-id edit LWW', () => {
  it('higher rev wins the conflicting leaf', () => {
    const remote = doc({ items: { g1: entity('g1', { name: 'Remote' }) }, rev: { g1: 20 } });
    const local = doc({ items: { g1: entity('g1', { name: 'Local' }) }, rev: { g1: 25 } });
    expect(mergeCollectionDoc(remote, local).items.g1.name).toBe('Local');
    expect(mergeCollectionDoc(local, remote).items.g1.name).toBe('Local');
  });

  it('field-merges untouched fields from the older copy under the newer one', () => {
    const remote = doc({ items: { g1: entity('g1', { a: 'fromRemote', shared: 'old' }) }, rev: { g1: 20 } });
    const local = doc({ items: { g1: entity('g1', { b: 'fromLocal', shared: 'new' }) }, rev: { g1: 25 } });
    const merged = mergeCollectionDoc(remote, local).items.g1;
    expect(merged).toMatchObject({ a: 'fromRemote', b: 'fromLocal', shared: 'new' });
  });
});

describe('mergeCollectionDoc — tombstones honored', () => {
  it('a stale peer copy does NOT resurrect a tombstoned id', () => {
    // Remote still holds the old item; local deleted it more recently.
    const remote = doc({ items: { g1: entity('g1') }, rev: { g1: 30 } });
    const local = doc({ tombstones: { g1: 40 } });
    const out = mergeCollectionDoc(remote, local);
    expect(out.items.g1).toBeUndefined();
    expect(out.tombstones.g1).toBe(40);
  });

  it('delete-vs-edit race: newer edit wins (edit after delete)', () => {
    const remote = doc({ items: { g1: entity('g1', { name: 'edited' }) }, rev: { g1: 100 } });
    const local = doc({ tombstones: { g1: 90 } });
    const out = mergeCollectionDoc(remote, local);
    expect(out.items.g1?.name).toBe('edited');
    expect(out.tombstones.g1).toBeUndefined();
  });

  it('delete-vs-edit race: newer delete wins (delete after edit)', () => {
    const remote = doc({ items: { g1: entity('g1', { name: 'edited' }) }, rev: { g1: 100 } });
    const local = doc({ tombstones: { g1: 110 } });
    const out = mergeCollectionDoc(remote, local);
    expect(out.items.g1).toBeUndefined();
    expect(out.tombstones.g1).toBe(110);
  });

  it('re-add after delete resurrects (live rev > tombstone)', () => {
    const remote = doc({ tombstones: { g1: 50 } });
    const local = doc({ items: { g1: entity('g1') }, rev: { g1: 100 } });
    const out = mergeCollectionDoc(remote, local);
    expect(out.items.g1).toBeDefined();
    expect(out.tombstones.g1).toBeUndefined();
  });

  it('add-wins on an exact rev/tombstone tie', () => {
    const remote = doc({ tombstones: { g1: 100 } });
    const local = doc({ items: { g1: entity('g1') }, rev: { g1: 100 } });
    expect(mergeCollectionDoc(remote, local).items.g1).toBeDefined();
  });
});

describe('mergeCollectionDoc — tombstone GC', () => {
  it('drops tombstones older than the TTL when `now` is supplied, keeps recent ones', () => {
    const now = 1_000_000_000_000;
    const remote = doc({
      tombstones: { old: now - TOMBSTONE_TTL_MS - 1, recent: now - 1000 },
    });
    const local = doc({});
    const out = mergeCollectionDoc(remote, local, { now });
    expect(out.tombstones.old).toBeUndefined();
    expect(out.tombstones.recent).toBe(now - 1000);
  });

  it('without `now`, keeps all tombstones (no GC)', () => {
    const remote = doc({ tombstones: { old: 1 } });
    expect(mergeCollectionDoc(remote, doc({})).tombstones.old).toBe(1);
  });
});

describe('mergeCollectionDoc — degenerate inputs', () => {
  it('handles a null / missing remote (first write)', () => {
    const local = doc({ items: { g1: entity('g1') }, rev: { g1: 5 } });
    expect(mergeCollectionDoc(null, local).items.g1).toBeDefined();
  });

  it('handles a legacy-shaped remote (no items/rev/tombstones keys)', () => {
    const local = doc({ items: { g1: entity('g1') }, rev: { g1: 5 } });
    expect(mergeCollectionDoc({ some: 'legacy' }, local).items.g1).toBeDefined();
  });

  it('output never contains non-finite numbers', () => {
    const local = doc({ items: { g1: entity('g1') } }); // rev intentionally missing
    const out = mergeCollectionDoc(null, local);
    expect(Number.isFinite(out.rev.g1)).toBe(true);
    expect(JSON.stringify(out)).toContain('"g1"'); // serialisable, no Infinity
  });
});

describe('buildCollectionDoc', () => {
  const empty: CollectionState = { rev: {}, tombstones: {} };

  it('stamps a fresh rev for a new entity', () => {
    const { doc: d, state } = buildCollectionDoc([entity('g1')], empty, new Set(), 1000);
    expect(d.items.g1).toBeDefined();
    expect(d.rev.g1).toBe(1000);
    expect(state.rev.g1).toBe(1000);
  });

  it('carries the prior rev for an unchanged entity', () => {
    const prev: CollectionState = { rev: { g1: 500 }, tombstones: {} };
    const { doc: d } = buildCollectionDoc([entity('g1')], prev, new Set(), 1000);
    expect(d.rev.g1).toBe(500); // not bumped — not in changedIds
  });

  it('bumps rev for a changed entity', () => {
    const prev: CollectionState = { rev: { g1: 500 }, tombstones: {} };
    const { doc: d } = buildCollectionDoc([entity('g1', { name: 'new' })], prev, new Set(['g1']), 1000);
    expect(d.rev.g1).toBe(1000);
  });

  it('tombstones an entity that disappeared from the store', () => {
    const prev: CollectionState = { rev: { g1: 500, g2: 500 }, tombstones: {} };
    const { doc: d } = buildCollectionDoc([entity('g1')], prev, new Set(), 1000);
    expect(d.items.g2).toBeUndefined();
    expect(d.tombstones.g2).toBe(1000);
    expect(d.rev.g2).toBeUndefined();
  });

  it('drops a prior tombstone when the entity is re-added', () => {
    const prev: CollectionState = { rev: {}, tombstones: { g1: 500 } };
    const { doc: d } = buildCollectionDoc([entity('g1')], prev, new Set(), 1000);
    expect(d.items.g1).toBeDefined();
    expect(d.tombstones.g1).toBeUndefined();
    expect(d.rev.g1).toBe(1000);
  });

  it('GCs tombstones older than the TTL', () => {
    const now = 1_000_000_000_000;
    const prev: CollectionState = { rev: {}, tombstones: { stale: now - TOMBSTONE_TTL_MS - 1, fresh: now - 1 } };
    const { doc: d } = buildCollectionDoc([], prev, new Set(), now);
    expect(d.tombstones.stale).toBeUndefined();
    expect(d.tombstones.fresh).toBe(now - 1);
  });

  it('a build then a merge round-trips a delete safely against a stale remote', () => {
    // Device deletes g2 locally.
    const prev: CollectionState = { rev: { g1: 500, g2: 500 }, tombstones: {} };
    const { doc: local } = buildCollectionDoc([entity('g1')], prev, new Set(), 1000);
    // Remote still has the old g1 + g2 (peer hasn't seen the delete).
    const remote = doc({ items: { g1: entity('g1'), g2: entity('g2') }, rev: { g1: 500, g2: 500 } });
    const merged = mergeCollectionDoc(remote, local);
    expect(merged.items.g1).toBeDefined();
    expect(merged.items.g2).toBeUndefined(); // stays deleted
    expect(merged.tombstones.g2).toBe(1000);
  });
});

describe('buildSingletonDoc', () => {
  it('wraps the entity as a 1-item doc keyed by id, stamped with the given rev', () => {
    const { doc: d, rev } = buildSingletonDoc('wed-1', entity('wed-1', { venue: 'Barn' }), 1000);
    expect(rev).toBe(1000);
    expect(d.items['wed-1']).toEqual(entity('wed-1', { venue: 'Barn' }));
    expect(d.rev['wed-1']).toBe(1000);
    expect(d.tombstones).toEqual({});
  });

  it('always stamps the given `now`, regardless of any prior state', () => {
    // A singleton is only ever built when about to be pushed (the caller's own dirty
    // check already gated on "did this change"), so there's no carried-rev case to
    // support the way buildCollectionDoc carries an unchanged entity's rev.
    const { rev } = buildSingletonDoc('wed-1', entity('wed-1'), 1000);
    expect(rev).toBe(1000);
  });
});

describe('readSingletonEntity', () => {
  it('reads a wrapped 1-item doc', () => {
    const d = doc({ items: { 'wed-1': entity('wed-1', { venue: 'Barn' }) }, rev: { 'wed-1': 42 } });
    const { entity: e, rev } = readSingletonEntity(d, 'wed-1');
    expect(e).toEqual(entity('wed-1', { venue: 'Barn' }));
    expect(rev).toBe(42);
  });

  it('adopts a legacy raw entity (no items map) at rev 0', () => {
    const legacy = { id: 'wed-1', venue: 'Barn' };
    const { entity: e, rev } = readSingletonEntity(legacy, 'wed-1');
    expect(e).toEqual(legacy);
    expect(rev).toBe(0);
  });

  it('returns null entity for null/non-record input', () => {
    expect(readSingletonEntity(null, 'wed-1').entity).toBeNull();
    expect(readSingletonEntity(undefined, 'wed-1').entity).toBeNull();
  });

  it('falls back to the first live item when the id key mismatches', () => {
    const d = doc({ items: { other: entity('other', { venue: 'Barn' }) }, rev: { other: 7 } });
    const { entity: e, rev } = readSingletonEntity(d, 'wed-1');
    expect(e).toEqual(entity('other', { venue: 'Barn' }));
    expect(rev).toBe(7);
  });

  it('prefers raw top-level fields over a stale `items` map on a hybrid doc', () => {
    // An old-build peer, still running the pre-migration deepMerge(cur, content) push,
    // splices its own raw fields onto an already-wrapped remote while leaving
    // items/rev/tombstones untouched — so `items` looks well-formed but is stale.
    const hybrid = {
      fmt: 2,
      items: { 'wed-1': entity('wed-1', { venue: 'StaleFromItems' }) },
      rev: { 'wed-1': 999 },
      tombstones: {},
      id: 'wed-1',
      venue: 'FreshFromOldBuildPush',
      date: '2026-09-01',
    };
    const { entity: e, rev } = readSingletonEntity(hybrid, 'wed-1');
    expect(e).toEqual({ id: 'wed-1', venue: 'FreshFromOldBuildPush', date: '2026-09-01' });
    expect(rev).toBe(0);
  });

  it('returns null for a doc with only wrapper keys but a malformed items value', () => {
    expect(readSingletonEntity({ fmt: 2, items: 'not-a-record' }, 'wed-1').entity).toBeNull();
  });
});

describe('mergeCollectionDoc — singleton (wedding) concurrent edits', () => {
  it('higher-rev whole-object wins, and the loser field survives via field-merge', () => {
    // Client A edited the venue (rev 20); client B edited the date (rev 25) — concurrently,
    // neither having seen the other's edit yet.
    const remote = doc({
      items: { 'wed-1': entity('wed-1', { venue: 'Barn', date: null }) },
      rev: { 'wed-1': 20 },
    });
    const local = doc({
      items: { 'wed-1': entity('wed-1', { venue: 'Barn', date: '2026-09-01' }) },
      rev: { 'wed-1': 25 },
    });
    const merged = mergeCollectionDoc(remote, local).items['wed-1'];
    // Local (higher rev) wins the whole object as the base, but this demonstrates the
    // key property: a field only the *older* side touched is not silently dropped when
    // both sides agree on it, and the winner's own edits are preserved.
    expect(merged.date).toBe('2026-09-01');
    expect(merged.venue).toBe('Barn');
  });

  it('a field only the older copy touched survives under the newer winner', () => {
    const remote = doc({ items: { 'wed-1': entity('wed-1', { venue: 'Barn' }) }, rev: { 'wed-1': 20 } });
    const local = doc({ items: { 'wed-1': entity('wed-1', { date: '2026-09-01' }) }, rev: { 'wed-1': 25 } });
    const merged = mergeCollectionDoc(remote, local).items['wed-1'];
    expect(merged).toMatchObject({ venue: 'Barn', date: '2026-09-01' });
  });
});

describe('mergeSingletonDoc — rollout-window tolerance for a legacy raw remote', () => {
  it('field-merges a legacy raw remote (no items wrapper) instead of treating it as empty', () => {
    // Remote is still on the pre-migration shape (an old build's last push).
    const legacyRemote = { id: 'wed-1', venue: 'Barn', untouched: 'fromLegacyRemote' };
    const { doc: local } = buildSingletonDoc('wed-1', { id: 'wed-1', venue: 'Barn', date: '2026-09-01' }, 1000);
    const merged = mergeSingletonDoc(legacyRemote, local, 'wed-1');
    // Local (rev 1000) beats the legacy remote's synthesized rev 0, but the remote's
    // untouched field survives via the field-merge — a plain mergeCollectionDoc would
    // have coerced the legacy shape to an empty doc and dropped it.
    expect(merged.items['wed-1']).toMatchObject({
      venue: 'Barn',
      date: '2026-09-01',
      untouched: 'fromLegacyRemote',
    });
  });

  it('merges normally against a new-shape remote (delegates straight to mergeCollectionDoc)', () => {
    const remote = doc({ items: { 'wed-1': entity('wed-1', { venue: 'Old' }) }, rev: { 'wed-1': 5 } });
    const { doc: local } = buildSingletonDoc('wed-1', { id: 'wed-1', venue: 'New' }, 10);
    const merged = mergeSingletonDoc(remote, local, 'wed-1');
    expect(merged.items['wed-1']).toMatchObject({ venue: 'New' });
  });

  it('handles a null/missing remote (first-ever push)', () => {
    const { doc: local } = buildSingletonDoc('wed-1', { id: 'wed-1', venue: 'New' }, 10);
    const merged = mergeSingletonDoc(null, local, 'wed-1');
    expect(merged.items['wed-1']).toMatchObject({ venue: 'New' });
  });

  it('prefers a hybrid remote\'s fresh raw fields over its stale `items` map', () => {
    // Mid-rollout: an old-build peer already deepMerge'd its own edit onto an
    // already-wrapped doc, leaving `items` stale but present (see readSingletonEntity's
    // hybrid-detection doc comment). Without that detection this device would keep the
    // stale items entity and silently drop the old-build peer's edit.
    const hybridRemote = {
      fmt: 2,
      items: { 'wed-1': { id: 'wed-1', venue: 'StaleFromItems' } },
      rev: { 'wed-1': 999 },
      tombstones: {},
      id: 'wed-1',
      venue: 'FreshFromOldBuildPush',
    };
    const { doc: local } = buildSingletonDoc('wed-1', { id: 'wed-1', venue: 'FreshFromOldBuildPush' }, 10);
    const merged = mergeSingletonDoc(hybridRemote, local, 'wed-1');
    expect(merged.items['wed-1'].venue).toBe('FreshFromOldBuildPush');
  });
});
