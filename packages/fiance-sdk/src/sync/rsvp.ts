/**
 * RSVP sync — pure types and transforms.
 * No React hooks, no store references, no Expo imports.
 * The app-side lib/rsvp-sync.ts handles store reads, Crypto, and Starfish calls.
 */

// NodeNext .js extension required
import type { Guest } from '../domain/schema.js';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface RsvpRosterEntry {
  id: string;
  firstName: string;
  lastName: string;
  rsvpToken: string;
  invitationType: string;
  companionId?: string | null;
}

export interface RsvpRoster {
  version: 1;
  timestamp: string;
  guests: RsvpRosterEntry[];
}

export interface RsvpSubmission {
  rsvpToken: string;
  rsvpStatus: string;
  diet?: string;
  dietNotes?: string;
  plusOneRsvpStatus?: string;
  plusOneDiet?: string;
  childrenCount?: number;
  submittedAt: string;
}

// ─── Pure builders ───────────────────────────────────────────────────────────

/**
 * Build the public roster document from a guest array.
 * Guests without an rsvpToken are mapped with their existing token (null/undefined).
 * Token assignment (if needed) must be done app-side before calling this.
 */
export function buildRsvpRoster(guests: Guest[]): RsvpRoster {
  const rosterGuests: RsvpRosterEntry[] = guests
    .filter((g): g is Guest & { rsvpToken: string } => typeof g.rsvpToken === "string" && g.rsvpToken.length > 0)
    .map((g) => ({
      id: g.id,
      firstName: g.firstName,
      lastName: g.lastName,
      rsvpToken: g.rsvpToken,
      invitationType: g.invitationType,
      companionId: g.companionId ?? null,
    }));

  return {
    version: 1,
    timestamp: new Date().toISOString(),
    guests: rosterGuests,
  };
}

/**
 * Apply RSVP submissions to a guest array (pure transform).
 * Returns updated guests array + count of applied submissions.
 */
export function mergeSubmissions(
  guests: Guest[],
  submissions: RsvpSubmission[]
): { guests: Guest[]; applied: number } {
  let applied = 0;
  const updatedGuests = [...guests];

  for (const sub of submissions) {
    const idx = updatedGuests.findIndex((g) => g.rsvpToken === sub.rsvpToken);
    if (idx < 0) continue;

    const guest = updatedGuests[idx];
    const updates: Partial<Guest> = {
      rsvpStatus: sub.rsvpStatus,
      rsvpDate: sub.submittedAt,
    };
    if (sub.diet) updates.diet = sub.diet;
    if (sub.dietNotes) updates.dietNotes = sub.dietNotes;
    if (sub.childrenCount != null) updates.childrenCount = sub.childrenCount;

    updatedGuests[idx] = { ...guest, ...updates };
    applied++;

    // Apply +1 companion RSVP if provided
    if (sub.plusOneRsvpStatus && guest.companionId) {
      const cIdx = updatedGuests.findIndex((g) => g.id === guest.companionId);
      if (cIdx >= 0) {
        const companionUpdates: Partial<Guest> = {
          rsvpStatus: sub.plusOneRsvpStatus,
          rsvpDate: sub.submittedAt,
        };
        if (sub.plusOneDiet) companionUpdates.diet = sub.plusOneDiet;
        updatedGuests[cIdx] = { ...updatedGuests[cIdx], ...companionUpdates };
      }
    }
  }

  return { guests: updatedGuests, applied };
}
