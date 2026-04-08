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

const { mockPull, mockPush, mockSyncManagerPull, mockSyncManagerPush } = vi.hoisted(() => ({
  mockPull: vi.fn(),
  mockPush: vi.fn(),
  mockSyncManagerPull: vi.fn(),
  mockSyncManagerPush: vi.fn(),
}));

vi.mock("@drakkar.software/starfish-client", () => ({
  // Must use `function` keyword for constructor mocks so `this` binds correctly
  StarfishClient: vi.fn(function () {
    this.pull = mockPull;
    this.push = mockPush;
  }),
  SyncManager: vi.fn(function () {
    this.pull = mockSyncManagerPull;
    this.push = mockSyncManagerPush;
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
  },
  {
    id: "g2",
    firstName: "Bob",
    lastName: "Martin",
    rsvpToken: null,
    invitationType: "COCKTAIL",
    rsvpStatus: null,
    diet: "STANDARD",
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

vi.mock("expo-crypto", () => ({
  randomUUID: vi.fn().mockReturnValue("generated-uuid"),
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

  it("uses client.pull() with the correct path", async () => {
    mockPull.mockResolvedValue({ data: mockRoster });
    await fetchRsvpRoster(SERVER, USER_ID);
    expect(mockPull).toHaveBeenCalledWith(`/pull/rsvp-roster/${USER_ID}`);
  });

  it("does NOT use SyncManager.pull() (regression: would return null on fresh instance)", async () => {
    mockPull.mockResolvedValue({ data: mockRoster });
    await fetchRsvpRoster(SERVER, USER_ID);
    expect(mockSyncManagerPull).not.toHaveBeenCalled();
  });

  it("returns the roster from result.data", async () => {
    mockPull.mockResolvedValue({ data: mockRoster });
    const result = await fetchRsvpRoster(SERVER, USER_ID);
    expect(result).toEqual(mockRoster);
    expect(result?.guests).toHaveLength(1);
    expect(result?.guests[0].firstName).toBe("Alice");
  });

  it("returns null when result.data is missing", async () => {
    mockPull.mockResolvedValue({ data: null });
    const result = await fetchRsvpRoster(SERVER, USER_ID);
    expect(result).toBeNull();
  });

  it("returns null when result.data is undefined", async () => {
    mockPull.mockResolvedValue({});
    const result = await fetchRsvpRoster(SERVER, USER_ID);
    expect(result).toBeNull();
  });

  it("returns null on network error", async () => {
    mockPull.mockRejectedValue(new Error("Network error"));
    const result = await fetchRsvpRoster(SERVER, USER_ID);
    expect(result).toBeNull();
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
    mockPush.mockReset();
    mockSyncManagerPush.mockReset();
  });

  it("uses client.push() with the correct path", async () => {
    mockPush.mockResolvedValue(undefined);
    await submitRsvp(SERVER, USER_ID, submission);
    expect(mockPush).toHaveBeenCalledWith(
      `/push/rsvp-inbox/${USER_ID}`,
      expect.objectContaining({ rsvpToken: "token-alice" })
    );
  });

  it("does NOT use SyncManager.push() (regression: would fail on fresh instance)", async () => {
    mockPush.mockResolvedValue(undefined);
    await submitRsvp(SERVER, USER_ID, submission);
    expect(mockSyncManagerPush).not.toHaveBeenCalled();
  });

  it("returns true on success", async () => {
    mockPush.mockResolvedValue(undefined);
    const result = await submitRsvp(SERVER, USER_ID, submission);
    expect(result).toBe(true);
  });

  it("returns false on network error", async () => {
    mockPush.mockRejectedValue(new Error("Network error"));
    const result = await submitRsvp(SERVER, USER_ID, submission);
    expect(result).toBe(false);
  });

  it("sends all submission fields to the server", async () => {
    mockPush.mockResolvedValue(undefined);
    await submitRsvp(SERVER, USER_ID, submission);
    expect(mockPush).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        rsvpToken: "token-alice",
        rsvpStatus: "ACCEPTED",
        diet: "VEGETARIAN",
        submittedAt: "2026-04-08T10:00:00.000Z",
      })
    );
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
});
