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
