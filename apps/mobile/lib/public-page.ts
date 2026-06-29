/**
 * Public wedding page — ObjectNode-based (v3).
 *
 * The `publicPage` node (access:'invite', enc:false) lives under the wedding node
 * in the fiance space. Its content is pushed to `objinv` by the owner and read
 * by guests via a node invite link (readNodeWithLinkCap).
 *
 * The node ID is derived deterministically: `pub-${weddingNodeId}`.
 *
 * Guest-facing URL: `encodeNodeInviteLink(origin, token)` puts the token in the
 * URL fragment. The wedding page screen reads `id` as the base64url token and
 * calls `decodeNodeInviteLink(id)` + `readNodeWithLinkCap(token)`.
 */

import { Platform } from "react-native";
import {
  getNodeAccess,
  objInvPush,
  updateObjectIndex,
  createNodeInviteLink,
  encodeNodeInviteLink,
  publicPageToNode,
  type Session,
  type ObjectNode,
} from "@fiance/sdk";
import { withIndexLock } from "@/lib/index-lock";

function getAppOrigin(): string {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return window.location.origin;
  }
  // On native, share real HTTPS links that open in a browser.
  return "https://fiance.drakkar.software";
}
import { useWeddingStore } from "@/store/useWeddingStore";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useGiftsStore } from "@/store/useGiftsStore";

// ---------------------------------------------------------------------------
// Types — unchanged
// ---------------------------------------------------------------------------

export interface PublicDayOfItem {
  id: string;
  title: string;
  date?: string | null;
  time: string;
  endTime?: string | null;
  location?: string | null;
  sortOrder?: number | null;
}

export interface PublicGift {
  id: string;
  title: string;
  description?: string | null;
  price?: number | null;
  url?: string | null;
  imageUrl?: string | null;
  category?: string | null;
  claimed?: boolean;
}

export interface PublicWeddingPage {
  version: 1;
  timestamp: string;
  about: {
    partner1Name?: string | null;
    partner2Name?: string | null;
    weddingDate?: string | null;
    venueName?: string | null;
    description?: string | null;
  };
  timeline: PublicDayOfItem[];
  faq: FaqItem[];
  gifts?: PublicGift[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

// ---------------------------------------------------------------------------
// Deterministic node ID helpers
// ---------------------------------------------------------------------------

/** Derive the `publicPage` ObjectNode ID from the wedding node ID. */
export function publicPageNodeId(weddingNodeId: string): string {
  return `pub-${weddingNodeId}`;
}

// ---------------------------------------------------------------------------
// Owner-side: ensure the publicPage node exists in the space index
// ---------------------------------------------------------------------------

/**
 * Create or verify the `publicPage` ObjectNode in the space index.
 * Idempotent — safe to call on every sync init.
 * Returns the pageNodeId.
 */
export async function ensurePublicPageNode(
  session: Session,
  spaceId: string,
  weddingNodeId: string,
): Promise<string> {
  const pageNodeId = publicPageNodeId(weddingNodeId);
  const desc = publicPageToNode(pageNodeId, weddingNodeId);

  await withIndexLock(spaceId, () =>
    updateObjectIndex(session, spaceId, (nodes, now) => {
      const exists = nodes.some((n) => n.id === pageNodeId);
      if (exists) return null; // nothing to change
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
      };
      return [...nodes, node];
    }),
  );

  return pageNodeId;
}

// ---------------------------------------------------------------------------
// Owner-side: push page content to objinv
// ---------------------------------------------------------------------------

/** Push the current public page content to the `publicPage` ObjectNode's objinv. */
export async function pushPublicPageContent(
  session: Session,
  spaceId: string,
  pageNodeId: string,
): Promise<void> {
  const content = buildPublicPageDocument();
  const handle = await getNodeAccess(
    spaceId,
    pageNodeId,
    { access: "invite", enc: false },
    session,
    null,
  );
  await handle.client.push(
    objInvPush(spaceId, pageNodeId),
    content as unknown as Record<string, unknown>,
    null,
  );
}

// ---------------------------------------------------------------------------
// Owner-side: generate a guest-readable invite link for the page
// ---------------------------------------------------------------------------

/**
 * Mint a read-only invite link for the `publicPage` node.
 * Returns the full URL (origin/wedding/${fragment}) where fragment is the
 * base64url NodeInviteLinkToken that the guest page screen decodes.
 */
export async function getPublicPageInviteLink(
  session: Session,
  spaceId: string,
  pageNodeId: string,
): Promise<string> {
  const origin = getAppOrigin();
  const { token } = await createNodeInviteLink(
    session,
    spaceId,
    pageNodeId,
    "Page mariage",
    { enc: false },
    false, // read-only
    origin,
  );
  const encoded = encodeNodeInviteLink(origin, token);
  // Extract the fragment (everything after '#') and use it as the path segment.
  const fragment = encoded.includes("#") ? encoded.split("#")[1] : encoded;
  return `${origin}/wedding/${fragment}`;
}

// ---------------------------------------------------------------------------
// Shared helper — used by the settings/public-page screen
// ---------------------------------------------------------------------------

/**
 * Resolve the active sync session and mint a public-page invite link.
 * Returns the URL string on success, or null if sync is not active.
 * Throws if the link cannot be minted (caller should surface the error).
 */
export async function resolvePublicPageUrl(): Promise<string | null> {
  const { getActiveSession, getActiveSpaceId, getActiveWeddingNodeId } = await import("@/lib/starfish");
  const session = getActiveSession();
  const spaceId = getActiveSpaceId();
  const weddingNodeId = getActiveWeddingNodeId();
  if (!session || !spaceId || !weddingNodeId) return null;
  const pageNodeId = publicPageNodeId(weddingNodeId);
  return getPublicPageInviteLink(session, spaceId, pageNodeId);
}

// ---------------------------------------------------------------------------
// Legacy stubs (called from old providers.tsx paths — now no-ops)
// ---------------------------------------------------------------------------

/** @deprecated No-op in v3 — use ensurePublicPageNode + pushPublicPageContent. */
export function initPublicPageSync(_config: {
  serverUrl: string;
  authToken: string;
  userId: string;
}): void {}

/** @deprecated No-op in v3. */
export async function pullPublicPageSync(): Promise<void> {}

/** @deprecated No-op in v3. */
export function teardownPublicPageSync(): void {}

/** @deprecated No-op in v3 — use pushPublicPageContent. */
export function notifyPublicPageSync(): void {}

/**
 * Guest-side: fetch the public wedding page doc via a link-cap token.
 *
 * The `fragment` parameter is the base64url-encoded NodeInviteLinkToken from the
 * URL path (e.g. `wedding/${fragment}`). Returns null on error or if the page
 * hasn't been pushed yet.
 *
 * @deprecated Legacy (userId-based) path. Prefer the fragment-based path using
 * decodeNodeInviteLink + readNodeWithLinkCap in the screen component.
 */
export async function fetchPublicPage(
  _serverUrl: string,
  _userId: string,
): Promise<PublicWeddingPage | null> {
  return null;
}

// ---------------------------------------------------------------------------
// Pure helpers — unchanged
// ---------------------------------------------------------------------------

/** Collect public data from stores and build the page document. */
export function buildPublicPageDocument(): PublicWeddingPage {
  const wedding = useWeddingStore.getState().wedding;
  const dayOfItems = usePlanningStore.getState().dayOfItems;

  const weddingDate = wedding?.weddingDate || "";
  const publicItems = dayOfItems
    .filter((item) => item.isPublic)
    .sort((a, b) => {
      const da = (a.date || weddingDate).localeCompare(b.date || weddingDate);
      if (da !== 0) return da;
      return (a.time || "").localeCompare(b.time || "");
    })
    .map(({ id, title, date, time, endTime, location, sortOrder }) => ({
      id, title, date, time, endTime, location, sortOrder,
    }));

  const gifts = useGiftsStore.getState().gifts;
  const publicGifts: PublicGift[] = gifts.map(
    ({ id, title, description, price, url, imageUrl, category, claimed }) => ({
      id, title, description, price, url, imageUrl, category, claimed: !!claimed,
    }),
  );

  return {
    version: 1,
    timestamp: new Date().toISOString(),
    about: {
      partner1Name: wedding?.partner1Name,
      partner2Name: wedding?.partner2Name,
      weddingDate: wedding?.weddingDate,
      venueName: wedding?.venueName,
      description: wedding?.description,
    },
    timeline: publicItems,
    faq: wedding?.faq
      ? (() => { try { return JSON.parse(wedding.faq); } catch { return []; } })()
      : [],
    gifts: publicGifts.length > 0 ? publicGifts : undefined,
  };
}
