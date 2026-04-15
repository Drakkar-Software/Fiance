/**
 * RSVP sync — pushes guest roster to public collection,
 * polls inbox for guest responses, and merges them into the store.
 */

import { useEffect, useState } from "react";
import { StarfishClient, SyncManager, createDedupFetch } from "@drakkar.software/starfish-client";
import { useGuestsStore } from "@/store/useGuestsStore";
import * as Crypto from "expo-crypto";
import { buildWeddingPageUrl } from "@/lib/identity";
import { deriveUserId } from "@/lib/server";
import type { WeddingRegistryEntry } from "@/lib/wedding-registry";

/**
 * Pre-build a guest's personal RSVP URL from the wedding seed phrase.
 * Generates and persists an rsvpToken for the guest if they don't have one.
 * Returns null until the async derivation completes.
 *
 * Must be called at render time (not inside an event handler) so that the
 * result is available synchronously when the user taps the share button —
 * clipboard/share APIs require an unbroken user-gesture context on web.
 */
export function useGuestRsvpUrl(
  guestId: string | undefined,
  activeEntry: WeddingRegistryEntry | undefined,
): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!guestId || !activeEntry?.seedPhrase) return;
    let cancelled = false;
    (async () => {
      const userId = await deriveUserId(activeEntry.seedPhrase!);
      if (cancelled) return;
      const baseUrl = buildWeddingPageUrl(userId);
      const { guests, updateGuest } = useGuestsStore.getState();
      let token = guests.find((g) => g.id === guestId)?.rsvpToken;
      if (!token) {
        token = Crypto.randomUUID();
        updateGuest(guestId, { rsvpToken: token });
      }
      if (!cancelled) setUrl(`${baseUrl}?token=${token}`);
    })();
    return () => { cancelled = true; };
  }, [guestId, activeEntry?.seedPhrase]);

  return url;
}

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
      companionId: g.companionId ?? null,
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

  await syncManager.push(roster as unknown as Record<string, unknown>);
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
    return (result.data as unknown as RsvpRoster) ?? null;
  } catch {
    return null;
  }
}

/**
 * Submit an RSVP response (from the public page, no auth).
 * Uses SyncManager.update() which handles pull→merge→push with conflict retry.
 */
export async function submitRsvp(
  serverUrl: string,
  userId: string,
  submission: RsvpSubmission,
): Promise<boolean> {
  try {
    const client = new StarfishClient({ baseUrl: serverUrl, fetch: createDedupFetch() });
    const syncManager = new SyncManager({
      client,
      pullPath: `/pull/rsvp-inbox/${userId}`,
      pushPath: `/push/rsvp-inbox/${userId}`,
    });
    await syncManager.update((current) => {
      const submissions = Array.isArray(current.submissions)
        ? [...current.submissions] as RsvpSubmission[]
        : [];
      const idx = submissions.findIndex((s) => s.rsvpToken === submission.rsvpToken);
      if (idx >= 0) submissions[idx] = submission;
      else submissions.push(submission);
      return { submissions };
    });
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
    const result = await client.pull(`/pull/rsvp-inbox/${config.userId}`);
    const doc = result.data as { submissions?: unknown[] } | null;
    if (!doc || !Array.isArray(doc.submissions)) return [];
    return doc.submissions as RsvpSubmission[];
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
    if (sub.childrenCount != null) updates.childrenCount = sub.childrenCount;

    updateGuest(guest.id, updates);
    applied++;

    // Apply +1 companion RSVP if provided
    if (sub.plusOneRsvpStatus && guest.companionId) {
      const companionUpdates: Record<string, unknown> = {
        rsvpStatus: sub.plusOneRsvpStatus,
        rsvpDate: sub.submittedAt,
      };
      if (sub.plusOneDiet) companionUpdates.diet = sub.plusOneDiet;
      updateGuest(guest.companionId, companionUpdates);
    }
  }

  return applied;
}
