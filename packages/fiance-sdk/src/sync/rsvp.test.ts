/**
 * Tests for sync/rsvp.ts — pure RSVP roster and submission helpers.
 * No store references, no Starfish client, no Expo imports.
 */
import { describe, it, expect } from "vitest";
import type { Guest } from '../domain/schema.js';
import { buildRsvpRoster, mergeSubmissions, type RsvpRoster, type RsvpSubmission } from './rsvp.js';

// ─── Fixtures ────────────────────────────────────────────────────────────────

function makeGuest(overrides: Partial<Guest> = {}): Guest {
  return {
    id: "g1",
    firstName: "Alice",
    lastName: "Dupont",
    side: null,
    invitationType: "FULL",
    rsvpStatus: "PENDING",
    rsvpDate: null,
    rsvpToken: "token-alice",
    isSleeping: null,
    childrenCount: null,
    diet: "STANDARD",
    dietNotes: null,
    groupId: null,
    tableId: null,
    companionId: null,
    noTableNeeded: null,
    giftDescription: null,
    thankYouSent: null,
    thankYouSentDate: null,
    accommodationId: null,
    roomNumber: null,
    email: null,
    phone: null,
    address: null,
    notes: null,
    shuttleVendorId: null,
    shuttlePickupLocation: null,
    shuttlePickupTime: null,
    parkingNeeded: null,
    parkingNotes: null,
    arrivalNotes: null,
    transportMode: null,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  };
}

const guestWithToken = makeGuest({ id: "g1", firstName: "Alice", lastName: "Dupont", rsvpToken: "token-alice", invitationType: "FULL" });
const guestWithoutToken = makeGuest({ id: "g2", firstName: "Bob", lastName: "Martin", rsvpToken: null, invitationType: "COCKTAIL" });

// ─── buildRsvpRoster ─────────────────────────────────────────────────────────

describe("buildRsvpRoster", () => {
  it("only includes guests with a rsvpToken", () => {
    const roster = buildRsvpRoster([guestWithToken, guestWithoutToken]);
    expect(roster.guests).toHaveLength(1);
    expect(roster.guests[0].id).toBe("g1");
  });

  it("preserves existing rsvpToken for guests that have one", () => {
    const roster = buildRsvpRoster([guestWithToken]);
    expect(roster.guests[0].rsvpToken).toBe("token-alice");
  });

  it("sets version to 1 and includes a timestamp", () => {
    const roster = buildRsvpRoster([guestWithToken]);
    expect(roster.version).toBe(1);
    expect(new Date(roster.timestamp).getTime()).toBeGreaterThan(0);
  });

  it("includes required fields per entry", () => {
    const roster = buildRsvpRoster([guestWithToken]);
    for (const entry of roster.guests) {
      expect(entry.id).toBeDefined();
      expect(entry.firstName).toBeDefined();
      expect(entry.lastName).toBeDefined();
      expect(entry.rsvpToken).toBeDefined();
      expect(entry.invitationType).toBeDefined();
    }
  });

  it("returns empty guest list when all guests lack tokens", () => {
    const roster = buildRsvpRoster([guestWithoutToken]);
    expect(roster.guests).toHaveLength(0);
  });

  it("returns empty roster for empty guest array", () => {
    const roster = buildRsvpRoster([]);
    expect(roster.guests).toHaveLength(0);
    expect(roster.version).toBe(1);
  });
});

// ─── mergeSubmissions ─────────────────────────────────────────────────────────

describe("mergeSubmissions", () => {
  it("returns unchanged guests and 0 applied for empty submissions", () => {
    const guests = [guestWithToken];
    const { guests: result, applied } = mergeSubmissions(guests, []);
    expect(applied).toBe(0);
    expect(result).toEqual(guests);
  });

  it("applies a matching submission and returns count", () => {
    const subs: RsvpSubmission[] = [{
      rsvpToken: "token-alice",
      rsvpStatus: "ACCEPTED",
      submittedAt: "2026-04-08T10:00:00.000Z",
    }];
    const { guests: result, applied } = mergeSubmissions([guestWithToken], subs);
    expect(applied).toBe(1);
    const alice = result.find((g) => g.id === "g1");
    expect(alice?.rsvpStatus).toBe("ACCEPTED");
    expect(alice?.rsvpDate).toBe("2026-04-08T10:00:00.000Z");
  });

  it("applies diet when provided", () => {
    const subs: RsvpSubmission[] = [{
      rsvpToken: "token-alice",
      rsvpStatus: "ACCEPTED",
      diet: "VEGETARIAN",
      submittedAt: "2026-04-08T10:00:00.000Z",
    }];
    const { guests: result } = mergeSubmissions([guestWithToken], subs);
    const alice = result.find((g) => g.id === "g1");
    expect(alice?.diet).toBe("VEGETARIAN");
  });

  it("skips unknown rsvpToken", () => {
    const subs: RsvpSubmission[] = [{
      rsvpToken: "unknown-token",
      rsvpStatus: "ACCEPTED",
      submittedAt: "2026-04-08T10:00:00.000Z",
    }];
    const { guests: result, applied } = mergeSubmissions([guestWithToken], subs);
    expect(applied).toBe(0);
    expect(result[0].rsvpStatus).toBe("PENDING"); // unchanged
  });

  it("processes multiple submissions independently", () => {
    const bob = makeGuest({ id: "g2", rsvpToken: "token-bob", rsvpStatus: "PENDING" });
    const subs: RsvpSubmission[] = [
      { rsvpToken: "token-alice", rsvpStatus: "ACCEPTED", submittedAt: "2026-04-08T10:00:00.000Z" },
      { rsvpToken: "unknown", rsvpStatus: "DECLINED", submittedAt: "2026-04-08T11:00:00.000Z" },
    ];
    const { applied } = mergeSubmissions([guestWithToken, bob], subs);
    expect(applied).toBe(1);
  });

  it("does not mutate original guests array", () => {
    const original = [guestWithToken];
    const subs: RsvpSubmission[] = [{
      rsvpToken: "token-alice",
      rsvpStatus: "ACCEPTED",
      submittedAt: "2026-04-08T10:00:00.000Z",
    }];
    const { guests: result } = mergeSubmissions(original, subs);
    expect(result).not.toBe(original);
    expect(original[0].rsvpStatus).toBe("PENDING"); // original unchanged
  });
});
