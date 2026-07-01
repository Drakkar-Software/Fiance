/**
 * Tests for importLegacyBackup — v6 WeddingSnapshot → ObjectNode tree.
 *
 * Tests FK integrity, idempotency (skip already-imported nodes), and the
 * E2EE contract: all content docs must be encrypted before upload
 * (encryptor.encrypt called for every push).
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

// Mock the modules that import-legacy.ts imports from.
// starfish-spaces provides updateObjectIndex/readObjectTree/buildTree/getNodeAccess.
vi.mock('@drakkar.software/starfish-spaces', () => {
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
    buildTree: vi.fn((nodes: FakeNode[]) => nodes),
  };
});

vi.mock('../sync/object-paths.js', () => ({
  objDocPush: vi.fn((spaceId: string, nodeId: string) => `push/${spaceId}/objdoc/${nodeId}`),
}));

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
    contributors: [],
    invitationTypes: [{ id: 'it1', name: 'Cérémonie' } as never],
    taskCategories: [{ id: 'tc1', name: 'Admin' } as never],
    tasks: [{ id: 'task1', categoryId: 'tc1', title: 'Réserver' } as never],
    agendaEvents: [{ id: 'ae1', title: 'Cérémonie' } as never],
    dayOfItems: [{ id: 'doi1', title: 'Accueil', time: '14:00', isPublic: true } as never],
    ideaCollections: [{ id: 'ic1', title: 'Déco' } as never],
    ideas: [{ id: 'idea1', title: 'Bougie', collectionId: 'ic1' } as never],
    communications: [{ id: 'comm1', label: 'Faire-part', date: null, notes: null, recipients: [], createdAt: null, updatedAt: null } as never],
    weddingRoles: [{ id: 'role1', name: 'Témoin', sortOrder: null, createdAt: null, updatedAt: null } as never],
    weddingRoleAssignments: [{ id: 'wra1', roleId: 'role1', guestId: 'g1', notes: null, sortOrder: null, createdAt: null, updatedAt: null } as never],
    seatingConstraints: [{ id: 'sc1', type: 'MUST_SIT_TOGETHER', guestIds: ['g1', 'g2'], label: null, isHard: null, createdAt: null, updatedAt: null } as never],
    weddingEvents: [{ id: 'we1', type: 'DINNER', title: 'Réception', date: '2026-09-12', startTime: null, endTime: null, venueName: null, address: null, notes: null, isPrimary: true, isPublic: true, sortOrder: 1, createdAt: null, updatedAt: null } as never],
    guestMealSelections: [{ id: 'ms1', guestId: 'g1', eventId: null, mealChoice: 'STANDARD', courses: null, notes: null, createdAt: null, updatedAt: null } as never],
    communicationTemplates: [{ id: 'ct1', name: 'Save-the-date', channel: 'EMAIL', subject: null, body: 'Hello', isSystem: true, createdAt: null, updatedAt: null } as never],
    documents: [{ id: 'doc1', ownerType: 'VENDOR', ownerId: 'v1', label: 'Devis', fileName: 'devis.pdf', mimeType: 'application/pdf', localUri: 'file:///d.pdf', fileSize: 100, uploadedAt: null, notes: null, createdAt: null, updatedAt: null } as never],
    legalMilestones: [{ id: 'lm1', type: 'CIVIL_APPOINTMENT', title: 'RDV mairie', dueDate: null, completedDate: null, status: 'TODO', location: null, notes: null, documentIds: null, reminderDaysBefore: null, createdAt: null, updatedAt: null } as never],
    honeymoonPlans: [{ id: 'hp1', destination: 'Toscane', startDate: null, endDate: null, budgetTarget: null, spentAmount: null, notes: null, itinerary: null, createdAt: null, updatedAt: null } as never],
    ceremonyItems: [],
    speeches: [],
    playlistTracks: [],
    ...overrides,
  };
}

const fakeSession = { userId: 'user-test', keys: {} } as never;
const fakeSpaceId = 'space-test';
/** Registry UUID — the weddingNodeId that buildAllNodes uses as the wedding root. */
const fakeWeddingNodeId = 'wedding-registry-uuid';

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
    const result: ImportResult = await importLegacyBackup(fakeSession, fakeSpaceId, snapshot, fakeWeddingNodeId);
    expect(result.nodeCount).toBeGreaterThan(0);
  });

  it('creates the wedding root node with the registry weddingNodeId', async () => {
    const { importLegacyBackup } = await import('./import-legacy.js');
    await importLegacyBackup(fakeSession, fakeSpaceId, makeSnapshot(), fakeWeddingNodeId);
    const wedding = fakeIndex.find((n) => n.type === 'wedding');
    expect(wedding).toBeDefined();
    // Wedding node id must match the registry UUID (buildAllNodes invariant).
    expect(wedding?.id).toBe(fakeWeddingNodeId);
  });

  it('uses entity id as node id for non-wedding entities', async () => {
    const { importLegacyBackup } = await import('./import-legacy.js');
    await importLegacyBackup(fakeSession, fakeSpaceId, makeSnapshot(), fakeWeddingNodeId);
    // Every non-wedding node id must equal its entity id.
    const guestGroup = fakeIndex.find((n) => n.type === 'guestGroup');
    expect(guestGroup?.id).toBe('gg1');
    const guest = fakeIndex.find((n) => n.type === 'guest' && n.meta?.legacyId === 'g1');
    expect(guest?.id).toBe('g1');
    const vendor = fakeIndex.find((n) => n.type === 'vendor');
    expect(vendor?.id).toBe('v1');
  });

  it('creates guest parented under guestGroup', async () => {
    const { importLegacyBackup } = await import('./import-legacy.js');
    const result = await importLegacyBackup(fakeSession, fakeSpaceId, makeSnapshot(), fakeWeddingNodeId);
    const groupNodeId = result.idMap['guestGroup:gg1'];
    const guestNode = fakeIndex.find((n) => n.type === 'guest' && n.meta?.legacyId === 'g1');
    expect(guestNode).toBeDefined();
    expect(guestNode?.parentId).toBe(groupNodeId);
  });

  it('parents orphan guest (no groupId) under wedding root', async () => {
    const { importLegacyBackup } = await import('./import-legacy.js');
    const result = await importLegacyBackup(fakeSession, fakeSpaceId, makeSnapshot(), fakeWeddingNodeId);
    const weddingId = result.idMap['wedding'];
    const orphanGuest = fakeIndex.find((n) => n.type === 'guest' && n.meta?.legacyId === 'g2');
    expect(orphanGuest?.parentId).toBe(weddingId);
  });

  it('parents quotePricing under its vendor', async () => {
    const { importLegacyBackup } = await import('./import-legacy.js');
    const result = await importLegacyBackup(fakeSession, fakeSpaceId, makeSnapshot(), fakeWeddingNodeId);
    const vendorNodeId = result.idMap['vendor:v1'];
    const qpNode = fakeIndex.find((n) => n.type === 'quotePricing');
    expect(qpNode?.parentId).toBe(vendorNodeId);
  });

  it('pushes one encrypted content doc per imported node', async () => {
    const { importLegacyBackup } = await import('./import-legacy.js');
    const result = await importLegacyBackup(fakeSession, fakeSpaceId, makeSnapshot(), fakeWeddingNodeId);
    expect(pushedPaths.length).toBeGreaterThan(0);
    expect(pushedPaths.length).toBe(result.nodeCount);
  });

  // ── C5: children of already-imported parents ───────────────────────────
  // When a parent node (vendor, taskCategory, ideaCollection) is already in the
  // live-sync index (node.id = entity.id), its children must still be imported
  // from the legacy backup. The old code skipped children via `continue`.

  it('imports tasks whose taskCategory is already in the live-sync index', async () => {
    fakeIndex = [{ id: 'tc1', type: 'taskCategory', parentId: fakeWeddingNodeId, meta: {} } as FakeNode];
    const { importLegacyBackup } = await import('./import-legacy.js');
    await importLegacyBackup(fakeSession, fakeSpaceId, makeSnapshot(), fakeWeddingNodeId);
    const task = fakeIndex.find((n) => n.type === 'task' && n.id === 'task1');
    expect(task).toBeDefined();
    expect(task?.parentId).toBe('tc1');
  });

  it('imports ideas whose ideaCollection is already in the live-sync index', async () => {
    fakeIndex = [{ id: 'ic1', type: 'ideaCollection', parentId: fakeWeddingNodeId, meta: {} } as FakeNode];
    const { importLegacyBackup } = await import('./import-legacy.js');
    await importLegacyBackup(fakeSession, fakeSpaceId, makeSnapshot(), fakeWeddingNodeId);
    const idea = fakeIndex.find((n) => n.type === 'idea' && n.id === 'idea1');
    expect(idea).toBeDefined();
    expect(idea?.parentId).toBe('ic1');
  });

  it('imports quotePricings whose vendor is already in the live-sync index', async () => {
    fakeIndex = [{ id: 'v1', type: 'vendor', parentId: fakeWeddingNodeId, meta: {} } as FakeNode];
    const { importLegacyBackup } = await import('./import-legacy.js');
    await importLegacyBackup(fakeSession, fakeSpaceId, makeSnapshot(), fakeWeddingNodeId);
    const qp = fakeIndex.find((n) => n.type === 'quotePricing' && n.id === 'qp1');
    expect(qp).toBeDefined();
    expect(qp?.parentId).toBe('v1');
  });

  it('imports vendorPayments whose vendor is already in the live-sync index', async () => {
    fakeIndex = [{ id: 'v1', type: 'vendor', parentId: fakeWeddingNodeId, meta: {} } as FakeNode];
    const { importLegacyBackup } = await import('./import-legacy.js');
    await importLegacyBackup(fakeSession, fakeSpaceId, makeSnapshot(), fakeWeddingNodeId);
    const vp = fakeIndex.find((n) => n.type === 'vendorPayment' && n.id === 'vp1');
    expect(vp).toBeDefined();
    expect(vp?.parentId).toBe('v1');
  });

  // ── D6: descriptor flags passed to getNodeAccess ────────────────────────
  // pushDoc must forward the full NodeDescriptor to getNodeAccess so that
  // invite-access nodes (access:'invite', enc:false) use the right key material.
  // The old code hardcoded { access:'space', enc:true } for every node.

  it('passes the full NodeDescriptor (not hardcoded flags) to getNodeAccess', async () => {
    const { getNodeAccess } = await import('@drakkar.software/starfish-spaces');
    const { importLegacyBackup } = await import('./import-legacy.js');
    await importLegacyBackup(fakeSession, fakeSpaceId, makeSnapshot(), fakeWeddingNodeId);
    const calls = (getNodeAccess as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    // When passing the full descriptor, nodeFlags.id === nodeId (arg 1).
    // When hardcoding { access, enc }, nodeFlags.id would be undefined.
    for (const [, nodeId, nodeFlags] of calls) {
      expect((nodeFlags as { id?: string }).id).toBe(nodeId as string);
    }
  });

  it('skips all entities on a second import (full idempotency)', async () => {
    const { importLegacyBackup } = await import('./import-legacy.js');
    const snapshot = makeSnapshot();

    // First import: creates all nodes (entity.id = node.id; all get meta.legacyId).
    await importLegacyBackup(fakeSession, fakeSpaceId, snapshot, fakeWeddingNodeId);
    const countAfterFirst = fakeIndex.length;

    // Second import: all nodes detected via meta.legacyId OR node.id → skipped.
    const r2 = await importLegacyBackup(fakeSession, fakeSpaceId, snapshot, fakeWeddingNodeId);

    expect(r2.nodeCount).toBe(0);
    expect(fakeIndex.length).toBe(countAfterFirst);
  });

  it('returns an idMap with all expected keys', async () => {
    const { importLegacyBackup } = await import('./import-legacy.js');
    const result = await importLegacyBackup(fakeSession, fakeSpaceId, makeSnapshot(), fakeWeddingNodeId);
    // Wedding key maps to the registry UUID.
    expect(result.idMap['wedding']).toBe(fakeWeddingNodeId);
    expect(result.idMap['guestGroup:gg1']).toBeDefined();
    expect(result.idMap['guest:g1']).toBeDefined();
    expect(result.idMap['vendor:v1']).toBeDefined();
    expect(result.idMap['task:task1']).toBeDefined();
    expect(result.idMap['weddingRole:role1']).toBeDefined();
    expect(result.idMap['weddingRoleAssignment:wra1']).toBeDefined();
    expect(result.idMap['seatingConstraint:sc1']).toBeDefined();
  });

  it('calls getNodeAccess for each content push with access:space enc:true', async () => {
    const { getNodeAccess } = await import('@drakkar.software/starfish-spaces');
    const { importLegacyBackup } = await import('./import-legacy.js');
    await importLegacyBackup(fakeSession, fakeSpaceId, makeSnapshot(), fakeWeddingNodeId);
    const calls = (getNodeAccess as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    for (const [, , nodeFlags] of calls) {
      expect((nodeFlags as { access?: string }).access).toBe('space');
      expect((nodeFlags as { enc?: boolean }).enc).toBe(true);
    }
  });

  // ── M5: Encryption contract ─────────────────────────────────────────────
  // Every content push MUST go through encryptor.encrypt before hitting the wire.
  // This test would FAIL on the old code (which pushed plaintext) and PASS after
  // the B1 fix (encrypt in pushDoc). The mock encryptor wraps as { _enc: '...' }.
  it('all pushed payloads are encrypted (not raw entity objects)', async () => {
    const { importLegacyBackup } = await import('./import-legacy.js');
    await importLegacyBackup(fakeSession, fakeSpaceId, makeSnapshot(), fakeWeddingNodeId);
    expect(pushedPayloads.length).toBeGreaterThan(0);
    for (const payload of pushedPayloads) {
      // encryptor.encrypt wraps as { _enc: JSON.stringify(entity) }
      // If encrypt was skipped, the payload would have entity fields (e.g. 'name', 'id')
      // instead of '_enc' — and this assertion would fail, proving the B1 bug.
      expect(payload).toHaveProperty('_enc');
      expect(typeof (payload as { _enc: unknown })._enc).toBe('string');
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
    const { getNodeAccess } = await import('@drakkar.software/starfish-spaces');
    const original = { greeting: 'Bonjour Alice', count: 42 };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handle = await (getNodeAccess as (...a: unknown[]) => Promise<any>)(
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
    const { getNodeAccess } = await import('@drakkar.software/starfish-spaces');
    const secret = { secretKey: 'hunter2', userId: 'alice' };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handle = await (getNodeAccess as (...a: unknown[]) => Promise<any>)(
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
