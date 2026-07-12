/**
 * Per-collection sync document — pure helpers for "one document per collection"
 * multi-device sync. No React hooks, no store references, no Expo imports
 * (mirrors deep-merge.ts placement so lib/space-sync.ts can import it via @fiance/sdk).
 *
 * Motivation: the live-sync path historically wrote one Starfish objdoc PER entity
 * (one per guest, per vendor, …). Starfish has no batch-push, so a bulk import of N
 * guests fired N POSTs. Collapsing each collection into a single document keyed by an
 * id-map lets a whole collection sync in one request.
 *
 * A collection doc holds an id-keyed MAP of entities (not an array) so two devices
 * adding different entities touch disjoint keys and union cleanly, plus per-entity
 * `rev` (last-write-wins arbiter) and `tombstones` (durable, server-persisted deletes
 * that a peer's stale full-collection push cannot resurrect).
 */

import { deepMerge } from './deep-merge.js';

/** Node-id prefix marking a collection sentinel node (`col:{type}:{weddingNodeId}`). */
export const COLLECTION_NODE_PREFIX = 'col:';

/** Deletes older than this are garbage-collected from the doc on build/merge.
 *  Trade-off: a device offline longer than the TTL could resurrect a stale item —
 *  acceptable at a couple's scale (a wedding's few devices all sync well within it). */
export const TOMBSTONE_TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

/** Current collection-doc format version (defensive; lets future shapes coexist). */
export const COLLECTION_DOC_FMT = 2;

/** An entity as stored inside a collection doc — any record carrying a string `id`. */
export type CollectionEntity = Record<string, unknown> & { id: string };

export interface CollectionDoc {
  /** Doc-format version. */
  fmt: number;
  /** entityId → full entity. */
  items: Record<string, CollectionEntity>;
  /** entityId → ms wall-clock of the last local write that changed the entity (LWW arbiter). */
  rev: Record<string, number>;
  /** entityId → ms wall-clock of deletion; presence = deleted. */
  tombstones: Record<string, number>;
}

/** Mutable per-collection bookkeeping carried between pushes/hydrates. */
export interface CollectionState {
  rev: Record<string, number>;
  tombstones: Record<string, number>;
}

/** Deterministic sentinel node id for a collection, addressable without an index lookup. */
export function collectionNodeId(type: string, weddingNodeId: string): string {
  return `${COLLECTION_NODE_PREFIX}${type}:${weddingNodeId}`;
}

/** True for a `col:{type}:{weddingNodeId}` sentinel node id. */
export function isCollectionNodeId(id: string): boolean {
  return id.startsWith(COLLECTION_NODE_PREFIX);
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Coerce an arbitrary decrypted payload (possibly null / legacy / partial) into a CollectionDoc. */
export function asCollectionDoc(v: unknown): CollectionDoc {
  const o = isRecord(v) ? v : {};
  return {
    fmt: typeof o.fmt === 'number' ? o.fmt : COLLECTION_DOC_FMT,
    items: isRecord(o.items) ? (o.items as Record<string, CollectionEntity>) : {},
    rev: isRecord(o.rev) ? (o.rev as Record<string, number>) : {},
    tombstones: isRecord(o.tombstones) ? (o.tombstones as Record<string, number>) : {},
  };
}

/** Live (non-tombstoned) entities of a doc, as an array — for hydrating a store. */
export function liveItems(doc: CollectionDoc): CollectionEntity[] {
  return Object.entries(doc.items)
    .filter(([id]) => doc.tombstones[id] === undefined)
    .map(([, entity]) => entity);
}

function has(obj: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * Merge two collection docs with per-entity last-writer-wins and durable tombstones.
 * Used as BOTH the normal-push transform and the CAS-retry mutator (Starfish runs the
 * mutator against the freshly-pulled remote on every attempt), so `cur` is the remote
 * (may be null / missing / legacy-shaped) and `local` is this device's intended doc.
 *
 * Per id over the union of both docs:
 *  - `liveRev` = newest `rev` among sides that still hold the item; `tomb` = newest tombstone.
 *  - live wins iff a live copy exists AND `liveRev >= tomb` (add-wins on tie → re-add after a
 *    delete resurrects): keep the higher-`rev` entity (field-merging the older one under it so a
 *    peer's untouched field survives), drop the tombstone.
 *  - else remove wins: keep the tombstone (unless GC'd via `opts.now`).
 */
export function mergeCollectionDoc(
  cur: unknown,
  local: CollectionDoc,
  opts?: { now?: number; ttlMs?: number },
): CollectionDoc {
  const a = asCollectionDoc(cur);
  const b = local;
  const out: CollectionDoc = { fmt: COLLECTION_DOC_FMT, items: {}, rev: {}, tombstones: {} };
  const ttlMs = opts?.ttlMs ?? TOMBSTONE_TTL_MS;
  const gcFloor = opts?.now !== undefined ? opts.now - ttlMs : -Infinity;

  const ids = new Set<string>([
    ...Object.keys(a.items), ...Object.keys(b.items),
    ...Object.keys(a.tombstones), ...Object.keys(b.tombstones),
  ]);

  for (const id of ids) {
    const aHas = has(a.items, id);
    const bHas = has(b.items, id);
    const aRev = aHas ? (a.rev[id] ?? 0) : -Infinity;
    const bRev = bHas ? (b.rev[id] ?? 0) : -Infinity;
    const liveRev = Math.max(aRev, bRev);
    const tomb = Math.max(a.tombstones[id] ?? -Infinity, b.tombstones[id] ?? -Infinity);

    if ((aHas || bHas) && liveRev >= tomb) {
      // live wins — keep the higher-rev entity; field-merge the older under it when both present.
      if (aHas && bHas) {
        const hi = bRev >= aRev ? b.items[id] : a.items[id];
        const lo = bRev >= aRev ? a.items[id] : b.items[id];
        out.items[id] = deepMerge(lo, hi);
      } else {
        out.items[id] = aHas ? a.items[id] : b.items[id];
      }
      out.rev[id] = liveRev === -Infinity ? 0 : liveRev;
    } else if (tomb > -Infinity && tomb >= gcFloor) {
      // remove wins — keep the tombstone unless it is older than the GC floor.
      out.tombstones[id] = tomb;
    }
    // else: tombstone GC'd → id drops out of the doc entirely.
  }

  return out;
}

/**
 * Build the collection doc to push from the current store entities plus carried state.
 *
 * @param entities    current entities for this collection (each with a string `id`)
 * @param prev        rev/tombstones carried from the last hydrate/push of this collection
 * @param changedIds  ids whose serialized content changed since last push → bump their rev to `now`
 * @param now         current wall-clock ms (passed in; Date.now() is unavailable in pure builds/tests)
 *
 * Returns the doc and the next carried state (identical rev/tombstones) to store after a successful push.
 */
export function buildCollectionDoc(
  entities: CollectionEntity[],
  prev: CollectionState,
  changedIds: Set<string>,
  now: number,
  opts?: { ttlMs?: number },
): { doc: CollectionDoc; state: CollectionState } {
  const ttlMs = opts?.ttlMs ?? TOMBSTONE_TTL_MS;
  const items: Record<string, CollectionEntity> = {};
  const rev: Record<string, number> = { ...prev.rev };
  const tombstones: Record<string, number> = { ...prev.tombstones };
  const liveIds = new Set<string>();

  for (const entity of entities) {
    const id = entity.id;
    liveIds.add(id);
    items[id] = entity;
    // New entity (no carried rev) or content changed since last push → stamp a fresh rev.
    if (rev[id] === undefined || changedIds.has(id)) rev[id] = now;
    // A re-added entity supersedes any prior tombstone.
    delete tombstones[id];
  }

  // Any id we previously tracked as live but that is now absent was deleted → tombstone it.
  for (const id of Object.keys(prev.rev)) {
    if (!liveIds.has(id)) {
      tombstones[id] = now;
      delete rev[id];
    }
  }

  // GC tombstones older than the TTL, and drop any stray rev for a tombstoned id.
  const floor = now - ttlMs;
  for (const id of Object.keys(tombstones)) {
    if (tombstones[id] < floor) { delete tombstones[id]; continue; }
    delete rev[id];
  }

  return {
    doc: { fmt: COLLECTION_DOC_FMT, items, rev, tombstones },
    state: { rev, tombstones },
  };
}

/**
 * Build a 1-item CollectionDoc for a singleton node (Fiancé's `wedding` root), so it can
 * be pushed through the same `mergeCollectionDoc` CAS mutator as an actual collection —
 * giving it per-entity rev LWW instead of a whole-object clobber. Never tombstones: a
 * singleton going missing means "not built this round", not "deleted".
 *
 * Keyed explicitly by the passed `id` (the node id), NOT `entity.id` — unlike a real
 * collection entity, the wedding domain object's own `id` is a local row number unrelated
 * to sync, so `entity` here is a plain record, not a `CollectionEntity`.
 *
 * @param prevRev  rev carried from the last hydrate/push of this node (undefined if never tracked)
 * @param changed  whether the entity's serialized content differs from the last push/hydrate baseline
 */
export function buildSingletonDoc(
  id: string,
  entity: Record<string, unknown>,
  prevRev: number | undefined,
  changed: boolean,
  now: number,
): { doc: CollectionDoc; rev: number } {
  const rev = prevRev === undefined || changed ? now : prevRev;
  return {
    doc: {
      fmt: COLLECTION_DOC_FMT,
      items: { [id]: entity as CollectionEntity },
      rev: { [id]: rev },
      tombstones: {},
    },
    rev,
  };
}

/**
 * Read a singleton entity back out of a pulled doc. Tolerates a legacy raw entity (the
 * pre-migration server doc, before the wedding root was wrapped as a 1-item CollectionDoc)
 * as well as the new wrapped shape, so old-server-state devices adopt cleanly (rev 0, so
 * the first local edit bumps it past any peer's real rev). Looks up by whichever key the
 * item is actually stored under (falls back to the doc's one entry) rather than by
 * `entity.id`, matching `buildSingletonDoc`'s keying.
 */
export function readSingletonEntity(
  cur: unknown,
  id: string,
): { entity: Record<string, unknown> | null; rev: number } {
  if (!isRecord(cur)) return { entity: null, rev: 0 };
  if (!isRecord(cur.items)) {
    // Legacy raw entity (no `items` map) — adopt as-is.
    return { entity: cur, rev: 0 };
  }
  const doc = asCollectionDoc(cur);
  const entry = has(doc.items, id)
    ? ([id, doc.items[id]] as const)
    : Object.entries(doc.items)[0];
  if (!entry) return { entity: null, rev: 0 };
  const [key, entity] = entry;
  return { entity, rev: doc.rev[key] ?? 0 };
}

/**
 * CAS-retry mutator for a singleton node (the wedding root): merges the local singleton
 * doc into whatever the pull returned, tolerating BOTH a legacy raw entity (pre-migration
 * remote, no `items` wrapper) and the new wrapped 1-item doc — via `readSingletonEntity`,
 * mirroring its read-side tolerance. Without this, a rollout-window push (this device on
 * the new build, the remote's last writer still on the old one) would see the legacy raw
 * `cur` coerced to an *empty* doc by `asCollectionDoc` (no `items` key) and silently drop
 * the remote's untouched fields instead of field-merging them — a regression against the
 * plain `deepMerge` this replaces, which merged two raw objects fine.
 */
export function mergeSingletonDoc(
  cur: unknown,
  local: CollectionDoc,
  id: string,
  opts?: { now?: number; ttlMs?: number },
): CollectionDoc {
  const { entity, rev } = readSingletonEntity(cur, id);
  const curDoc: CollectionDoc = entity
    ? { fmt: COLLECTION_DOC_FMT, items: { [id]: entity as CollectionEntity }, rev: { [id]: rev }, tombstones: {} }
    : { fmt: COLLECTION_DOC_FMT, items: {}, rev: {}, tombstones: {} };
  return mergeCollectionDoc(curDoc, local, opts);
}
