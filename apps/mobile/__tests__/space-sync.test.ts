/**
 * Tests for lib/space-sync.ts — timer race guards and import-lock helpers.
 *
 * G1: _isHydrating is re-checked inside the 2-second timer callback so a push
 *     that was queued before hydration started does not fire mid-hydrate.
 * C2: suppressSyncPush() cancels any pending timer and blocks new scheduling;
 *     restoreSyncPush() re-enables it.
 * H1/H2: pushCollectionDoc(wedding) delegates to handle.push(), which owns CAS + hash
 *     tracking — client.push never receives a null baseHash after the first write.
 * H3 (Bug B regression): handle.push with an encrypted node and a missing doc
 *     (pull returns { data: {}, hash: "" }) must call client.push successfully
 *     — not throw "Encrypted payload is too short" and swallow the node silently.
 */
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from "vitest";

// ─── Mocks ────────────────────────────────────────────────────────────────────

// Mutable: allows individual tests to inject a wedding entity so buildAllNodes
// produces at least one node (enabling pushCollectionDoc(wedding) to be exercised).
let mockWeddingData: Record<string, unknown> | null = null;

// Mutable: lets index-merge tests give buildAllNodes a second, independently
// addable/removable node (the wedding node alone can't model "this device added
// guest GA while a peer added guest GB" — there'd be only one local node).
let mockGuestsData: Array<{ id: string; name?: string }> = [];

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
  getSpaceAccessEntry: vi.fn(() => null),
  objDocPush: vi.fn((s: string, n: string) => `push/${s}/${n}`),
  objDocPull: vi.fn((s: string, n: string) => `pull/${s}/${n}`),
  objInvPull: vi.fn((s: string, n: string) => `invpull/${s}/${n}`),
  FIANCE_TYPES: {
    wedding: "wedding", guestGroup: "guestGroup", guest: "guest", table: "table",
    vendor: "vendor", quotePricing: "quotePricing", vendorPayment: "vendorPayment",
    accommodation: "accommodation", gift: "gift", invitationType: "invitationType",
    communication: "communication",
    weddingRole: "weddingRole",
    weddingRoleAssignment: "weddingRoleAssignment", seatingConstraint: "seatingConstraint",
    weddingEvent: "weddingEvent",
    guestMealSelection: "guestMealSelection",
    communicationTemplate: "communicationTemplate",
    document: "document",
    legalMilestone: "legalMilestone",
    honeymoonPlan: "honeymoonPlan",
    taskCategory: "taskCategory", task: "task", agendaEvent: "agendaEvent",
    dayOfItem: "dayOfItem", ideaCollection: "ideaCollection", idea: "idea",
    rsvp: "rsvp",
  },
  weddingToNode: vi.fn(() => ({ id: "w1", type: "wedding", access: "space", enc: true, contentKind: "merge" })),
  guestGroupToNode: vi.fn(), tableToNode: vi.fn(),
  // Real (not bare) impl: index-merge tests need buildAllNodes to actually emit a
  // node per mockGuestsData entry, not `undefined` (descriptorToNode would throw).
  guestToNode: vi.fn((g: { id: string; name?: string }, id: string, parentId: string) => ({
    id, type: "guest", parentId, title: g?.name ?? id, access: "space", enc: true, contentKind: "merge",
  })),
  vendorToNode: vi.fn(), quotePricingToNode: vi.fn(), vendorPaymentToNode: vi.fn(),
  accommodationToNode: vi.fn(), giftToNode: vi.fn(), invitationTypeToNode: vi.fn(),
  communicationToNode: vi.fn(),
  weddingRoleToNode: vi.fn(),
  weddingRoleAssignmentToNode: vi.fn(), seatingConstraintToNode: vi.fn(),
  weddingEventToNode: vi.fn(),
  guestMealSelectionToNode: vi.fn(),
  communicationTemplateToNode: vi.fn(),
  documentToNode: vi.fn(),
  legalMilestoneToNode: vi.fn(),
  honeymoonPlanToNode: vi.fn(),
  taskCategoryToNode: vi.fn(), taskToNode: vi.fn(), agendaEventToNode: vi.fn(),
  dayOfItemToNode: vi.fn(), ideaCollectionToNode: vi.fn(), ideaToNode: vi.fn(),
  weddingFromDoc: vi.fn(), guestGroupFromDoc: vi.fn(), guestFromDoc: vi.fn(),
  tableFromDoc: vi.fn(), vendorFromDoc: vi.fn(), quotePricingFromDoc: vi.fn(),
  vendorPaymentFromDoc: vi.fn(), accommodationFromDoc: vi.fn(), giftFromDoc: vi.fn(),
  invitationTypeFromDoc: vi.fn(), communicationFromDoc: vi.fn(),
  weddingRoleFromDoc: vi.fn(),
  weddingRoleAssignmentFromDoc: vi.fn(), seatingConstraintFromDoc: vi.fn(),
  weddingEventFromDoc: vi.fn(),
  guestMealSelectionFromDoc: vi.fn(),
  communicationTemplateFromDoc: vi.fn(),
  documentFromDoc: vi.fn(),
  legalMilestoneFromDoc: vi.fn(),
  honeymoonPlanFromDoc: vi.fn(),
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

// emptyStore.getState() mints a fresh vi.fn() for every setter on every call, so a
// setWedding spy declared inside it can't be observed across the getState() call
// production code makes. Pulled out to a stable reference the useWeddingStore mock
// below always installs, so tests can assert what hydrateFromSpace fed setWedding.
let mockSetWedding: Mock = vi.fn();

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
  weddingRoles: [], weddingRoleAssignments: [], seatingConstraints: [], weddingEvents: [], mealSelections: [],
  communicationTemplates: [], documents: [], legalMilestones: [], honeymoonPlans: [],
  categories: [], tasks: [], agendaEvents: [], dayOfItems: [],
  collections: [], ideas: [],
  ceremonyItems: [], speeches: [], playlistTracks: [],
  roles: [], assignments: [],
  setWedding: vi.fn(), setGroups: vi.fn(), setTables: vi.fn(), setGuests: vi.fn(),
  setVendors: vi.fn(), setQuotePricings: vi.fn(), setVendorPayments: vi.fn(),
  setAccommodations: vi.fn(), setGifts: vi.fn(), setInvitationTypes: vi.fn(),
  setCommunications: vi.fn(),
  setWeddingRoles: vi.fn(),
  setWeddingRoleAssignments: vi.fn(), setSeatingConstraints: vi.fn(), setWeddingEvents: vi.fn(),
  setMealSelections: vi.fn(),
  setCommunicationTemplates: vi.fn(),
  setDocuments: vi.fn(),
  setLegalMilestones: vi.fn(),
  setHoneymoonPlans: vi.fn(),
  setCategories: vi.fn(), setTasks: vi.fn(), setAgendaEvents: vi.fn(),
  setDayOfItems: vi.fn(), setCollections: vi.fn(), setIdeas: vi.fn(),
  setCeremonyItems: vi.fn(), setSpeeches: vi.fn(), setPlaylistTracks: vi.fn(),
  setRoles: vi.fn(), setAssignments: vi.fn(),
}) };

vi.mock("@/store/useWeddingStore", () => ({
  useWeddingStore: {
    getState: () => ({ ...emptyStore.getState(), wedding: mockWeddingData, setWedding: mockSetWedding }),
  },
}));
// `role` lives on the WeddingRegistryEntry (local device/registry metadata), NOT on the
// domain `wedding` above — mocked separately so tests exercise the real gating path
// (see the "hydrateFromSpace — RSVP inbox apply is owner-only" regression tests below).
let mockRegistryRole: "owner" | "member" | undefined;
vi.mock("@/store/useWeddingRegistryStore", () => ({
  useWeddingRegistryStore: {
    getState: () => ({
      registry: { activeWeddingId: "w1", weddings: [{ id: "w1", role: mockRegistryRole }] },
    }),
  },
}));
vi.mock("@/store/useGuestsStore", () => ({
  useGuestsStore: { getState: () => ({ ...emptyStore.getState(), guests: mockGuestsData }) },
}));
vi.mock("@/store/useVendorsStore", () => ({ useVendorsStore: emptyStore }));
vi.mock("@/store/usePlanningStore", () => ({ usePlanningStore: emptyStore }));
vi.mock("@/store/useIdeasStore", () => ({ useIdeasStore: emptyStore }));
vi.mock("@/store/useAccommodationsStore", () => ({ useAccommodationsStore: emptyStore }));
vi.mock("@/store/useGiftsStore", () => ({ useGiftsStore: emptyStore }));
vi.mock("@/store/useInvitationTypesStore", () => ({ useInvitationTypesStore: emptyStore }));
vi.mock("@/store/useCommunicationsStore", () => ({ useCommunicationsStore: emptyStore }));
vi.mock("@/store/useWeddingPartyStore", () => ({ useWeddingPartyStore: emptyStore }));
vi.mock("@/store/useSeatingConstraintsStore", () => ({ useSeatingConstraintsStore: emptyStore }));
vi.mock("@/store/useWeddingEventsStore", () => ({ useWeddingEventsStore: emptyStore }));
vi.mock("@/store/useMealSelectionsStore", () => ({ useMealSelectionsStore: emptyStore }));
vi.mock("@/store/useCommunicationTemplatesStore", () => ({ useCommunicationTemplatesStore: emptyStore }));
vi.mock("@/store/useDocumentsStore", () => ({ useDocumentsStore: emptyStore }));
vi.mock("@/store/useLegalStore", () => ({ useLegalStore: emptyStore }));
vi.mock("@/store/useHoneymoonStore", () => ({ useHoneymoonStore: emptyStore }));
vi.mock("@/store/useCeremonyStore", () => ({ useCeremonyStore: emptyStore }));
vi.mock("@/store/useSpeechesMusicStore", () => ({ useSpeechesMusicStore: emptyStore }));
vi.mock("@/store/usePermissionsStore", () => ({ usePermissionsStore: emptyStore }));

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

// ─── Bug B regression: created-guest deletion race ────────────────────────────
//
// Repro (member device, joined via invite link):
//  1. Member creates guest G. notifySync() → scheduleSyncPush() debounces 2s.
//  2. Timer fires: _pushTimer is cleared to null BEFORE pushSpaceSnapshot's network
//     call resolves (space-sync.ts's scheduleSyncPush callback).
//  3. Before the fix, refreshFromSpaceIfIdle()'s guard (`_isHydrating || _pushTimer`)
//     was already open during this window, so a foreground refresh (guests get an
//     extra foreground trigger via refreshRsvpInbox + refreshFromSpaceIfIdle in
//     providers.tsx) could run hydrateFromSpace concurrently. That reseeds
//     _collectionState from the pre-G server doc and setGuests() replaces the store
//     WITHOUT G, while the in-flight push's success handler then commits
//     _collectionState WITH G — so the next buildCollectionDoc() sees an id in
//     `prev.rev` that's absent from the (reseeded) store and tombstones it: G is
//     durably deleted on every device.
//  4. Fix: a `_pushing` flag is held for the full duration of the awaited
//     pushSpaceSnapshot call (not just the debounce), and refreshFromSpaceIfIdle's
//     guard now also checks it — closing the window entirely.

describe("_pushing guard — no concurrent hydrate while a push awaits the network (Bug B)", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    mockUpdateObjectIndex.mockReset();
    mockWeddingData = null;
    mockGuestsData = [];
    const { resetDirtyPushBaseline } = await import("@/lib/space-sync");
    resetDirtyPushBaseline();
  });

  afterEach(() => {
    vi.useRealTimers();
    mockWeddingData = null;
    mockGuestsData = [];
    mockReadObjectTreeImpl = async () => [];
  });

  it("refreshFromSpaceIfIdle does not hydrate during the post-timer-clear, pre-network-settle window, and resumes once the push settles", async () => {
    // Establish a baseline: guest g1 already durably pushed (so the next push only
    // carries g2 as new — mirrors a member device that already synced once).
    mockClientPull = vi.fn(async () => ({ data: null, hash: null }));
    mockClientPush = vi.fn(async () => ({ hash: "H1" }));
    mockHandlePush = makeHandlePush(mockClientPull, mockClientPush);
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: { pull: mockClientPull, push: mockClientPush },
      isOwnerOpen: false,
      push: mockHandlePush,
    });
    const { pushSpaceSnapshot, scheduleSyncPush, refreshFromSpaceIfIdle } = await import("@/lib/space-sync");
    mockGuestsData = [{ id: "g1" }];
    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    // Member creates guest g2 — this is the mutation whose notifySync() schedules the push.
    mockGuestsData = [{ id: "g1" }, { id: "g2" }];

    // Make the network push hang so the post-timer-clear, pre-settle window is observable.
    let resolvePush!: (v: { hash: string }) => void;
    mockClientPush = vi.fn(() => new Promise<{ hash: string }>((res) => { resolvePush = res; }));
    mockHandlePush = makeHandlePush(mockClientPull, mockClientPush);
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: { pull: mockClientPull, push: mockClientPush },
      isOwnerOpen: false,
      push: mockHandlePush,
    });

    scheduleSyncPush();
    // Fire the 2s debounce timer: _pushTimer is cleared to null here, then
    // pushSpaceSnapshot starts and blocks awaiting mockClientPush.
    await vi.advanceTimersByTimeAsync(2000);

    let readTreeCalls = 0;
    mockReadObjectTreeImpl = async () => { readTreeCalls++; return []; };

    // Old bug: _pushTimer is null at this point, so this call would proceed straight
    // into hydrateFromSpace and reseed the store from the stale (pre-g2) server doc.
    await refreshFromSpaceIfIdle();
    expect(readTreeCalls).toBe(0); // guarded by _pushing — must not hydrate mid-push

    // Let the in-flight push settle.
    resolvePush({ hash: "H2" });
    await vi.advanceTimersByTimeAsync(0);

    // Guard releases once the push is durably committed — sync isn't permanently stuck.
    await refreshFromSpaceIfIdle();
    expect(readTreeCalls).toBe(1);
  });

  it("a second concurrent scheduleSyncPush push still resolves _pushing to false even if the network push fails", async () => {
    mockClientPull = vi.fn(async () => ({ data: null, hash: null }));
    let rejectPush!: (err: Error) => void;
    mockClientPush = vi.fn(() => new Promise<{ hash: string }>((_res, rej) => { rejectPush = rej; }));
    mockHandlePush = makeHandlePush(mockClientPull, mockClientPush);
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: { pull: mockClientPull, push: mockClientPush },
      isOwnerOpen: false,
      push: mockHandlePush,
    });
    const { scheduleSyncPush, refreshFromSpaceIfIdle } = await import("@/lib/space-sync");
    mockGuestsData = [{ id: "g1" }];

    scheduleSyncPush();
    await vi.advanceTimersByTimeAsync(2000);

    let readTreeCalls = 0;
    mockReadObjectTreeImpl = async () => { readTreeCalls++; return []; };

    await refreshFromSpaceIfIdle();
    expect(readTreeCalls).toBe(0); // guarded while the (failing) push is still in flight

    rejectPush(new Error("network down"));
    await vi.advanceTimersByTimeAsync(0);

    // _pushing must be released even on failure — otherwise sync would wedge permanently.
    await refreshFromSpaceIfIdle();
    expect(readTreeCalls).toBe(1);
  });
});

// ─── Regression: pushCollectionDoc(wedding) must not send null baseHash ───────
//
// pushCollectionDoc delegates to handle.push() which owns pull-for-hash → CAS.
// Verified by checking that handle.push is called with the correct paths, and
// that its internal client.push receives the server hash (not null) as baseHash.

describe("pushCollectionDoc(wedding) delegates to handle.push() for CAS-safe writes", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    mockUpdateObjectIndex.mockReset();
    mockWeddingData = { id: "w1", name: "Test Wedding" };
    // Dirty-tracking is shared module state — reset so this describe block's pushes
    // aren't skipped as "unchanged" by a previous describe block's identical content.
    const { resetDirtyPushBaseline } = await import("@/lib/space-sync");
    resetDirtyPushBaseline();
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

// ─── Regression: a 403 push sets writeDenied; a successful push clears it ────
//
// Root cause of the guest/vendor/budget data-loss bug on member devices: a stale
// read-only cap makes every write 403 server-side. The error was previously only
// console.warn'd, so the edit vanished on the next hydrate with zero feedback.
// pushCollectionDoc must set useSyncAccessStore's writeDenied on a StarfishHttpError(403)
// and clear it again once a push actually succeeds.

describe("push 403 handling sets/clears useSyncAccessStore.writeDenied", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    mockUpdateObjectIndex.mockReset();
    mockWeddingData = { id: "w1", name: "Test Wedding" };
    const { resetDirtyPushBaseline } = await import("@/lib/space-sync");
    resetDirtyPushBaseline();
    const { useSyncAccessStore } = await import("@/store/useSyncAccessStore");
    useSyncAccessStore.getState().setWriteDenied(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    mockWeddingData = null;
  });

  it("sets writeDenied when handle.push rejects with a 403 StarfishHttpError", async () => {
    const { StarfishHttpError } = await import("@drakkar.software/starfish-client");
    mockHandlePush = vi.fn(async () => { throw new StarfishHttpError(403, "forbidden"); });
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: { pull: mockClientPull, push: mockClientPush },
      isOwnerOpen: false,
      push: mockHandlePush,
    });
    const { pushSpaceSnapshot } = await import("@/lib/space-sync");
    const { useSyncAccessStore } = await import("@/store/useSyncAccessStore");

    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    expect(useSyncAccessStore.getState().writeDenied).toBe(true);
  });

  it("clears writeDenied once a push actually succeeds", async () => {
    const { useSyncAccessStore } = await import("@/store/useSyncAccessStore");
    useSyncAccessStore.getState().setWriteDenied(true);
    mockClientPull = vi.fn(async () => ({ data: { existing: true }, hash: "H1" }));
    mockClientPush = vi.fn(async () => ({ hash: "H2" }));
    mockHandlePush = makeHandlePush(mockClientPull, mockClientPush);
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: { pull: mockClientPull, push: mockClientPush },
      isOwnerOpen: false,
      push: mockHandlePush,
    });
    const { pushSpaceSnapshot } = await import("@/lib/space-sync");

    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    expect(useSyncAccessStore.getState().writeDenied).toBe(false);
  });

  it("does NOT set writeDenied for a non-403 error (e.g. transient network failure)", async () => {
    mockHandlePush = vi.fn(async () => { throw new Error("network timeout"); });
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: { pull: mockClientPull, push: mockClientPush },
      isOwnerOpen: false,
      push: mockHandlePush,
    });
    const { pushSpaceSnapshot } = await import("@/lib/space-sync");
    const { useSyncAccessStore } = await import("@/store/useSyncAccessStore");

    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    expect(useSyncAccessStore.getState().writeDenied).toBe(false);
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
    const batchedObjectIds: string[] = [];
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: {
        pull: vi.fn(async (path: string) => { pulledPaths.push(path); return { data: null, hash: null }; }),
        push: vi.fn(),
        batchPullMany: vi.fn(async (_collection: string, paramsList: { objectId: string }[]) => {
          batchedObjectIds.push(...paramsList.map((p) => p.objectId));
          return paramsList.map(() => ({ data: null }));
        }),
      },
      isOwnerOpen: false,
      push: vi.fn(),
    });

    const { hydrateFromSpace } = await import("@/lib/space-sync");
    await hydrateFromSpace({ userId: "u1" } as never, "sp-1", "node-A");

    // No wedding node exists, so the only content pull is the guest, and it goes
    // through the batched path (batchPullMany), not a per-node client.pull().
    const weddingPulls = pulledPaths.filter((p) => p.includes("node-A"));
    expect(weddingPulls).toHaveLength(0);
    expect(batchedObjectIds).toContain("guest-1");
  });
});

// ─── hydrateFromSpace: wedding singleton unwrap (rev-LWW) ─────────────────────
//
// The wedding root now pushes as a 1-item CollectionDoc (readSingletonEntity/
// buildSingletonDoc/mergeSingletonDoc in @fiance/sdk — see the "Close the
// wedding-singleton lost-update hole" plan) instead of a raw object. hydrateFromSpace
// must unwrap that shape before feeding the store, AND still tolerate an old build's
// legacy raw doc during a rollout window (see mergeSingletonDoc's doc comment).

describe("hydrateFromSpace — wedding singleton unwrap", () => {
  beforeEach(() => {
    mockSetWedding.mockClear();
  });

  afterEach(() => {
    mockReadObjectTreeImpl = async () => [];
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: { push: vi.fn(), pull: vi.fn(async () => ({ data: null, hash: null })) },
      isOwnerOpen: false,
      push: vi.fn(),
    });
  });

  it("unwraps a new-shape (1-item CollectionDoc) wedding pull before calling setWedding", async () => {
    mockReadObjectTreeImpl = async () => [
      { id: "node-A", type: "wedding", parentId: null, updatedAt: 1000, contentKind: "merge", access: "space", enc: false },
    ];
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: {
        pull: vi.fn(async () => ({
          data: {
            fmt: 2,
            items: { "node-A": { id: "node-A", name: "Wrapped Wedding" } },
            rev: { "node-A": 777 },
            tombstones: {},
          },
          hash: "h",
        })),
        push: vi.fn(),
      },
      isOwnerOpen: false,
      push: vi.fn(),
    });

    const { hydrateFromSpace } = await import("@/lib/space-sync");
    await hydrateFromSpace({ userId: "u1" } as never, "sp-1", "node-A");

    expect(mockSetWedding).toHaveBeenCalledTimes(1);
    const [passed] = mockSetWedding.mock.calls[0] as [Record<string, unknown>];
    expect(passed).toMatchObject({ id: "node-A", name: "Wrapped Wedding" });
    // Not the wrapper — a bug here would leak the {fmt,items,rev,tombstones} envelope
    // into the wedding store instead of the actual entity.
    expect(passed.items).toBeUndefined();
    expect(passed.fmt).toBeUndefined();
  });

  it("still adopts a legacy raw (pre-migration, un-wrapped) wedding pull", async () => {
    mockReadObjectTreeImpl = async () => [
      { id: "node-A", type: "wedding", parentId: null, updatedAt: 1000, contentKind: "merge", access: "space", enc: false },
    ];
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: {
        pull: vi.fn(async () => ({ data: { id: "node-A", name: "Legacy Wedding" }, hash: "h" })),
        push: vi.fn(),
      },
      isOwnerOpen: false,
      push: vi.fn(),
    });

    const { hydrateFromSpace } = await import("@/lib/space-sync");
    await hydrateFromSpace({ userId: "u1" } as never, "sp-1", "node-A");

    expect(mockSetWedding).toHaveBeenCalledTimes(1);
    expect(mockSetWedding.mock.calls[0]?.[0]).toMatchObject({ id: "node-A", name: "Legacy Wedding" });
  });

  it("does not call setWedding when no wedding doc is pulled", async () => {
    mockReadObjectTreeImpl = async () => [
      { id: "guest-1", type: "guest", parentId: "node-A", updatedAt: 1000, contentKind: "merge", access: "space", enc: false },
    ];
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: {
        pull: vi.fn(async () => ({ data: null, hash: null })),
        push: vi.fn(),
        batchPullMany: vi.fn(async (_c: string, paramsList: { objectId: string }[]) =>
          paramsList.map(() => ({ data: null }))),
      },
      isOwnerOpen: false,
      push: vi.fn(),
    });

    const { hydrateFromSpace } = await import("@/lib/space-sync");
    await hydrateFromSpace({ userId: "u1" } as never, "sp-1", "node-A");

    expect(mockSetWedding).not.toHaveBeenCalled();
  });
});

// ─── Regression: RSVP inbox apply must be owner-only (guest data-loss on member devices) ──
//
// refreshRsvpInbox/pullAndApplyRsvpNodes write the guest store (via applyRsvpSubmissionsByGuestId)
// and, outside the hydrateFromSpace interlock, that write schedules a real push. A member device
// has no business independently applying public-page RSVP submissions — it receives RSVP state
// through normal guest-collection sync from the owner. Letting a member run this raced its guest
// store against foreground hydrates and dropped/tombstoned its own newly created/edited guests.

describe("hydrateFromSpace — RSVP inbox apply is owner-only", () => {
  afterEach(() => {
    mockReadObjectTreeImpl = async () => [];
    // Production-shaped domain wedding — it never carries a `role` field. Role-gating must
    // come from the registry mock below, not from injecting `role` onto this object (that
    // was the bug: the real code read `wedding?.role`, which is always undefined in prod).
    mockWeddingData = { id: 1, partner1Name: "A", partner2Name: "B" };
    mockRegistryRole = undefined;
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: { push: vi.fn(), pull: vi.fn(async () => ({ data: null, hash: null })) },
      isOwnerOpen: false,
      push: vi.fn(),
    });
  });

  function seedRsvpNode() {
    mockReadObjectTreeImpl = async () => [
      { id: "rsvp-1", type: "rsvp", parentId: null, updatedAt: 1000, contentKind: "merge", access: "invite", enc: false },
    ];
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: {
        pull: vi.fn(async () => ({ data: { guestId: "g1", rsvpStatus: "confirmed", submittedAt: 1000 }, hash: "h" })),
        push: vi.fn(),
      },
      isOwnerOpen: false,
      push: vi.fn(),
    });
  }

  it("does NOT apply RSVP submissions into the guest store on a member device", async () => {
    // Production-shaped: domain wedding has no `role`; the registry entry does.
    mockWeddingData = { id: 1, partner1Name: "A", partner2Name: "B" };
    mockRegistryRole = "member";
    seedRsvpNode();

    const { applyRsvpSubmissionsByGuestId } = await import("@/lib/rsvp-sync");
    vi.mocked(applyRsvpSubmissionsByGuestId).mockClear();

    const { hydrateFromSpace } = await import("@/lib/space-sync");
    await hydrateFromSpace({ userId: "u1" } as never, "sp-1", "node-A");

    expect(applyRsvpSubmissionsByGuestId).not.toHaveBeenCalled();
  });

  it("DOES apply RSVP submissions into the guest store on the owner device", async () => {
    mockWeddingData = { id: 1, partner1Name: "A", partner2Name: "B" };
    mockRegistryRole = "owner";
    seedRsvpNode();

    const { applyRsvpSubmissionsByGuestId } = await import("@/lib/rsvp-sync");
    vi.mocked(applyRsvpSubmissionsByGuestId).mockClear();

    const { hydrateFromSpace } = await import("@/lib/space-sync");
    await hydrateFromSpace({ userId: "u1" } as never, "sp-1", "node-A");

    expect(applyRsvpSubmissionsByGuestId).toHaveBeenCalledWith([
      expect.objectContaining({ guestId: "g1" }),
    ]);
  });
});

// ─── Regression: encrypted nodes must not be silently dropped (Bug B) ─────────
//
// When a doc does not exist the server returns { data: {}, hash: "" }. The fixed
// handle.push gates decrypt on a non-empty hash, so cur = null and the mutator
// still runs. The node is created with baseHash = null (not swallowed with a throw).

describe("pushCollectionDoc(wedding) succeeds for a missing encrypted node (Bug B regression)", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    mockUpdateObjectIndex.mockReset();
    mockWeddingData = { id: "w1", name: "Test Wedding" };
    const { resetDirtyPushBaseline } = await import("@/lib/space-sync");
    resetDirtyPushBaseline();
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

// ─── Regression: dirty-tracking skips unchanged nodes ─────────────────────────
//
// Before the fix, pushSpaceSnapshot re-pushed every node on every call (no content
// diff). Combined with node-level last-writer-wins, a push triggered by editing one
// guest could clobber a peer's newer edit to a node this device never touched. The
// fix tracks each node's last-pushed content and only re-pushes when it changed.

describe("pushSpaceSnapshot — dirty-tracking skips unchanged nodes", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    mockUpdateObjectIndex.mockReset();
    mockWeddingData = { id: "w1", name: "Test Wedding" };
    const { resetDirtyPushBaseline } = await import("@/lib/space-sync");
    resetDirtyPushBaseline();
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

  it("a second push with unchanged content does not re-push the node", async () => {
    const { pushSpaceSnapshot } = await import("@/lib/space-sync");

    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");
    expect(mockClientPush).toHaveBeenCalledTimes(1);

    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");
    expect(mockClientPush).toHaveBeenCalledTimes(1); // still 1 — unchanged node skipped
  });

  it("a push after the node's content changes re-pushes it", async () => {
    const { pushSpaceSnapshot } = await import("@/lib/space-sync");

    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");
    expect(mockClientPush).toHaveBeenCalledTimes(1);

    mockWeddingData = { id: "w1", name: "Renamed Wedding" };
    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");
    expect(mockClientPush).toHaveBeenCalledTimes(2);
  });
});


// ─── Regression: conflict-retry mutator merges instead of clobbering ──────────
//
// Before the H1/H2 fix, pushNodeContent's mutator was `() => content` — it ignored
// `cur`, the remote doc the SDK's CAS retry pulls and decrypts on a 409 conflict, and
// just re-pushed the local snapshot. A field a peer wrote and this device never touched
// was silently overwritten.
//
// The wedding singleton now pushes through pushCollectionDoc + mergeSingletonDoc (the
// same per-entity rev-LWW machinery a real collection uses — see the "Close the
// wedding-singleton lost-update hole" plan), so the pushed payload is the wrapped
// { items: { [weddingNodeId]: <merged entity> } } shape, not a flat object. This also
// covers mergeSingletonDoc's legacy tolerance: `cur` here is an un-wrapped raw object
// (no `items` map), exactly the pre-migration remote shape.

describe("pushCollectionDoc(wedding) conflict mutator — merges remote content instead of clobbering", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    mockUpdateObjectIndex.mockReset();
    mockWeddingData = { id: "w1", name: "Local Name" };
    const { resetDirtyPushBaseline } = await import("@/lib/space-sync");
    resetDirtyPushBaseline();
    // Simulates a conflict-retry pull: the server has a field this device never touched,
    // in the legacy (pre-migration) un-wrapped shape.
    mockClientPull = vi.fn(async () => ({ data: { existing: true, untouchedField: "fromRemote" }, hash: "H1" }));
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

  it("merges the remote doc's untouched field into the pushed payload instead of dropping it", async () => {
    const { pushSpaceSnapshot } = await import("@/lib/space-sync");

    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    expect(mockClientPush).toHaveBeenCalledWith(
      expect.stringContaining("w1"),
      expect.objectContaining({
        items: expect.objectContaining({
          w1: expect.objectContaining({ untouchedField: "fromRemote", name: "Local Name" }),
        }),
      }),
      "H1",
    );
  });
});

// ─── Regression: wedding push wire shape — 1-item CollectionDoc, not a raw object ──
//
// Locks down the wire format itself (independent of the merge-conflict tests above):
// a clean, no-conflict wedding push must produce {fmt, items:{[weddingNodeId]: entity},
// rev:{[weddingNodeId]: number}, tombstones:{}} — the same shape mergeCollectionDoc/
// mergeSingletonDoc expect on the read side.

describe("pushSpaceSnapshot — wedding push wire shape", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    mockUpdateObjectIndex.mockReset();
    mockWeddingData = { id: "w1", name: "Test Wedding" };
    const { resetDirtyPushBaseline } = await import("@/lib/space-sync");
    resetDirtyPushBaseline();
    mockClientPull = vi.fn(async () => ({ data: null, hash: null })); // first-ever push, no remote yet
    mockClientPush = vi.fn(async () => ({ hash: "H_new" }));
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

  it("pushes the wedding wrapped as a 1-item CollectionDoc keyed by weddingNodeId", async () => {
    const { pushSpaceSnapshot } = await import("@/lib/space-sync");

    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    expect(mockClientPush).toHaveBeenCalledWith(
      expect.stringContaining("w1"),
      {
        fmt: 2,
        items: { w1: { id: "w1", name: "Test Wedding" } },
        rev: { w1: expect.any(Number) },
        tombstones: {},
      },
      "",
    );
  });
});

// ─── Per-collection push (collection-only, direct migration) ──────────────────
//
// Content is one doc per collection (col:{type}:{weddingNodeId}) — NO per-entity
// content docs. A bulk import of N guests mutates only the guest store → exactly ONE
// collection doc (col:guest) is pushed, regardless of N (the headline metric); the
// only other content push is the wedding singleton. Delete-safety rides on in-doc
// tombstones, and the index prunes legacy per-entity nodes.

/** All (pushPath, payload) pairs sent to client.push whose path targets a collection doc. */
function collectionPushes(pushMock: Mock, type: string): Array<{ path: string; payload: Record<string, unknown> }> {
  return pushMock.mock.calls
    .filter((c) => typeof c[0] === "string" && (c[0] as string).includes(`col:${type}:`))
    .map((c) => ({ path: c[0] as string, payload: c[1] as Record<string, unknown> }));
}

describe("pushSpaceSnapshot — per-collection push (collection-only)", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    mockUpdateObjectIndex.mockReset();
    mockWeddingData = { id: "w1", name: "Test Wedding" };
    mockGuestsData = [];
    const { resetDirtyPushBaseline } = await import("@/lib/space-sync");
    resetDirtyPushBaseline();
    // Missing-doc pull response so the collection doc is created (baseHash "").
    mockClientPull = vi.fn(async () => ({ data: null, hash: null }));
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
    mockGuestsData = [];
  });

  it("bulk import of 120 guests pushes the guest collection doc exactly ONCE", async () => {
    const { pushSpaceSnapshot } = await import("@/lib/space-sync");
    mockGuestsData = Array.from({ length: 120 }, (_, i) => ({ id: `g${i}` }));

    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    const pushes = collectionPushes(mockClientPush, "guest");
    expect(pushes).toHaveLength(1); // one doc for all 120 guests
    expect(Object.keys((pushes[0].payload.items as Record<string, unknown>))).toHaveLength(120);
  });

  it("writes NO per-entity content — only the wedding node + the guest collection doc", async () => {
    const { pushSpaceSnapshot } = await import("@/lib/space-sync");
    mockGuestsData = Array.from({ length: 120 }, (_, i) => ({ id: `g${i}` }));

    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    // Exactly two content pushes: the wedding singleton and one guest collection doc.
    const paths = mockClientPush.mock.calls.map((c) => c[0] as string);
    expect(paths).toHaveLength(2);
    // No push targets a bare guest id (e.g. .../g0) — the per-entity path is gone.
    expect(paths.some((p) => /\/g\d+$/.test(p))).toBe(false);
    expect(paths.some((p) => p.includes("col:guest:"))).toBe(true);
    expect(paths.some((p) => p.endsWith("/w1"))).toBe(true);
  });

  it("index merge prunes legacy per-entity nodes but keeps the wedding root, sentinels, and rsvp", async () => {
    const { pushSpaceSnapshot } = await import("@/lib/space-sync");
    mockGuestsData = [{ id: "g1" }]; // makes the guest collection material → col:guest sentinel is local

    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    expect(mockUpdateObjectIndex).toHaveBeenCalled();
    const updater = mockUpdateObjectIndex.mock.calls.at(-1)![2] as (
      prev: { id: string; type: string }[],
      now: number,
    ) => { id: string }[];
    const prev = [
      { id: "w1", type: "wedding" },
      { id: "g-legacy", type: "guest" },      // legacy per-entity node → must be pruned
      { id: "col:guest:w1", type: "guest" },  // collection sentinel → must survive
      { id: "rsvp-1", type: "rsvp" },         // non-managed invite node → must survive
    ];
    const ids = updater(prev, Date.now()).map((n) => n.id);
    expect(ids).not.toContain("g-legacy");
    expect(ids).toContain("w1");
    expect(ids).toContain("col:guest:w1");
    expect(ids).toContain("rsvp-1");
  });

  it("does NOT prune legacy nodes when the collection content push fails (crash-safe)", async () => {
    // Fail only the guest collection doc push; the wedding push still succeeds. A failed content
    // push must leave the legacy per-entity nodes in the index so their data stays reachable.
    mockClientPush = vi.fn(async (path: string) => {
      if (typeof path === "string" && path.includes("col:guest:")) throw new Error("network down");
      return { hash: "H2" };
    });
    mockHandlePush = makeHandlePush(mockClientPull, mockClientPush);
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: { pull: mockClientPull, push: mockClientPush },
      isOwnerOpen: false,
      push: mockHandlePush,
    });

    const { pushSpaceSnapshot } = await import("@/lib/space-sync");
    mockGuestsData = [{ id: "g1" }];
    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    const updater = mockUpdateObjectIndex.mock.calls.at(-1)![2] as (
      prev: { id: string; type: string }[],
      now: number,
    ) => { id: string }[];
    const prev = [
      { id: "w1", type: "wedding" },
      { id: "g-legacy", type: "guest" }, // col:guest push failed → NOT durable → must be KEPT
    ];
    const ids = updater(prev, Date.now()).map((n) => n.id);
    expect(ids).toContain("g-legacy"); // retained — not stranded
    expect(ids).toContain("w1");
  });

  it("does not push a collection doc for a collection that stays empty", async () => {
    const { pushSpaceSnapshot } = await import("@/lib/space-sync");
    mockGuestsData = [{ id: "g1" }];

    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    expect(collectionPushes(mockClientPush, "guest")).toHaveLength(1);
    expect(collectionPushes(mockClientPush, "vendor")).toHaveLength(0); // empty → no sentinel/doc
  });

  it("a second push with unchanged guests does not re-push the guest collection", async () => {
    const { pushSpaceSnapshot } = await import("@/lib/space-sync");
    mockGuestsData = [{ id: "g1" }, { id: "g2" }];

    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");
    expect(collectionPushes(mockClientPush, "guest")).toHaveLength(1);

    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");
    expect(collectionPushes(mockClientPush, "guest")).toHaveLength(1); // unchanged → skipped
  });

  it("deleting a guest tombstones it in the collection doc instead of resurrecting it", async () => {
    const { pushSpaceSnapshot } = await import("@/lib/space-sync");
    mockGuestsData = [{ id: "g1" }, { id: "g2" }];
    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    // Remove g2 locally; the remote still holds it (peer hasn't hydrated the delete).
    mockClientPull = vi.fn(async () => ({
      data: { fmt: 2, items: { g1: { id: "g1" }, g2: { id: "g2" } }, rev: { g1: 1, g2: 1 }, tombstones: {} },
      hash: "H1",
    }));
    mockHandlePush = makeHandlePush(mockClientPull, mockClientPush);
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: { pull: mockClientPull, push: mockClientPush },
      isOwnerOpen: false,
      push: mockHandlePush,
    });
    mockClientPush.mockClear();
    mockGuestsData = [{ id: "g1" }];
    await pushSpaceSnapshot({ userId: "u1" } as never, "space-1", "w1");

    const pushes = collectionPushes(mockClientPush, "guest");
    expect(pushes).toHaveLength(1);
    const payload = pushes[0].payload;
    expect((payload.items as Record<string, unknown>).g2).toBeUndefined(); // not resurrected
    expect((payload.tombstones as Record<string, unknown>).g2).toBeDefined(); // durable delete
    expect((payload.items as Record<string, unknown>).g1).toBeDefined();
  });
});

// ─── Per-collection read + legacy migration detection ─────────────────────────
//
// hydrateFromSpace batch-pulls the collection docs (via the sentinel nodes) AND any
// legacy per-entity nodes, unioning them — this is the one-time migration read that
// folds legacy data into the collection docs. Sentinel nodes must NOT be pulled as
// lone entities. hydrateSawLegacyNodes() flags an owner boot that still has legacy
// nodes so providers.tsx runs the migration/prune push.

describe("hydrateFromSpace — per-collection read + migration detection", () => {
  afterEach(() => {
    mockReadObjectTreeImpl = async () => [];
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: { push: vi.fn(), pull: vi.fn(async () => ({ data: null, hash: null })) },
      isOwnerOpen: false,
      push: vi.fn(),
    });
  });

  it("batch-pulls the collection sentinel AND the legacy per-entity node, unioning both", async () => {
    // Space has a wedding root, a legacy per-entity guest, and a guest collection sentinel.
    mockReadObjectTreeImpl = async () => [
      { id: "w1", type: "wedding", parentId: null, updatedAt: 1000, contentKind: "merge", access: "space", enc: false },
      { id: "g-legacy", type: "guest", parentId: "w1", updatedAt: 1000, contentKind: "merge", access: "space", enc: false },
      { id: "col:guest:w1", type: "guest", parentId: "w1", updatedAt: 1000, contentKind: "merge", access: "space", enc: false },
    ];

    const batchedIds: string[] = [];
    const setGuests = vi.fn();
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: {
        pull: vi.fn(async () => ({ data: null, hash: null })),
        push: vi.fn(),
        batchPullMany: vi.fn(async (_collection: string, params: { objectId: string }[]) => {
          batchedIds.push(...params.map((p) => p.objectId));
          return params.map((p) => {
            if (p.objectId === "col:guest:w1") {
              return { data: { fmt: 2, items: { "g-coll": { id: "g-coll" } }, rev: { "g-coll": 5 }, tombstones: {} } };
            }
            if (p.objectId === "g-legacy") return { data: { id: "g-legacy" } };
            return { data: null };
          });
        }),
      },
      isOwnerOpen: false,
      push: vi.fn(),
    });

    // Capture the guest store's setGuests via a per-call spy is impractical (fresh spy per
    // getState). Instead assert on what was batch-pulled — the dual-read wiring.
    void setGuests;
    const { hydrateFromSpace } = await import("@/lib/space-sync");
    await hydrateFromSpace({ userId: "u1" } as never, "space-1", "w1");

    // The sentinel doc was pulled (collection path) AND the legacy node was pulled (union path).
    expect(batchedIds).toContain("col:guest:w1");
    expect(batchedIds).toContain("g-legacy");
  });

  it("hydrateSawLegacyNodes() is true when legacy per-entity nodes remain, false when clean", async () => {
    const { hydrateFromSpace, hydrateSawLegacyNodes } = await import("@/lib/space-sync");
    mockGetNodeAccessImpl = async () => ({
      encryptor: null,
      client: {
        pull: vi.fn(async () => ({ data: null, hash: null })),
        push: vi.fn(),
        batchPullMany: vi.fn(async (_c: string, params: { objectId: string }[]) => params.map(() => ({ data: null }))),
      },
      isOwnerOpen: false,
      push: vi.fn(),
    });

    // Legacy space: a per-entity guest node is present → migration needed.
    mockReadObjectTreeImpl = async () => [
      { id: "w1", type: "wedding", parentId: null, updatedAt: 1000, contentKind: "merge", access: "space", enc: false },
      { id: "g-legacy", type: "guest", parentId: "w1", updatedAt: 1000, contentKind: "merge", access: "space", enc: false },
    ];
    await hydrateFromSpace({ userId: "u1" } as never, "space-1", "w1");
    expect(hydrateSawLegacyNodes()).toBe(true);

    // Clean space: only the wedding root + a collection sentinel → nothing to migrate.
    mockReadObjectTreeImpl = async () => [
      { id: "w1", type: "wedding", parentId: null, updatedAt: 1000, contentKind: "merge", access: "space", enc: false },
      { id: "col:guest:w1", type: "guest", parentId: "w1", updatedAt: 1000, contentKind: "merge", access: "space", enc: false },
    ];
    await hydrateFromSpace({ userId: "u1" } as never, "space-1", "w1");
    expect(hydrateSawLegacyNodes()).toBe(false);
  });
});
