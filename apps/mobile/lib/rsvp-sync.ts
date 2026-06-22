/**
 * RSVP sync — STUBBED for octospaces v3 migration.
 *
 * The v2 StarfishClient/SyncManager-based implementation is removed.
 * In B5 this will be replaced by:
 *  - Per-guest `rsvp` ObjectNodes (access:'invite', enc:false)
 *  - `createNodeInviteLink` for per-guest RSVP URLs
 *  - `readNodeWithLinkCap` / `writeNodeWithLinkCap` on the guest page
 *
 * Exported types and pure helpers are kept unchanged (used by the public page).
 * Network functions return safe no-op values.
 */

import { useEffect, useState } from "react";
import { useGuestsStore } from "@/store/useGuestsStore";
import * as Crypto from "expo-crypto";
import { buildWeddingPageUrl } from "@/lib/identity";
import { deriveUserId } from "@/lib/server";
import type { WeddingRegistryEntry } from "@/lib/wedding-registry";

// ---------------------------------------------------------------------------
// Types — unchanged
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Hooks — kept, but rsvpToken URLs are deprecated (will use invite links in B5)
// ---------------------------------------------------------------------------

/** @deprecated Will use per-guest invite links in B5. */
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

// ---------------------------------------------------------------------------
// Pure helpers — kept unchanged
// ---------------------------------------------------------------------------

/** Build the public roster document from guest store state. */
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

  return { version: 1, timestamp: new Date().toISOString(), guests: rosterGuests };
}

/** Apply RSVP submissions to the guest store. */
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
    if (sub.plusOneRsvpStatus && guest.companionId) {
      const companionUpdates: Record<string, unknown> = { rsvpStatus: sub.plusOneRsvpStatus, rsvpDate: sub.submittedAt };
      if (sub.plusOneDiet) companionUpdates.diet = sub.plusOneDiet;
      updateGuest(guest.companionId, companionUpdates);
    }
  }
  return applied;
}

// ---------------------------------------------------------------------------
// Network stubs — TODO(B5): replace with ObjectNode invite-cap reads/writes
// ---------------------------------------------------------------------------

/** @deprecated TODO(B5): push to objinv node instead of flat collection. */
export async function pushRsvpRoster(_config: {
  serverUrl: string;
  authToken: string;
  userId: string;
}): Promise<void> {
  console.warn('[rsvp-sync] pushRsvpRoster not implemented in v3 — migrate to B5 invite nodes');
}

/** @deprecated TODO(B5): read from objinv node via readNodeWithLinkCap. */
export async function fetchRsvpRoster(
  _serverUrl: string,
  _userId: string,
): Promise<RsvpRoster | null> {
  return null;
}

/** @deprecated TODO(B5): write to objinv node via writeNodeWithLinkCap. */
export async function submitRsvp(
  _serverUrl: string,
  _userId: string,
  _submission: RsvpSubmission,
): Promise<boolean> {
  return false;
}

/** @deprecated TODO(B5): read rsvp responses from objinv node. */
export async function fetchRsvpInbox(_config: {
  serverUrl: string;
  authToken: string;
  userId: string;
}): Promise<RsvpSubmission[]> {
  return [];
}
