/**
 * Tests for lib/rsvp-sync.ts
 *
 * Key regression: fetchRsvpRoster and submitRsvp must use client.pull/push
 * directly (not SyncManager) so they work without prior state on the public page.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Starfish mock ───────────────────────────────────────────────────────────
// vi.mock is hoisted above variable declarations, so mocks must be defined
// with vi.hoisted() to be available inside the mock factory.

const { mockPull, mockPush, mockSyncManagerPull, mockSyncManagerPush, mockSyncManagerUpdate } = vi.hoisted(() => ({
  mockPull: vi.fn(),
  mockPush: vi.fn(),
  mockSyncManagerPull: vi.fn(),
  mockSyncManagerPush: vi.fn(),
  mockSyncManagerUpdate: vi.fn(),
}));

vi.mock("@drakkar.software/starfish-client", () => ({
  // Must use `function` keyword for constructor mocks so `this` binds correctly
  StarfishClient: vi.fn(function (this: Record<string, unknown>) {
    this.pull = mockPull;
    this.push = mockPush;
  }),
  SyncManager: vi.fn(function (this: Record<string, unknown>) {
    this.pull = mockSyncManagerPull;
    this.push = mockSyncManagerPush;
    this.update = mockSyncManagerUpdate;
  }),
  createDedupFetch: vi.fn().mockReturnValue(undefined),
}));

// ─── Guest store mock ────────────────────────────────────────────────────────

const mockUpdateGuest = vi.fn();
const mockGuests = [
  {
    id: "g1",
    firstName: "Alice",
    lastName: "Dupont",
    rsvpToken: "token-alice",
    invitationType: "FULL",
    rsvpStatus: null,
    diet: "STANDARD",
    companionId: null,
  },
  {
    id: "g2",
    firstName: "Bob",
    lastName: "Martin",
    rsvpToken: null,
    invitationType: "COCKTAIL",
    rsvpStatus: null,
    diet: "STANDARD",
    companionId: null,
  },
];

vi.mock("@/store/useGuestsStore", () => ({
  useGuestsStore: {
    getState: () => ({
      guests: mockGuests,
      updateGuest: mockUpdateGuest,
    }),
  },
}));

vi.mock("react-native", () => ({
  Platform: { OS: "ios" },
}));

vi.mock("@/lib/public-page", () => ({
  publicPageNodeId: (weddingNodeId: string) => `pub-${weddingNodeId}`,
}));

vi.mock("@fiance/sdk", () => ({
  updateObjectIndex: vi.fn().mockResolvedValue(undefined),
  getNodeAccess: vi.fn(),
  objInvPush: vi.fn().mockReturnValue("/objinv/path"),
  createNodeInviteLink: vi.fn().mockResolvedValue({ token: {}, link: "" }),
  encodeNodeInviteLink: vi.fn().mockReturnValue("exp://#encoded-token"),
  rsvpToNode: vi.fn().mockReturnValue({ id: "rsvp-g1", type: "rsvp", parentId: "pub-w1", title: "", access: "invite", enc: false, contentKind: "merge" }),
}));

vi.mock("expo-crypto", () => ({
  randomUUID: vi.fn().mockReturnValue("generated-uuid"),
}));

vi.mock("@/lib/identity", () => ({
  deriveAuthToken: vi.fn().mockResolvedValue("mock-auth-token"),
  buildWeddingPageUrl: vi.fn().mockReturnValue("https://example.com/wedding/mock"),
}));

import {
  fetchRsvpRoster,
  submitRsvp,
  buildRsvpRoster,
  applyRsvpSubmissions,
} from "@/lib/rsvp-sync";
import type { RsvpRoster, RsvpSubmission } from "@/lib/rsvp-sync";

// ─── fetchRsvpRoster ─────────────────────────────────────────────────────────

describe("fetchRsvpRoster", () => {
  const SERVER = "https://sync.example.com";
  const USER_ID = "abc123";

  const mockRoster: RsvpRoster = {
    version: 1,
    timestamp: "2026-04-08T10:00:00.000Z",
    guests: [
      { id: "g1", firstName: "Alice", lastName: "Dupont", rsvpToken: "token-alice", invitationType: "FULL" },
    ],
  };

  beforeEach(() => {
    mockPull.mockReset();
    mockSyncManagerPull.mockReset();
  });

  // TODO(B5): these tests will be rewritten with readNodeWithLinkCap when the
  // objinv node invite flow is implemented. For now the function is a stub.
  it("returns null (B5 stub — not yet implemented in v3)", async () => {
    const result = await fetchRsvpRoster(SERVER, USER_ID);
    expect(result).toBeNull();
  });

  it("does NOT use SyncManager.pull() (removed in v3)", async () => {
    await fetchRsvpRoster(SERVER, USER_ID);
    expect(mockSyncManagerPull).not.toHaveBeenCalled();
  });
});

// ─── submitRsvp ─────────────────────────────────────────────────────────────

describe("submitRsvp", () => {
  const SERVER = "https://sync.example.com";
  const USER_ID = "abc123";

  const submission: RsvpSubmission = {
    rsvpToken: "token-alice",
    rsvpStatus: "ACCEPTED",
    diet: "VEGETARIAN",
    submittedAt: "2026-04-08T10:00:00.000Z",
  };

  beforeEach(() => {
    mockSyncManagerUpdate.mockReset();
  });

  // TODO(B5): these tests will be rewritten with writeNodeWithLinkCap when the
  // per-guest RSVP node invite flow is implemented. For now the function is a stub.
  it("returns false (B5 stub — not yet implemented in v3)", async () => {
    const result = await submitRsvp(SERVER, USER_ID, submission);
    expect(result).toBe(false);
  });

  it("does NOT use SyncManager.update() (removed in v3)", async () => {
    await submitRsvp(SERVER, USER_ID, submission);
    expect(mockSyncManagerUpdate).not.toHaveBeenCalled();
  });
});

// ─── buildRsvpRoster ─────────────────────────────────────────────────────────

describe("buildRsvpRoster", () => {
  it("includes all guests from the store", () => {
    const roster = buildRsvpRoster();
    expect(roster.guests).toHaveLength(2);
  });

  it("preserves existing rsvpToken for guests that have one", () => {
    const roster = buildRsvpRoster();
    const alice = roster.guests.find((g) => g.id === "g1");
    expect(alice?.rsvpToken).toBe("token-alice");
  });

  it("generates a rsvpToken for guests without one", () => {
    const roster = buildRsvpRoster();
    const bob = roster.guests.find((g) => g.id === "g2");
    expect(bob?.rsvpToken).toBe("generated-uuid");
  });

  it("calls updateGuest to persist the generated token", () => {
    buildRsvpRoster();
    expect(mockUpdateGuest).toHaveBeenCalledWith("g2", { rsvpToken: "generated-uuid" });
  });

  it("does not call updateGuest for guests who already have a token", () => {
    mockUpdateGuest.mockClear();
    buildRsvpRoster();
    const calls = mockUpdateGuest.mock.calls;
    expect(calls.every(([id]) => id !== "g1")).toBe(true);
  });

  it("sets version to 1 and includes a timestamp", () => {
    const roster = buildRsvpRoster();
    expect(roster.version).toBe(1);
    expect(new Date(roster.timestamp).getTime()).toBeGreaterThan(0);
  });

  it("includes required fields per entry", () => {
    const roster = buildRsvpRoster();
    for (const entry of roster.guests) {
      expect(entry.id).toBeDefined();
      expect(entry.firstName).toBeDefined();
      expect(entry.lastName).toBeDefined();
      expect(entry.rsvpToken).toBeDefined();
      expect(entry.invitationType).toBeDefined();
    }
  });
});

// ─── applyRsvpSubmissions ────────────────────────────────────────────────────

describe("applyRsvpSubmissions", () => {
  beforeEach(() => mockUpdateGuest.mockClear());

  it("returns 0 for empty submissions", () => {
    expect(applyRsvpSubmissions([])).toBe(0);
  });

  it("applies a matching submission and returns count", () => {
    const subs: RsvpSubmission[] = [{
      rsvpToken: "token-alice",
      rsvpStatus: "ACCEPTED",
      submittedAt: "2026-04-08T10:00:00.000Z",
    }];
    const count = applyRsvpSubmissions(subs);
    expect(count).toBe(1);
    expect(mockUpdateGuest).toHaveBeenCalledWith("g1", expect.objectContaining({
      rsvpStatus: "ACCEPTED",
      rsvpDate: "2026-04-08T10:00:00.000Z",
    }));
  });

  it("applies diet when provided", () => {
    const subs: RsvpSubmission[] = [{
      rsvpToken: "token-alice",
      rsvpStatus: "ACCEPTED",
      diet: "VEGETARIAN",
      submittedAt: "2026-04-08T10:00:00.000Z",
    }];
    applyRsvpSubmissions(subs);
    expect(mockUpdateGuest).toHaveBeenCalledWith("g1", expect.objectContaining({
      diet: "VEGETARIAN",
    }));
  });

  it("skips unknown rsvpToken", () => {
    const subs: RsvpSubmission[] = [{
      rsvpToken: "unknown-token",
      rsvpStatus: "ACCEPTED",
      submittedAt: "2026-04-08T10:00:00.000Z",
    }];
    const count = applyRsvpSubmissions(subs);
    expect(count).toBe(0);
    expect(mockUpdateGuest).not.toHaveBeenCalled();
  });

  it("processes multiple submissions independently", () => {
    const subs: RsvpSubmission[] = [
      { rsvpToken: "token-alice", rsvpStatus: "ACCEPTED", submittedAt: "2026-04-08T10:00:00.000Z" },
      { rsvpToken: "unknown", rsvpStatus: "DECLINED", submittedAt: "2026-04-08T11:00:00.000Z" },
    ];
    const count = applyRsvpSubmissions(subs);
    expect(count).toBe(1);
    expect(mockUpdateGuest).toHaveBeenCalledTimes(1);
  });

  it("applies plusOneRsvpStatus to companion when companionId is set", () => {
    // Temporarily give Alice a companionId
    const originalCompanionId = mockGuests[0].companionId;
    (mockGuests[0] as any).companionId = "g-companion";

    const subs: RsvpSubmission[] = [{
      rsvpToken: "token-alice",
      rsvpStatus: "ACCEPTED",
      plusOneRsvpStatus: "DECLINED",
      plusOneDiet: "VEGAN",
      submittedAt: "2026-04-08T10:00:00.000Z",
    }];
    applyRsvpSubmissions(subs);
    expect(mockUpdateGuest).toHaveBeenCalledWith("g-companion", expect.objectContaining({
      rsvpStatus: "DECLINED",
      diet: "VEGAN",
    }));

    (mockGuests[0] as any).companionId = originalCompanionId;
  });
});
