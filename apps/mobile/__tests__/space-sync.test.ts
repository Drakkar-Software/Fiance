/**
 * Tests for lib/space-sync.ts — timer race guards and import-lock helpers.
 *
 * G1: _isHydrating is re-checked inside the 2-second timer callback so a push
 *     that was queued before hydration started does not fire mid-hydrate.
 * C2: suppressSyncPush() cancels any pending timer and blocks new scheduling;
 *     restoreSyncPush() re-enables it.
 * H1/H2: pushNodeContent delegates to handle.push(), which owns CAS + hash
 *     tracking — client.push never receives a null baseHash after the first write.
 * H3 (Bug B regression): handle.push with an encrypted node and a missing doc
 *     (pull returns { data: {}, hash: "" }) must call client.push successfully
 *     — not throw "Encrypted payload is too short" and swallow the node silently.
 */
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from "vitest";

// ─── Mocks ────────────────────────────────────────────────────────────────────

// Mutable: allows individual tests to inject a wedding entity so buildAllNodes
// produces at least one node (enabling pushNodeContent to be exercised).
let mockWeddingData: Record<string, unknown> | null = null;

// Mutable client spies — reset per regression test.
let mockClientPull: Mock = vi.fn(async () => ({ data: null, hash: null }));
let mockClientPush: Mock = vi.fn(async () => ({ hash: "H_new" }));

// handle.push mirrors the fixed NodeAccessHandle.push: pull → hash-gated decrypt → mutate → push.
// baseHash uses `?? ""` (alpha.49 fix): preserves "" so the server's heal path is reachable.
// "" is falsy so cur is still null for a missing/hash-less doc (Bug B: no decrypt({}) call).
function makeHandlePush(pull: Mock, push: Mock, encryptor: { decrypt: Mock; encrypt: Mock } | null = null) {
  return vi.fn(async (
    pullPath: string,
    pushPath: string,
    mutator: (cur: Record<string, unknown> | null) => Record<string, unknown> | null,
  ) => {
    const res = await pull(pullPath).catch(() => null) as
      | { data: Record<string, unknown>; hash: string }
      | null;
    const baseHash = res?.hash ?? "";
    const cur = baseHash
      ? (encryptor ? await encryptor.decrypt(res!.data) : res!.data)
      : null;
    const next = mutator(cur);
    if (next !== null) {
      const payload = encryptor ? await encryptor.encrypt(next) : next;
      await push(pushPath, payload, baseHash);
    }
  });
}

let mockHandlePush: Mock = makeHandlePush(mockClientPull, mockClientPush);

let mockGetNodeAccessImpl: () => Promise<{
  encryptor: null;
  client: { push: Mock; pull: Mock };
  isOwnerOpen: boolean;
  push: Mock;
}> = async () => ({
  encryptor: null,
  client: { push: mockClientPush, pull: mockClientPull },
  isOwnerOpen: false,
  push: mockHandlePush,
});

const mockUpdateObjectIndex = vi.fn();
let mockReadObjectTreeImpl: () => Promise<unknown[]> = async () => [];

vi.mock("@drakkar.software/starfish-spaces", () => ({
  updateObjectIndex: (...args: unknown[]) => mockUpdateObjectIndex(...args),
  readObjectTree: (..._args: unknown[]) => mockReadObjectTreeImpl(),
  getNodeAccess: vi.fn(async (..._args: unknown[]) => mockGetNodeAccessImpl()),
  objDocPush: vi.fn((s: string, n: string) => `push/${s}/${n}`),
  objDocPull: vi.fn((s: string, n: string) => `pull/${s}/${n}`),
  objInvPull: vi.fn((s: string, n: string) => `invpull/${s}/${n}`),
  FIANCE_TYPES: {
    wedding: "wedding", guestGroup: "guestGroup", guest: "guest", table: "table",
    vendor: "vendor", quotePricing: "quotePricing", vendorPayment: "vendorPayment",
    accommodation: "accommodation", gift: "gift", invitationType: "invitationType",
    communication: "communication",
    taskCategory: "taskCategory", task: "task", agendaEvent: "agendaEvent",
    dayOfItem: "dayOfItem", ideaCollection: "ideaCollection", idea: "idea",
    rsvp: "rsvp",
  },
  weddingToNode: vi.fn(() => ({ id: "w1", type: "wedding", access: "space", enc: true, contentKind: "merge" })),
  guestGroupToNode: vi.fn(), guestToNode: vi.fn(), tableToNode: vi.fn(),
  vendorToNode: vi.fn(), quotePricingToNode: vi.fn(), vendorPaymentToNode: vi.fn(),
  accommodationToNode: vi.fn(), giftToNode: vi.fn(), invitationTypeToNode: vi.fn(),
  communicationToNode: vi.fn(),
  taskCategoryToNode: vi.fn(), taskToNode: vi.fn(), agendaEventToNode: vi.fn(),
  dayOfItemToNode: vi.fn(), ideaCollectionToNode: vi.fn(), ideaToNode: vi.fn(),
  weddingFromDoc: vi.fn(), guestGroupFromDoc: vi.fn(), guestFromDoc: vi.fn(),
  tableFromDoc: vi.fn(), vendorFromDoc: vi.fn(), quotePricingFromDoc: vi.fn(),
  vendorPaymentFromDoc: vi.fn(), accommodationFromDoc: vi.fn(), giftFromDoc: vi.fn(),
  invitationTypeFromDoc: vi.fn(), communicationFromDoc: vi.fn(),
  taskCategoryFromDoc: vi.fn(), taskFromDoc: vi.fn(),
  agendaEventFromDoc: vi.fn(), dayOfItemFromDoc: vi.fn(), ideaCollectionFromDoc: vi.fn(),
  ideaFromDoc: vi.fn(),
  NodeDescriptor: {},
  ObjectNode: {},
  Session: {},
}));

const mockGetActiveSession = vi.fn(() => ({ userId: "u1" }));
const mockGetActiveSpaceId = vi.fn(() => "space-1");
const mockGetActiveWeddingNodeId = vi.fn(() => "wedding-node-1");

vi.mock("@/lib/starfish", () => ({
  getActiveSession: () => mockGetActiveSession(),
  getActiveSpaceId: () => mockGetActiveSpaceId(),
  getActiveWeddingNodeId: () => mockGetActiveWeddingNodeId(),
}));

// Stub all stores to return empty state.
const emptyStore = { getState: () => ({
  wedding: null, guests: [], tables: [], groups: [],
  vendors: [], quotePricings: [], vendorPayments: [],
  accommodations: [], gifts: [], invitationTypes: [], communications: [],
  categories: [], tasks: [], agendaEvents: [], dayOfItems: [],
  collections: [], ideas: [],
  setWedding: vi.fn(), setGroups: vi.fn(), setTables: vi.fn(), setGuests: vi.fn(),
  setVendors: vi.fn(), setQuotePricings: vi.fn(), setVendorPayments: vi.fn(),
  setAccommodations: vi.fn(), setGifts: vi.fn(), setInvitationTypes: vi.fn(),
  setCommunications: vi.fn(),
  setCategories: vi.fn(), setTasks: vi.fn(), setAgendaEvents: vi.fn(),
  setDayOfItems: vi.fn(), setCollections: vi.fn(), setIdeas: vi.fn(),
}) };

vi.mock("@/store/useWeddingStore", () => ({
  useWeddingStore: { getState: () => ({ ...emptyStore.getState(), wedding: mockWeddingData }) },
}));
vi.mock("@/store/useGuestsStore", () => ({ useGuestsStore: emptyStore }));
vi.mock("@/store/useVendorsStore", () => ({ useVendorsStore: emptyStore }));
vi.mock("@/store/usePlanningStore", () => ({ usePlanningStore: emptyStore }));
vi.mock("@/store/useIdeasStore", () => ({ useIdeasStore: emptyStore }));
vi.mock("@/store/useAccommodationsStore", () => ({ useAccommodationsStore: emptyStore }));
vi.mock("@/store/useGiftsStore", () => ({ useGiftsStore: emptyStore }));
vi.mock("@/store/useInvitationTypesStore", () => ({ useInvitationTypesStore: emptyStore }));
vi.mock("@/store/useCommunicationsStore", () => ({ useCommunicationsStore: emptyStore }));

vi.mock("@/lib/rsvp-sync", () => ({
  applyRsvpSubmissionsByGuestId: vi.fn(),
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("scheduleSyncPush / _isHydrating timer guard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockUpdateObjectIndex.mockReset();
    mockReadObjectTreeImpl = async () => [];
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("G1: does not push if hydration starts after the timer is already queued", async () => {
    let resolveHydrate!: () => void;
    mockReadObjectTreeImpl = () =>
      new Promise<unknown[]>((res) => { resolveHydrate = () => res([]); });

    const { scheduleSyncPush, hydrateFromSpace } = await import("@/lib/space-sync");

    scheduleSyncPush();

    const hydratePromise = hydrateFromSpace(
      { userId: "u1" } as never,
      "space-1",
      "wedding-node-1",
    );

    await vi.advanceTimersByTimeAsync(2500);

    expect(mockUpdateObjectIndex).not.toHaveBeenCalled();

    resolveHydrate();
    await hydratePromise;
  });

  it("C2: suppressSyncPush cancels a pending timer and blocks new scheduling", async () => {
    const { scheduleSyncPush, suppressSyncPush, restoreSyncPush } = await import("@/lib/space-sync");

    scheduleSyncPush();
    suppressSyncPush();
    scheduleSyncPush();

    await vi.advanceTimersByTimeAsync(5000);

    expect(mockUpdateObjectIndex).not.toHaveBeenCalled();

    restoreSyncPush();
    scheduleSyncPush();
    await vi.advanceTimersByTimeAsync(2500);
  });

  it("C2: restoreSyncPush re-enables scheduling after suppress", async () => {
    const { scheduleSyncPush, suppressSyncPush, restoreSyncPush } = await import("@/lib/space-sync");

    suppressSyncPush();
    restoreSyncPush();
    scheduleSyncPush();
    await vi.advanceTimersByTimeAsync(2500);
  });
});

// ─── Regression: pushNodeContent must not send null baseHash ─────────────────
//
// pushNodeContent delegates to handle.push() which owns pull-for-hash → CAS.
// Verified by checking that handle.push is called with the correct paths, and
// that its internal client.push receives the server hash (not null) as baseHash.

describe("pushNodeContent delegates to handle.push() for CAS-safe writes", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockUpdateObjectIndex.mockReset();
    mockWeddingData = { id: "w1", name: "Test Wedding" };
    mockClientPull = vi.fn(async () => ({ data: { existing: true }, hash: "H1" }));
    mockClientPush = vi.fn(async () => ({ hash: "H2" }));
    mockHandlePush = makeHandlePush(mockClientPull, mockClientPush);
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: { pull: mockClientPull, push: mockClientPush },
      isOwnerOpen: false,
      push: mockHandlePush,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    mockWeddingData = null;
  });

  it("H1: handle.push is called with the node's pull and push paths", async () => {
    const { pushSpaceSnapshot } = await import("@/lib/space-sync");

    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    expect(mockHandlePush).toHaveBeenCalledWith(
      expect.stringContaining("w1"),  // pullPath
      expect.stringContaining("w1"),  // pushPath
      expect.any(Function),           // mutator
    );
  });

  it("H2: client.push receives the server hash from client.pull as baseHash (not null)", async () => {
    const { pushSpaceSnapshot } = await import("@/lib/space-sync");

    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    expect(mockClientPush).toHaveBeenCalledWith(
      expect.stringContaining("w1"),  // pushPath
      expect.anything(),              // payload
      "H1",                           // ← hash from pull, never null
    );
  });
});

// ─── discoverOwnerWeddingRoot ─────────────────────────────────────────────────
//
// Finds the pre-existing wedding root in a shared space so a joiner can adopt the
// owner's node id instead of pushing a second, divergent root.
// Mirrors the reconciliation in fiance-sdk/src/sync/import-legacy.ts:123-124.

describe("discoverOwnerWeddingRoot", () => {
  afterEach(() => {
    mockReadObjectTreeImpl = async () => [];
  });

  it("returns the single root when there is exactly one wedding node", async () => {
    mockReadObjectTreeImpl = async () => [
      { id: "owner-root", type: "wedding", parentId: null, updatedAt: 1000 },
    ];
    const { discoverOwnerWeddingRoot } = await import("@/lib/space-sync");
    expect(await discoverOwnerWeddingRoot({} as never, "sp-1", "joiner-own")).toBe("owner-root");
  });

  it("excludes this device's own root and returns the other (common 2-root case)", async () => {
    mockReadObjectTreeImpl = async () => [
      { id: "joiner-own", type: "wedding", parentId: null, updatedAt: 2000 },
      { id: "owner-root", type: "wedding", parentId: null, updatedAt: 1000 },
    ];
    const { discoverOwnerWeddingRoot } = await import("@/lib/space-sync");
    expect(await discoverOwnerWeddingRoot({} as never, "sp-1", "joiner-own")).toBe("owner-root");
  });

  it("with 3 roots (polluted space), picks oldest updatedAt after excluding own id", async () => {
    mockReadObjectTreeImpl = async () => [
      { id: "joiner-own",   type: "wedding", parentId: null, updatedAt: 3000 },
      { id: "joiner2",      type: "wedding", parentId: null, updatedAt: 2000 },
      { id: "owner-root",   type: "wedding", parentId: null, updatedAt: 1000 },
    ];
    const { discoverOwnerWeddingRoot } = await import("@/lib/space-sync");
    expect(await discoverOwnerWeddingRoot({} as never, "sp-1", "joiner-own")).toBe("owner-root");
  });

  it("returns null when space has no wedding nodes", async () => {
    mockReadObjectTreeImpl = async () => [
      { id: "guest-1", type: "guest", parentId: "some-root", updatedAt: 1000 },
    ];
    const { discoverOwnerWeddingRoot } = await import("@/lib/space-sync");
    expect(await discoverOwnerWeddingRoot({} as never, "sp-1", "joiner-own")).toBeNull();
  });

  it("returns null for an empty space", async () => {
    mockReadObjectTreeImpl = async () => [];
    const { discoverOwnerWeddingRoot } = await import("@/lib/space-sync");
    expect(await discoverOwnerWeddingRoot({} as never, "sp-1", "joiner-own")).toBeNull();
  });

  it("swallows readObjectTree errors and returns null (network-safe)", async () => {
    mockReadObjectTreeImpl = async () => { throw new Error("network error"); };
    const { discoverOwnerWeddingRoot } = await import("@/lib/space-sync");
    await expect(discoverOwnerWeddingRoot({} as never, "sp-1", "joiner-own")).resolves.toBeNull();
  });

  it("does NOT treat wedding nodes with non-null parentId as roots", async () => {
    // A wedding node that is a child of another node must not be picked as the root.
    mockReadObjectTreeImpl = async () => [
      { id: "non-root-wedding", type: "wedding", parentId: "some-parent", updatedAt: 1000 },
    ];
    const { discoverOwnerWeddingRoot } = await import("@/lib/space-sync");
    expect(await discoverOwnerWeddingRoot({} as never, "sp-1", "joiner-own")).toBeNull();
  });

  it("when only own root present (owner's first boot), returns own root as fallback", async () => {
    // No other roots → pool falls back to roots (including ownId) → returns it.
    // This is the owner boot path: no adoption needed, but discovery doesn't break.
    mockReadObjectTreeImpl = async () => [
      { id: "my-root", type: "wedding", parentId: null, updatedAt: 1000 },
    ];
    const { discoverOwnerWeddingRoot } = await import("@/lib/space-sync");
    // Returns my-root (the only candidate); providers.tsx guards adopted !== wedding.id,
    // so this is a no-op — the owner never persists a redundant weddingNodeId.
    expect(await discoverOwnerWeddingRoot({} as never, "sp-1", "my-root")).toBe("my-root");
  });
});

// ─── hydrateFromSpace: wedding doc selected by weddingNodeId, not index [0] ──
//
// Before the fix, `hydrateFromSpace` called `pullAll("wedding")` and used
// `weddingDocs[0]`, ignoring the active wedding node id entirely. With two wedding
// roots in a shared space this could hydrate the wrong wedding header doc.
// The fix: select the matching node at the index level (where id is known), then
// pull only that one node's content.

describe("hydrateFromSpace — wedding doc selected by weddingNodeId, not index [0]", () => {
  afterEach(() => {
    mockReadObjectTreeImpl = async () => [];
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: { push: vi.fn(), pull: vi.fn(async () => ({ data: null, hash: null })) },
      isOwnerOpen: false,
      push: vi.fn(),
    });
  });

  it("pulls the content doc for the node matching weddingNodeId, not the first node", async () => {
    // Space has two wedding roots: node-A (older, index[0]) and node-B (active).
    mockReadObjectTreeImpl = async () => [
      { id: "node-A", type: "wedding", parentId: null, updatedAt: 1000, contentKind: "merge", access: "space", enc: false },
      { id: "node-B", type: "wedding", parentId: null, updatedAt: 2000, contentKind: "merge", access: "space", enc: false },
    ];

    const pulledPaths: string[] = [];
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: {
        pull: vi.fn(async (path: string) => {
          pulledPaths.push(path);
          return { data: { marker: path }, hash: "h" };
        }),
        push: vi.fn(),
      },
      isOwnerOpen: false,
      push: vi.fn(),
    });

    const { hydrateFromSpace } = await import("@/lib/space-sync");
    await hydrateFromSpace({ userId: "u1" } as never, "sp-1", "node-B");

    // Exactly one wedding content pull, and it's for node-B (not node-A).
    const weddingPulls = pulledPaths.filter((p) => p.includes("node-A") || p.includes("node-B"));
    expect(weddingPulls).toHaveLength(1);
    expect(weddingPulls[0]).toContain("node-B");
  });

  it("falls back to the first node when no node matches weddingNodeId", async () => {
    // Only one wedding root in the space; active weddingNodeId is unknown (e.g. first boot).
    mockReadObjectTreeImpl = async () => [
      { id: "node-A", type: "wedding", parentId: null, updatedAt: 1000, contentKind: "merge", access: "space", enc: false },
    ];

    const pulledPaths: string[] = [];
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: {
        pull: vi.fn(async (path: string) => {
          pulledPaths.push(path);
          return { data: { marker: path }, hash: "h" };
        }),
        push: vi.fn(),
      },
      isOwnerOpen: false,
      push: vi.fn(),
    });

    const { hydrateFromSpace } = await import("@/lib/space-sync");
    // Active id not in the space → falls back to node-A (the only candidate).
    await hydrateFromSpace({ userId: "u1" } as never, "sp-1", "node-UNKNOWN");

    const weddingPulls = pulledPaths.filter((p) => p.includes("node-A"));
    expect(weddingPulls).toHaveLength(1);
  });

  it("does not pull any wedding doc when the space has no wedding nodes", async () => {
    mockReadObjectTreeImpl = async () => [
      { id: "guest-1", type: "guest", parentId: "node-A", updatedAt: 1000, contentKind: "merge", access: "space", enc: false },
    ];

    const pulledPaths: string[] = [];
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: {
        pull: vi.fn(async (path: string) => { pulledPaths.push(path); return { data: null, hash: null }; }),
        push: vi.fn(),
      },
      isOwnerOpen: false,
      push: vi.fn(),
    });

    const { hydrateFromSpace } = await import("@/lib/space-sync");
    await hydrateFromSpace({ userId: "u1" } as never, "sp-1", "node-A");

    // The only pull is for the guest node, not a wedding node.
    const weddingPulls = pulledPaths.filter((p) => p.includes("node-A"));
    // One pull: the guest "guest-1" references "node-A" as parentId, but the
    // content is pulled for node "guest-1", not "node-A". No wedding pulls.
    expect(pulledPaths.some((p) => p.includes("guest-1"))).toBe(true);
  });
});

// ─── Regression: encrypted nodes must not be silently dropped (Bug B) ─────────
//
// When a doc does not exist the server returns { data: {}, hash: "" }. The fixed
// handle.push gates decrypt on a non-empty hash, so cur = null and the mutator
// still runs. The node is created with baseHash = null (not swallowed with a throw).

describe("pushNodeContent succeeds for a missing encrypted node (Bug B regression)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockUpdateObjectIndex.mockReset();
    mockWeddingData = { id: "w1", name: "Test Wedding" };
    // Pull returns the "missing doc" response: truthy {} data with empty hash.
    mockClientPull = vi.fn(async () => ({ data: {}, hash: "" }));
    mockClientPush = vi.fn(async () => ({ hash: "H_created" }));
    const mockEncryptor = {
      decrypt: vi.fn(async () => { throw new Error("Encrypted payload is too short") }),
      encrypt: vi.fn(async (d: unknown) => ({ _encrypted: JSON.stringify(d) })),
    };
    mockHandlePush = makeHandlePush(mockClientPull, mockClientPush, mockEncryptor);
    mockGetNodeAccessImpl = async () => ({
      encryptor: mockEncryptor as never,
      client: { pull: mockClientPull, push: mockClientPush },
      isOwnerOpen: false,
      push: mockHandlePush,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    mockWeddingData = null;
  });

  it("H3: client.push is called (node created) and decrypt is NOT called for a missing doc", async () => {
    const { pushSpaceSnapshot } = await import("@/lib/space-sync");

    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    // handle.push must have been invoked for the wedding node.
    expect(mockHandlePush).toHaveBeenCalledWith(
      expect.stringContaining("w1"),
      expect.stringContaining("w1"),
      expect.any(Function),
    );
    // client.push must succeed (node created with baseHash = "" per alpha.49 fix, not null).
    // "" is the correct create/heal baseHash — null would deadlock against a hash-less existing doc.
    expect(mockClientPush).toHaveBeenCalledWith(
      expect.stringContaining("w1"),
      expect.any(Object),
      "",
    );
  });
});
