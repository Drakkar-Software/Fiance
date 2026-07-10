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
    rsvpDate: null as string | null,
    diet: "STANDARD",
    companionId: null as string | null,
  },
  {
    id: "g2",
    firstName: "Bob",
    lastName: "Martin",
    invitationType: "COCKTAIL",
    rsvpStatus: null as string | null,
    rsvpDate: null as string | null,
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
    // Reset rsvpStatus/rsvpDate on guests
    mockGuests[0].rsvpStatus = null;
    mockGuests[1].rsvpStatus = null;
    mockGuests[0].rsvpDate = null;
    mockGuests[1].rsvpDate = null;
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

// ─── Bug A regression: idempotent re-apply — a manual edit must not be reverted ────
//
// applyRsvpSubmissionsByGuestId runs on EVERY hydrate and EVERY app foreground
// (space-sync.ts's pullAndApplyRsvpNodes / providers.tsx's refreshRsvpInbox), not just
// once. Before the fix it unconditionally called updateGuest with the submission's
// values, so a manual edit made on another device (or by the couple, overriding a
// guest's response) got silently reverted back to the stale public-page submission on
// the very next foreground — and updateGuest's notifySync() re-pushed the reverted
// value, clobbering the edit on the server too. The fix: only apply a submission when
// it is strictly newer (by ISO-8601 string compare) than the guest's stored rsvpDate.

describe("applyRsvpSubmissionsByGuestId — idempotent re-apply (Bug A regression)", () => {
  beforeEach(() => {
    mockUpdateGuest.mockClear();
    mockGuests[0].rsvpStatus = null;
    mockGuests[1].rsvpStatus = null;
    mockGuests[0].rsvpDate = null;
    mockGuests[1].rsvpDate = null;
    mockGuests[0].companionId = null;
  });

  it("does NOT revert a guest whose rsvpDate is newer than the incoming submission (manual edit wins)", () => {
    // Simulates: guest already responded via the public link (old submission), then the
    // couple manually changed the status locally, stamping a fresh rsvpDate.
    mockGuests[0].rsvpStatus = "ACCEPTED";
    mockGuests[0].rsvpDate = "2026-04-10T12:00:00.000Z"; // newer local edit
    const subs: RsvpSubmission[] = [{
      guestId: "g1",
      rsvpStatus: "DECLINED", // stale public submission
      diet: "VEGETARIAN",
      submittedAt: "2026-04-08T10:00:00.000Z", // older than guest.rsvpDate
    }];

    const count = applyRsvpSubmissionsByGuestId(subs);

    expect(count).toBe(0);
    expect(mockUpdateGuest).not.toHaveBeenCalled();
    // Guest state itself is untouched (updateGuest never ran).
    expect(mockGuests[0].rsvpStatus).toBe("ACCEPTED");
    expect(mockGuests[0].rsvpDate).toBe("2026-04-10T12:00:00.000Z");
  });

  it("does NOT revert on repeated re-apply — calling it again is a true no-op", () => {
    mockGuests[0].rsvpStatus = "ACCEPTED";
    mockGuests[0].rsvpDate = "2026-04-10T12:00:00.000Z";
    const subs: RsvpSubmission[] = [{
      guestId: "g1",
      rsvpStatus: "DECLINED",
      submittedAt: "2026-04-08T10:00:00.000Z",
    }];

    // Simulate the real bug trigger: this runs on every foreground.
    applyRsvpSubmissionsByGuestId(subs);
    applyRsvpSubmissionsByGuestId(subs);
    applyRsvpSubmissionsByGuestId(subs);

    expect(mockUpdateGuest).not.toHaveBeenCalled();
  });

  it("applies a submission strictly newer than the guest's stored rsvpDate", () => {
    mockGuests[0].rsvpStatus = "PENDING";
    mockGuests[0].rsvpDate = "2026-04-01T00:00:00.000Z"; // stale
    const subs: RsvpSubmission[] = [{
      guestId: "g1",
      rsvpStatus: "ACCEPTED",
      submittedAt: "2026-04-08T10:00:00.000Z", // newer — a genuine re-submission
    }];

    const count = applyRsvpSubmissionsByGuestId(subs);

    expect(count).toBe(1);
    expect(mockUpdateGuest).toHaveBeenCalledWith("g1", expect.objectContaining({
      rsvpStatus: "ACCEPTED",
      rsvpDate: "2026-04-08T10:00:00.000Z",
    }));
  });

  it("applies when the guest has no stored rsvpDate yet (first submission ever)", () => {
    mockGuests[0].rsvpDate = null;
    const subs: RsvpSubmission[] = [{
      guestId: "g1",
      rsvpStatus: "ACCEPTED",
      submittedAt: "2026-04-08T10:00:00.000Z",
    }];

    const count = applyRsvpSubmissionsByGuestId(subs);

    expect(count).toBe(1);
    expect(mockUpdateGuest).toHaveBeenCalledWith("g1", expect.objectContaining({
      rsvpStatus: "ACCEPTED",
    }));
  });

  it("treats an equal submittedAt/rsvpDate as already-applied (skips, no re-push)", () => {
    mockGuests[0].rsvpStatus = "ACCEPTED";
    mockGuests[0].rsvpDate = "2026-04-08T10:00:00.000Z";
    const subs: RsvpSubmission[] = [{
      guestId: "g1",
      rsvpStatus: "ACCEPTED",
      submittedAt: "2026-04-08T10:00:00.000Z", // same instant — already applied
    }];

    const count = applyRsvpSubmissionsByGuestId(subs);

    expect(count).toBe(0);
    expect(mockUpdateGuest).not.toHaveBeenCalled();
  });

  it("companion guard: skips reverting a companion whose rsvpDate is newer, independent of the primary guest", () => {
    // Primary guest g1 has never responded — its own update still applies.
    mockGuests[0].rsvpDate = null;
    // Companion g2 already has a newer manual edit and must not be reverted.
    mockGuests[1].rsvpStatus = "ACCEPTED";
    mockGuests[1].rsvpDate = "2026-04-10T12:00:00.000Z";

    const subs: RsvpSubmission[] = [{
      guestId: "g1",
      rsvpStatus: "ACCEPTED",
      plusOneGuestId: "g2",
      plusOneRsvpStatus: "DECLINED", // stale — must not revert g2
      submittedAt: "2026-04-08T10:00:00.000Z", // older than g2.rsvpDate
    }];

    applyRsvpSubmissionsByGuestId(subs);

    // g1 (primary) updated normally.
    expect(mockUpdateGuest).toHaveBeenCalledWith("g1", expect.objectContaining({
      rsvpStatus: "ACCEPTED",
    }));
    // g2 (companion) NOT reverted.
    expect(mockUpdateGuest).not.toHaveBeenCalledWith("g2", expect.anything());
  });

  it("companion guard: still applies a companion update that is genuinely newer", () => {
    mockGuests[0].rsvpDate = null;
    mockGuests[1].rsvpStatus = "PENDING";
    mockGuests[1].rsvpDate = "2026-04-01T00:00:00.000Z"; // stale

    const subs: RsvpSubmission[] = [{
      guestId: "g1",
      rsvpStatus: "ACCEPTED",
      plusOneGuestId: "g2",
      plusOneRsvpStatus: "ACCEPTED",
      submittedAt: "2026-04-08T10:00:00.000Z", // newer than g2.rsvpDate
    }];

    applyRsvpSubmissionsByGuestId(subs);

    expect(mockUpdateGuest).toHaveBeenCalledWith("g2", expect.objectContaining({
      rsvpStatus: "ACCEPTED",
    }));
  });
});
