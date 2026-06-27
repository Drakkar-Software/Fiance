/**
 * Combined guest link codec.
 *
 * A per-guest share URL bundles two caps:
 *   - `p` — page-read NodeInviteLinkToken (reads `pub-${weddingNodeId}`)
 *   - `r` — rsvp-write NodeInviteLinkToken (writes `rsvp-${guestId}`)
 *
 * The combined token is `{ v:1, p: pageToken, r: rsvpToken }` serialised as
 * base64url in the URL path: `${origin}/wedding/${base64url}`.
 *
 * A plain page-only share link contains a bare NodeInviteLinkToken fragment
 * produced by `encodeNodeInviteLink` — decoders distinguish the two by
 * checking for the `v:1 + p + r` shape.
 */

import { toBase64Url, fromBase64Url } from "@drakkar.software/starfish-protocol";
import type { NodeInviteLinkToken } from "@fiance/sdk";

interface CombinedGuestLinkToken {
  v: 1;
  /** Page-read cap (NodeInviteLinkToken for the publicPage node). */
  p: NodeInviteLinkToken;
  /** RSVP-write cap (NodeInviteLinkToken for the rsvp node). */
  r: NodeInviteLinkToken;
}

/**
 * Encode a combined page-read + rsvp-write link for a specific guest.
 * Returns the full URL: `${origin}/wedding/${base64url}`.
 */
export function encodeGuestLink(
  origin: string,
  pageToken: NodeInviteLinkToken,
  rsvpToken: NodeInviteLinkToken,
): string {
  const payload: CombinedGuestLinkToken = { v: 1, p: pageToken, r: rsvpToken };
  const fragment = toBase64Url(JSON.stringify(payload));
  return `${origin}/wedding/${fragment}`;
}

/**
 * Decode a combined guest link fragment.
 * Returns `{ page, rsvp }` or null if the fragment is not a combined link
 * (caller should then fall back to `decodeNodeInviteLink` for a plain page link).
 */
export function decodeGuestLink(
  fragment: string,
): { page: NodeInviteLinkToken; rsvp: NodeInviteLinkToken } | null {
  try {
    const json = fromBase64Url(fragment);
    const tok = JSON.parse(json) as CombinedGuestLinkToken;
    if (
      tok?.v === 1 &&
      tok.p?.spaceId &&
      tok.p?.nodeId &&
      tok.r?.spaceId &&
      tok.r?.nodeId
    ) {
      return { page: tok.p, rsvp: tok.r };
    }
    return null;
  } catch {
    return null;
  }
}
