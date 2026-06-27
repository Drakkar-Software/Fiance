/**
 * Tests for lib/rsvp-sync.ts — v3 starfish-spaces implementation.
 *
 * Tests focus on the pure helpers (rsvpNodeId, applyRsvpSubmissionsByGuestId)
 * that don't require a live session.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Guest store mock ────────────────────────────────────────────────────────

const mockUpdateGuest = vi.fn();
const mockGuests = [
  {
    id: "g1",
    firstName: "Alice",
    lastName: "Dupont",
    invitationType: "FULL",
    rsvpStatus: null as string | null,
    diet: "STANDARD",
    companionId: null as string | null,
  },
  {
    id: "g2",
    firstName: "Bob",
    lastName: "Martin",
    invitationType: "COCKTAIL",
    rsvpStatus: null as string | null,
    diet: "STANDARD",
    companionId: null as string | null,
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
  getPublicPageInviteLink: vi.fn(),
  ensurePublicPageNode: vi.fn().mockResolvedValue("pub-w1"),
}));

vi.mock("@fiance/sdk", () => ({
  updateObjectIndex: vi.fn().mockResolvedValue(undefined),
  getNodeAccess: vi.fn(),
  objInvPush: vi.fn().mockReturnValue("/objinv/path"),
  createNodeInviteLink: vi.fn().mockResolvedValue({ token: {}, link: "" }),
  rsvpToNode: vi.fn().mockReturnValue({ id: "rsvp-g1", type: "rsvp", parentId: "pub-w1", title: "", access: "invite", enc: false, contentKind: "merge" }),
}));

vi.mock("@/lib/guest-link", () => ({
  encodeGuestLink: vi.fn().mockReturnValue("https://example.com/wedding/combined-token"),
}));

import { rsvpNodeId, applyRsvpSubmissionsByGuestId, type RsvpSubmission } from "@/lib/rsvp-sync";

// ─── rsvpNodeId ──────────────────────────────────────────────────────────────

describe("rsvpNodeId", () => {
  it("derives node id from guest id", () => {
    expect(rsvpNodeId("g1")).toBe("rsvp-g1");
    expect(rsvpNodeId("abc-123")).toBe("rsvp-abc-123");
  });
});

// ─── applyRsvpSubmissionsByGuestId ───────────────────────────────────────────

describe("applyRsvpSubmissionsByGuestId", () => {
  beforeEach(() => {
    mockUpdateGuest.mockClear();
    // Reset rsvpStatus on guests
    mockGuests[0].rsvpStatus = null;
    mockGuests[1].rsvpStatus = null;
    mockGuests[0].companionId = null;
  });

  it("returns 0 for empty submissions", () => {
    expect(applyRsvpSubmissionsByGuestId([])).toBe(0);
  });

  it("skips submissions with null rsvpStatus", () => {
    const subs: RsvpSubmission[] = [{
      guestId: "g1",
      rsvpStatus: null,
      submittedAt: null,
    }];
    expect(applyRsvpSubmissionsByGuestId(subs)).toBe(0);
    expect(mockUpdateGuest).not.toHaveBeenCalled();
  });

  it("applies a matching submission by guestId and returns count", () => {
    const subs: RsvpSubmission[] = [{
      guestId: "g1",
      rsvpStatus: "ACCEPTED",
      submittedAt: "2026-04-08T10:00:00.000Z",
    }];
    const count = applyRsvpSubmissionsByGuestId(subs);
    expect(count).toBe(1);
    expect(mockUpdateGuest).toHaveBeenCalledWith("g1", expect.objectContaining({
      rsvpStatus: "ACCEPTED",
      rsvpDate: "2026-04-08T10:00:00.000Z",
    }));
  });

  it("applies diet when provided", () => {
    const subs: RsvpSubmission[] = [{
      guestId: "g1",
      rsvpStatus: "ACCEPTED",
      diet: "VEGETARIAN",
      submittedAt: "2026-04-08T10:00:00.000Z",
    }];
    applyRsvpSubmissionsByGuestId(subs);
    expect(mockUpdateGuest).toHaveBeenCalledWith("g1", expect.objectContaining({
      diet: "VEGETARIAN",
    }));
  });

  it("skips unknown guestId", () => {
    const subs: RsvpSubmission[] = [{
      guestId: "unknown-id",
      rsvpStatus: "ACCEPTED",
      submittedAt: "2026-04-08T10:00:00.000Z",
    }];
    const count = applyRsvpSubmissionsByGuestId(subs);
    expect(count).toBe(0);
    expect(mockUpdateGuest).not.toHaveBeenCalled();
  });

  it("processes multiple submissions independently", () => {
    const subs: RsvpSubmission[] = [
      { guestId: "g1", rsvpStatus: "ACCEPTED", submittedAt: "2026-04-08T10:00:00.000Z" },
      { guestId: "unknown", rsvpStatus: "DECLINED", submittedAt: "2026-04-08T11:00:00.000Z" },
    ];
    const count = applyRsvpSubmissionsByGuestId(subs);
    expect(count).toBe(1);
    expect(mockUpdateGuest).toHaveBeenCalledTimes(1);
  });

  it("applies plusOneRsvpStatus to companion via plusOneGuestId", () => {
    const subs: RsvpSubmission[] = [{
      guestId: "g1",
      rsvpStatus: "ACCEPTED",
      plusOneGuestId: "g2",
      plusOneRsvpStatus: "DECLINED",
      plusOneDiet: "VEGAN",
      submittedAt: "2026-04-08T10:00:00.000Z",
    }];
    applyRsvpSubmissionsByGuestId(subs);
    expect(mockUpdateGuest).toHaveBeenCalledWith("g2", expect.objectContaining({
      rsvpStatus: "DECLINED",
      diet: "VEGAN",
    }));
  });

  it("falls back to guest.companionId when plusOneGuestId absent", () => {
    mockGuests[0].companionId = "g2";
    const subs: RsvpSubmission[] = [{
      guestId: "g1",
      rsvpStatus: "ACCEPTED",
      plusOneRsvpStatus: "ACCEPTED",
      submittedAt: "2026-04-08T10:00:00.000Z",
    }];
    applyRsvpSubmissionsByGuestId(subs);
    expect(mockUpdateGuest).toHaveBeenCalledWith("g2", expect.objectContaining({
      rsvpStatus: "ACCEPTED",
    }));
  });
});
