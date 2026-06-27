/**
 * RSVP sync — v3 starfish-spaces implementation.
 *
 * Each guest gets a per-node `rsvp` ObjectNode (access:'invite', enc:false)
 * under the publicPage node. The owner mints a combined guest link that bundles:
 *  - page-read cap (publicPage node, read-only)
 *  - rsvp-write cap (rsvp node, write-capable)
 *
 * Guest submits via `writeNodeWithLinkCap`. Owner reads submissions via
 * `objInvPull` (space:member privilege) on boot and foreground.
 */

import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { useGuestsStore } from "@/store/useGuestsStore";
import type { WeddingRegistryEntry } from "@/lib/wedding-registry";
import {
  updateObjectIndex,
  getNodeAccess,
  objInvPush,
  createNodeInviteLink,
  rsvpToNode,
  type Session,
  type ObjectNode,
} from "@fiance/sdk";
import { publicPageNodeId, getPublicPageInviteLink, ensurePublicPageNode } from "@/lib/public-page";
import { encodeGuestLink } from "@/lib/guest-link";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RsvpSubmission {
  guestId: string;
  firstName?: string | null;
  lastName?: string | null;
  /** Guest's companion ID, seeded by owner so the form can show companion details. */
  companionGuestId?: string | null;
  companionFirstName?: string | null;
  companionLastName?: string | null;
  rsvpStatus: string | null;
  diet?: string | null;
  dietNotes?: string | null;
  plusOneGuestId?: string | null;
  plusOneRsvpStatus?: string | null;
  plusOneDiet?: string | null;
  childrenCount?: number | null;
  submittedAt: string | null;
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Returns the combined guest invite link URL for a guest.
 * Bundles page-read cap + rsvp-write cap into one URL.
 * Returns null until the link is minted (requires active sync session).
 */
export function useGuestRsvpUrl(
  guestId: string | undefined,
  activeEntry: WeddingRegistryEntry | undefined,
): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!guestId || !activeEntry?.seedPhrase) return;
    let cancelled = false;

    import("@/lib/starfish").then(({ getActiveSession, getActiveSpaceId, getActiveWeddingNodeId }) => {
      const session = getActiveSession();
      const spaceId = getActiveSpaceId();
      const weddingNodeId = getActiveWeddingNodeId();

      if (!session || !spaceId || !weddingNodeId) return;

      const guests = useGuestsStore.getState().guests;
      const guest = guests.find((g) => g.id === guestId);
      const guestName = guest ? `${guest.firstName} ${guest.lastName}`.trim() : guestId;
      const firstName = guest?.firstName ?? null;
      const lastName = guest?.lastName ?? null;
      const allGuests = useGuestsStore.getState().guests;
      const companion = guest?.companionId ? allGuests.find((g) => g.id === guest.companionId) : null;

      (async () => {
        try {
          const link = await getGuestInviteLink(
            session, spaceId, weddingNodeId, guestId, guestName,
            firstName, lastName,
            companion?.id ?? null, companion?.firstName ?? null, companion?.lastName ?? null,
          );
          if (!cancelled) setUrl(link);
        } catch {
          // Session not ready — link minting deferred
        }
      })();
    }).catch(() => {});

    return () => { cancelled = true; };
  }, [guestId, activeEntry?.seedPhrase]);

  return url;
}

// ---------------------------------------------------------------------------
// RSVP ObjectNode management (owner-side)
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
 * Seed the RSVP node with the guest's initial data so guests can see their
 * name (and companion name) when they open the RSVP form. Names are private —
 * stored only in the per-guest node, not visible to other guests.
 */
export async function seedRsvpNodeContent(
  session: Session,
  spaceId: string,
  nodeId: string,
  guestId: string,
  firstName: string | null,
  lastName: string | null,
  companionGuestId?: string | null,
  companionFirstName?: string | null,
  companionLastName?: string | null,
): Promise<void> {
  const handle = await getNodeAccess(
    spaceId,
    nodeId,
    { access: "invite", enc: false },
    session,
    null,
  );
  const initial: RsvpSubmission = {
    guestId,
    firstName: firstName ?? null,
    lastName: lastName ?? null,
    companionGuestId: companionGuestId ?? null,
    companionFirstName: companionFirstName ?? null,
    companionLastName: companionLastName ?? null,
    rsvpStatus: null,
    submittedAt: null,
  };
  await handle.client.push(
    objInvPush(spaceId, nodeId),
    initial as unknown as Record<string, unknown>,
    null,
  );
}

/**
 * Mint a combined page-read + rsvp-write link for a specific guest.
 * Ensures the publicPage node and rsvp node both exist, seeds the rsvp node
 * with the guest's name, and returns a single URL with both caps bundled.
 */
export async function getGuestInviteLink(
  session: Session,
  spaceId: string,
  weddingNodeId: string,
  guestId: string,
  guestName: string,
  firstName: string | null,
  lastName: string | null,
  companionGuestId?: string | null,
  companionFirstName?: string | null,
  companionLastName?: string | null,
): Promise<string> {
  const origin = getAppOrigin();

  // Ensure both nodes exist.
  const pageNodeId = await ensurePublicPageNode(session, spaceId, weddingNodeId);
  const nodeId = await ensureRsvpNode(session, spaceId, weddingNodeId, guestId);

  // Seed the rsvp node with the guest's initial data (idempotent at server level — last write wins).
  await seedRsvpNodeContent(
    session, spaceId, nodeId, guestId,
    firstName, lastName,
    companionGuestId, companionFirstName, companionLastName,
  );

  // Mint page-read token (read-only).
  const { token: pageToken } = await createNodeInviteLink(
    session,
    spaceId,
    pageNodeId,
    "Page mariage",
    { enc: false },
    false, // read-only
    origin,
  );

  // Mint rsvp-write token (write-capable).
  const { token: rsvpToken } = await createNodeInviteLink(
    session,
    spaceId,
    nodeId,
    guestName,
    { enc: false },
    true, // write-capable
    origin,
  );

  return encodeGuestLink(origin, pageToken, rsvpToken);
}

// ---------------------------------------------------------------------------
// Owner inbox — apply submissions by guestId
// ---------------------------------------------------------------------------

/**
 * Apply a list of v3 RSVP submissions (keyed by guestId) to the guests store.
 * Returns the count of applied updates.
 */
export function applyRsvpSubmissionsByGuestId(submissions: RsvpSubmission[]): number {
  const { guests } = useGuestsStore.getState();
  const updateGuest = useGuestsStore.getState().updateGuest;
  let applied = 0;

  for (const sub of submissions) {
    if (!sub.guestId || !sub.rsvpStatus || !sub.submittedAt) continue;

    const guest = guests.find((g) => g.id === sub.guestId);
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

    // Apply companion RSVP (companion ID may come from submission or from the guest's companionId).
    const companionId = sub.plusOneGuestId ?? guest.companionId ?? null;
    if (sub.plusOneRsvpStatus && companionId) {
      const companionUpdates: Record<string, unknown> = {
        rsvpStatus: sub.plusOneRsvpStatus,
        rsvpDate: sub.submittedAt,
      };
      if (sub.plusOneDiet) companionUpdates.diet = sub.plusOneDiet;
      updateGuest(companionId, companionUpdates);
    }
  }

  return applied;
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

function getAppOrigin(): string {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return window.location.origin;
  }
  return "exp://";
}

// ---------------------------------------------------------------------------
// Re-export for the public-page share link (page-only, no guest)
// ---------------------------------------------------------------------------

export { getPublicPageInviteLink } from "@/lib/public-page";
