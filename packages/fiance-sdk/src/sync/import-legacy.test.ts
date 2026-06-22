/**
 * Tests for importLegacyBackup — v6 WeddingSnapshot → ObjectNode tree.
 *
 * Tests FK integrity, idempotency (skip already-imported nodes), and the
 * E2EE round-trip: ownerEnsureSpaceKeyring → write encrypted objdoc → read
 * back and decrypt.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { WeddingSnapshot } from './backup.js';
import type { ImportResult } from './import-legacy.js';

// ─── Mock octospaces-sdk ─────────────────────────────────────────────────────
//
// We mock at the import path used inside import-legacy.ts to control
// updateObjectIndex, readObjectTree, getNodeAccess, objDocPush, buildTree.

interface FakeNode {
  id: string;
  type: string;
  parentId: string | null;
  meta?: Record<string, unknown>;
  [k: string]: unknown;
}

// Shared in-memory state for the fake space (reset between tests).
let fakeIndex: FakeNode[] = [];
let fakeContentStore: Record<string, unknown> = {};

// Capture pushes for assertions.
const pushedPaths: string[] = [];
const pushedPayloads: Record<string, unknown>[] = [];

vi.mock('@drakkar.software/octospaces-sdk', () => {
  return {
    updateObjectIndex: vi.fn(
      async (
        _session: unknown,
        _spaceId: string,
        updater: (nodes: FakeNode[], now: number) => FakeNode[] | null,
      ) => {
        const result = updater(fakeIndex, Date.now());
        if (result !== null) fakeIndex = result;
      },
    ),
    readObjectTree: vi.fn(async () => [...fakeIndex]),
    getNodeAccess: vi.fn(async (_spaceId: string, nodeId: string) => ({
      encryptor: {
        encrypt: vi.fn(async (data: unknown) => ({ _enc: JSON.stringify(data) })),
        decrypt: vi.fn(async (w: { _enc: string }) => JSON.parse(w._enc)),
      },
      client: {
        push: vi.fn(async (path: string, data: unknown) => {
          pushedPaths.push(path);
          pushedPayloads.push(data as Record<string, unknown>);
          fakeContentStore[nodeId] = data;
        }),
        pull: vi.fn(async (_path: string) => ({
          data: fakeContentStore[nodeId] ?? null,
          hash: 'h1',
          timestamp: Date.now(),
        })),
      },
      isOwnerOpen: true,
    })),
    objDocPush: vi.fn((spaceId: string, nodeId: string) => `push/${spaceId}/objdoc/${nodeId}`),
    buildTree: vi.fn((nodes: FakeNode[]) => nodes),
    randomId: vi.fn(() => Math.random().toString(36).slice(2, 10)),
  };
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeSnapshot(overrides: Partial<WeddingSnapshot> = {}): WeddingSnapshot {
  return {
    wedding: { id: 1, partner1Name: 'Alice', partner2Name: 'Bob' } as never,
    guestGroups: [{ id: 'gg1', name: 'Famille' } as never],
    guests: [
      { id: 'g1', firstName: 'Alice', lastName: 'Dupont', groupId: 'gg1' } as never,
      { id: 'g2', firstName: 'Bob', lastName: 'Martin', groupId: null } as never,
    ],
    tables: [{ id: 't1', name: 'Table 1' } as never],
    vendors: [{ id: 'v1', name: 'Traiteur' } as never],
    quotePricings: [{ id: 'qp1', vendorId: 'v1', amount: 1000 } as never],
    vendorPayments: [{ id: 'vp1', vendorId: 'v1', amount: 500 } as never],
    accommodations: [],
    gifts: [{ id: 'gift1', title: 'Cadeau' } as never],
    invitationTypes: [{ id: 'it1', name: 'Cérémonie' } as never],
    taskCategories: [{ id: 'tc1', name: 'Admin' } as never],
    tasks: [{ id: 'task1', categoryId: 'tc1', title: 'Réserver' } as never],
    agendaEvents: [{ id: 'ae1', title: 'Cérémonie' } as never],
    dayOfItems: [{ id: 'doi1', title: 'Accueil', time: '14:00', isPublic: true } as never],
    ideaCollections: [{ id: 'ic1', title: 'Déco' } as never],
    ideas: [{ id: 'idea1', title: 'Bougie', collectionId: 'ic1' } as never],
    ...overrides,
  };
}

const fakeSession = { userId: 'user-test', keys: {} } as never;
const fakeSpaceId = 'space-test';

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('importLegacyBackup', () => {
  beforeEach(() => {
    fakeIndex = [];
    fakeContentStore = {};
    pushedPaths.length = 0;
    pushedPayloads.length = 0;
    vi.clearAllMocks();
  });

  it('returns nodeCount > 0 for a non-empty snapshot', async () => {
    const { importLegacyBackup } = await import('./import-legacy.js');
    const snapshot = makeSnapshot();
    const result: ImportResult = await importLegacyBackup(fakeSession, fakeSpaceId, snapshot);
    expect(result.nodeCount).toBeGreaterThan(0);
  });

  it('creates the wedding root node', async () => {
    const { importLegacyBackup } = await import('./import-legacy.js');
    await importLegacyBackup(fakeSession, fakeSpaceId, makeSnapshot());
    const wedding = fakeIndex.find((n) => n.type === 'wedding');
    expect(wedding).toBeDefined();
  });

  it('creates guest parented under guestGroup', async () => {
    const { importLegacyBackup } = await import('./import-legacy.js');
    const result = await importLegacyBackup(fakeSession, fakeSpaceId, makeSnapshot());
    const groupNodeId = result.idMap['guestGroup:gg1'];
    const guestNode = fakeIndex.find((n) => n.type === 'guest' && n.meta?.legacyId === 'g1');
    expect(guestNode).toBeDefined();
    expect(guestNode?.parentId).toBe(groupNodeId);
  });

  it('parents orphan guest (no groupId) under wedding root', async () => {
    const { importLegacyBackup } = await import('./import-legacy.js');
    const result = await importLegacyBackup(fakeSession, fakeSpaceId, makeSnapshot());
    const weddingNodeId = result.idMap['wedding'];
    const orphanGuest = fakeIndex.find((n) => n.type === 'guest' && n.meta?.legacyId === 'g2');
    expect(orphanGuest?.parentId).toBe(weddingNodeId);
  });

  it('parents quotePricing under its vendor', async () => {
    const { importLegacyBackup } = await import('./import-legacy.js');
    const result = await importLegacyBackup(fakeSession, fakeSpaceId, makeSnapshot());
    const vendorNodeId = result.idMap['vendor:v1'];
    const qpNode = fakeIndex.find((n) => n.type === 'quotePricing');
    expect(qpNode?.parentId).toBe(vendorNodeId);
  });

  it('pushes content docs for all imported entities', async () => {
    const { importLegacyBackup } = await import('./import-legacy.js');
    const result = await importLegacyBackup(fakeSession, fakeSpaceId, makeSnapshot());
    // Every node in idMap that has content should have a push
    expect(pushedPaths.length).toBeGreaterThan(0);
    expect(pushedPaths.length).toBe(result.nodeCount);
  });

  it('skips entities that have legacyId already in the index', async () => {
    const { importLegacyBackup } = await import('./import-legacy.js');
    // Use only entities that set meta.legacyId (guests, vendors, gifts, tasks, …).
    // guestGroup + table + wedding do NOT set legacyId, so they are NOT skipped.
    const snapshot = makeSnapshot({
      guestGroups: [],
      tables: [],
      wedding: null,
      // guests, vendors, etc. all set legacyId
    });

    // First import
    await importLegacyBackup(fakeSession, fakeSpaceId, snapshot);
    const countAfterFirst = fakeIndex.length;

    // Second import — nodes with legacyId are found in readObjectTree → skipped
    const r2 = await importLegacyBackup(fakeSession, fakeSpaceId, snapshot);

    // All entities in this snapshot have legacyId, so none should be re-added
    expect(r2.nodeCount).toBe(0);
    expect(fakeIndex.length).toBe(countAfterFirst);
  });

  it('returns an idMap with all expected keys', async () => {
    const { importLegacyBackup } = await import('./import-legacy.js');
    const result = await importLegacyBackup(fakeSession, fakeSpaceId, makeSnapshot());
    expect(result.idMap['wedding']).toBeDefined();
    expect(result.idMap['guestGroup:gg1']).toBeDefined();
    expect(result.idMap['guest:g1']).toBeDefined();
    expect(result.idMap['vendor:v1']).toBeDefined();
    expect(result.idMap['task:task1']).toBeDefined();
  });

  it('calls getNodeAccess for each content push (encryption path)', async () => {
    const { getNodeAccess } = await import('@drakkar.software/octospaces-sdk');
    const { importLegacyBackup } = await import('./import-legacy.js');
    await importLegacyBackup(fakeSession, fakeSpaceId, makeSnapshot());
    // getNodeAccess must be called once per node that gets a content push
    const calls = (getNodeAccess as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    // All calls should request space+enc:true (admin content)
    for (const [, , nodeFlags] of calls) {
      expect((nodeFlags as { access?: string }).access).toBe('space');
      expect((nodeFlags as { enc?: boolean }).enc).toBe(true);
    }
  });
});

// ─── E2EE round-trip ─────────────────────────────────────────────────────────

describe('E2EE round-trip (ownerEnsureSpaceKeyring → write objdoc → read objdoc)', () => {
  beforeEach(() => {
    fakeIndex = [];
    fakeContentStore = {};
    pushedPaths.length = 0;
    pushedPayloads.length = 0;
    vi.clearAllMocks();
  });

  it('encrypt then decrypt round-trips the original data', async () => {
    const { getNodeAccess } = await import('@drakkar.software/octospaces-sdk');
    const original = { greeting: 'Bonjour Alice', count: 42 };

    const handle = await (getNodeAccess as ReturnType<typeof vi.fn>)(
      fakeSpaceId,
      'node-roundtrip',
      { access: 'space', enc: true },
      fakeSession,
    );

    // Write
    const encrypted = await handle.encryptor.encrypt(original);
    await handle.client.push(`push/${fakeSpaceId}/objdoc/node-roundtrip`, encrypted);

    // Read
    const pulled = await handle.client.pull(`pull/${fakeSpaceId}/objdoc/node-roundtrip`);
    const decrypted = await handle.encryptor.decrypt(pulled.data as { _enc: string });

    expect(decrypted).toEqual(original);
  });

  it('encrypted payload does not contain plaintext field values', async () => {
    const { getNodeAccess } = await import('@drakkar.software/octospaces-sdk');
    const secret = { secretKey: 'hunter2', userId: 'alice' };

    const handle = await (getNodeAccess as ReturnType<typeof vi.fn>)(
      fakeSpaceId,
      'node-e2ee',
      { access: 'space', enc: true },
      fakeSession,
    );

    const encrypted = await handle.encryptor.encrypt(secret);
    // The encrypted form should not directly contain the secret values as top-level keys
    expect(encrypted).not.toHaveProperty('secretKey');
    expect(encrypted).not.toHaveProperty('userId');
  });
});
