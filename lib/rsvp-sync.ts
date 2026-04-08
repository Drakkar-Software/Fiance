/**
 * RSVP sync — pushes guest roster to public collection,
 * polls inbox for guest responses, and merges them into the store.
 */

import { StarfishClient, SyncManager, createDedupFetch } from "@drakkar.software/starfish-client";
import { useGuestsStore } from "@/store/useGuestsStore";
import * as Crypto from "expo-crypto";

export interface RsvpRosterEntry {
  id: string;
  firstName: string;
  lastName: string;
  rsvpToken: string;
  invitationType: string;
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
  submittedAt: string;
}

/**
 * Build the public roster document from guest store state.
 * Generates rsvpToken for guests that don't have one.
 */
export function buildRsvpRoster(): RsvpRoster {
  const { guests } = useGuestsStore.getState();
  const updateGuest = useGuestsStore.getState().updateGuest;

  const rosterGuests: RsvpRosterEntry[] = guests.map((g) => {
    let token = g.rsvpToken;
    if (!token) {
      token = Crypto.randomUUID();
      updateGuest(g.id, { rsvpToken: token });
    }
    return {
      id: g.id,
      firstName: g.firstName,
      lastName: g.lastName,
      rsvpToken: token,
      invitationType: g.invitationType,
    };
  });

  return {
    version: 1,
    timestamp: new Date().toISOString(),
    guests: rosterGuests,
  };
}

/**
 * Push the roster to the rsvp-roster collection.
 */
export async function pushRsvpRoster(config: {
  serverUrl: string;
  authToken: string;
  userId: string;
}): Promise<void> {
  const client = new StarfishClient({
    baseUrl: config.serverUrl,
    auth: async () => ({ Authorization: `Bearer ${config.authToken}` }),
  });

  const roster = buildRsvpRoster();
  const syncManager = new SyncManager({
    client,
    pullPath: `/pull/rsvp-roster/${config.userId}`,
    pushPath: `/push/rsvp-roster/${config.userId}`,
  });

  await syncManager.push(roster);
}

/**
 * Fetch the public roster (for the public page, no auth).
 */
export async function fetchRsvpRoster(
  serverUrl: string,
  userId: string,
): Promise<RsvpRoster | null> {
  try {
    const client = new StarfishClient({ baseUrl: serverUrl, fetch: createDedupFetch() });
    const result = await client.pull(`/pull/rsvp-roster/${userId}`);
    return (result.data as RsvpRoster) ?? null;
  } catch {
    return null;
  }
}

/**
 * Submit an RSVP response (from the public page, no auth).
 */
export async function submitRsvp(
  serverUrl: string,
  userId: string,
  submission: RsvpSubmission,
): Promise<boolean> {
  try {
    const client = new StarfishClient({ baseUrl: serverUrl, fetch: createDedupFetch() });
    await client.push(`/push/rsvp-inbox/${userId}`, submission as unknown as Record<string, unknown>);
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetch RSVP inbox submissions (organizer only, requires auth).
 */
export async function fetchRsvpInbox(config: {
  serverUrl: string;
  authToken: string;
  userId: string;
}): Promise<RsvpSubmission[]> {
  try {
    const client = new StarfishClient({
      baseUrl: config.serverUrl,
      auth: async () => ({ Authorization: `Bearer ${config.authToken}` }),
    });
    const syncManager = new SyncManager({
      client,
      pullPath: `/pull/rsvp-inbox/${config.userId}`,
      pushPath: `/push/rsvp-inbox/${config.userId}`,
    });
    const data = await syncManager.pull();
    if (!data) return [];
    return Array.isArray(data) ? data : [data as RsvpSubmission];
  } catch {
    return [];
  }
}

/**
 * Apply RSVP submissions to the guest store.
 */
export function applyRsvpSubmissions(submissions: RsvpSubmission[]): number {
  const { guests } = useGuestsStore.getState();
  const updateGuest = useGuestsStore.getState().updateGuest;
  let applied = 0;

  for (const sub of submissions) {
    const guest = guests.find((g) => g.rsvpToken === sub.rsvpToken);
    if (!guest) continue;

    const updates: Record<string, unknown> = {
      rsvpStatus: sub.rsvpStatus,
      rsvpDate: sub.submittedAt,
    };

    if (sub.diet) updates.diet = sub.diet;
    if (sub.dietNotes) updates.dietNotes = sub.dietNotes;

    updateGuest(guest.id, updates);
    applied++;
  }

  return applied;
}
