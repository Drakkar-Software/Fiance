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
import { Platform } from "react-native";
import { useGuestsStore } from "@/store/useGuestsStore";
import * as Crypto from "expo-crypto";
import { buildWeddingPageUrl } from "@/lib/identity";
import { deriveUserId } from "@/lib/server";
import type { WeddingRegistryEntry } from "@/lib/wedding-registry";
import {
  updateObjectIndex,
  getNodeAccess,
  objInvPush,
  createNodeInviteLink,
  encodeNodeInviteLink,
  rsvpToNode,
  type Session,
  type ObjectNode,
} from "@fiance/sdk";
import { publicPageNodeId } from "@/lib/public-page";

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

/**
 * Returns the RSVP invite link URL for a guest (v3 ObjectNode invite link).
 * Falls back to legacy token URL if session/spaceId are not available.
 */
export function useGuestRsvpUrl(
  guestId: string | undefined,
  activeEntry: WeddingRegistryEntry | undefined,
): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!guestId || !activeEntry?.seedPhrase) return;
    let cancelled = false;

    // Try v3 invite link first (requires active session + spaceId).
    import("@/lib/starfish").then(({ getActiveSession, getActiveSpaceId, getActiveWeddingNodeId }) => {
      const session = getActiveSession();
      const spaceId = getActiveSpaceId();
      const weddingNodeId = getActiveWeddingNodeId();

      if (session && spaceId && weddingNodeId && guestId && !cancelled) {
        const guests = useGuestsStore.getState().guests;
        const guest = guests.find((g) => g.id === guestId);
        const guestName = guest ? `${guest.firstName} ${guest.lastName}`.trim() : guestId;
        (async () => {
          try {
            const nodeId = await ensureRsvpNode(session, spaceId, weddingNodeId, guestId);
            if (!cancelled) {
              const link = await getRsvpInviteLink(session, spaceId, nodeId, guestName);
              if (!cancelled) setUrl(link);
            }
          } catch {
            // Fall through to legacy path
          }
        })();
        return;
      }

      // Legacy fallback: token-based URL
      if (!activeEntry?.seedPhrase) return;
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
    }).catch(() => {});

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
// B5: RSVP ObjectNode management (owner-side)
// ---------------------------------------------------------------------------

/** Derive the `rsvp` ObjectNode ID from the guest entity ID. */
export function rsvpNodeId(guestId: string): string {
  return `rsvp-${guestId}`;
}

/**
 * Ensure the RSVP ObjectNode for a guest exists in the space index.
 * Idempotent. Returns the rsvp nodeId.
 */
export async function ensureRsvpNode(
  session: Session,
  spaceId: string,
  weddingNodeId: string,
  guestId: string,
): Promise<string> {
  const nodeId = rsvpNodeId(guestId);
  const pageNodeId = publicPageNodeId(weddingNodeId);
  const desc = rsvpToNode(nodeId, pageNodeId, guestId);

  await updateObjectIndex(session, spaceId, (nodes, now) => {
    const exists = nodes.some((n) => n.id === nodeId);
    if (exists) return null;
    const node: ObjectNode = {
      id: desc.id,
      type: desc.type,
      parentId: desc.parentId,
      order: nodes.length,
      title: desc.title,
      updatedAt: now,
      contentKind: desc.contentKind,
      access: desc.access,
      enc: desc.enc,
      meta: desc.meta,
    };
    return [...nodes, node];
  });

  return nodeId;
}

/**
 * Seed the RSVP node content with initial status so guests can read it.
 * Called after `ensureRsvpNode` to publish the initial empty RSVP record.
 */
export async function seedRsvpNodeContent(
  session: Session,
  spaceId: string,
  nodeId: string,
  guestId: string,
): Promise<void> {
  const handle = await getNodeAccess(
    spaceId,
    nodeId,
    { access: "invite", enc: false },
    session,
    null,
  );
  const initial = { guestId, rsvpStatus: null, submittedAt: null };
  await handle.client.push(
    objInvPush(spaceId, nodeId),
    initial as unknown as Record<string, unknown>,
    null,
  );
}

/**
 * Generate a write-capable invite link for a guest's RSVP node.
 * Returns the full URL: `${appOrigin}/wedding/${fragment}` where fragment
 * is the base64url-encoded NodeInviteLinkToken for the rsvp node.
 */
function getAppOrigin(): string {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return window.location.origin;
  }
  return "exp://";
}

export async function getRsvpInviteLink(
  session: Session,
  spaceId: string,
  rsvpNodeId: string,
  guestName: string,
): Promise<string> {
  const origin = getAppOrigin();
  const { token } = await createNodeInviteLink(
    session,
    spaceId,
    rsvpNodeId,
    guestName,
    { enc: false },
    true, // write-capable
    origin,
  );
  const encoded = encodeNodeInviteLink(origin, token);
  const fragment = encoded.includes("#") ? encoded.split("#")[1] : encoded;
  return `${origin}/wedding/${fragment}`;
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
