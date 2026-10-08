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
  objInvPull,
  updateObjectIndex,
  createNodeInviteLink,
  encodeNodeInviteLink,
  publicPageToNode,
  type Session,
  type ObjectNode,
  type PublicWeddingEvent,
} from "@fiance/sdk";
import { withIndexLock } from "@/lib/index-lock";
import { BASE_URL } from "@/lib/seo-urls";
import { isPremium } from "@/lib/premium";

function getAppOrigin(): string {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return window.location.origin;
  }
  // On native, share real HTTPS links that open in a browser.
  return BASE_URL;
}
import { useWeddingStore } from "@/store/useWeddingStore";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useGiftsStore } from "@/store/useGiftsStore";
import { useWeddingEventsStore } from "@/store/useWeddingEventsStore";

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
  version: 1 | 2;
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
  /** v2: public sub-events (multi-day/venue). Absent on v1 documents. */
  events?: PublicWeddingEvent[];
  /** Whether the owner's wedding is premium — gates gifts (and future premium sections) client-side too. */
  premium?: boolean;
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

// ─── A push with nothing to write does not write ─────────────────────────────
//
// This node was re-pushed on EVERY hydration, identical or not. On its own that
// cost one useless write per foreground. With the event stream it closed into a
// LOOP: the push emits an event, the author's own tab receives the echo, it
// hydrates, the hydration pushes again. 120 req/min measured with nobody at the
// screen.
//
// Three guards, and the count is the part not to simplify away:
//
//   1. The IN-MEMORY FINGERPRINT, checked before the node is even opened. It is
//      the only one that holds in the looping case, because handle.push has a
//      fast path: once its document cache knows the push path's hash — i.e.
//      from the second push of a session on — it calls the mutator with
//      cur = null WITHOUT re-reading the server. A guard looking only at cur
//      would never have anything to compare.
//   2. The EXPLICIT RE-READ, for the first call of a page load, where the
//      in-memory fingerprint knows nothing yet. It cannot be delegated to the
//      mutator: makeHandle consults client.peekCache first, which reads a
//      PERSISTED cache surviving a reload, so the fast path is taken from the
//      very first push of a page. A read replaces a write, and a read emits no
//      event, so it re-primes nothing.
//   3. The COMPARISON AGAINST cur, as a last resort, when the re-read failed on
//      the network and handle.push does its own.
//
// timestamp is excluded from the comparison on both sides: it changes on every
// build, so including it would conclude "different" every time and reproduce
// exactly the bug fixed here.

/** Comparable fingerprint of a public-page document: timestamp dropped, keys
 *  sorted at every depth, undefined skipped (JSON loses them anyway, so keeping
 *  them would make the built document diverge from the re-read one). */
export function publicPageFingerprint(doc: unknown): string {
  const normalise = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(normalise);
    if (v && typeof v === "object") {
      const src = v as Record<string, unknown>;
      const out: Record<string, unknown> = {};
      for (const k of Object.keys(src).sort()) {
        if (src[k] === undefined) continue;
        out[k] = normalise(src[k]);
      }
      return out;
    }
    return v;
  };
  const withoutTimestamp =
    doc && typeof doc === "object" && !Array.isArray(doc)
      ? (() => {
          const { timestamp: _ignored, ...rest } = doc as Record<string, unknown>;
          return rest;
        })()
      : doc;
  return JSON.stringify(normalise(withoutTimestamp));
}

/** Last fingerprint actually pushed, per node. Deliberately in memory:
 *  persisting it would silence the bootstrap push after a reload, and that push
 *  is what makes the public link live as soon as a wedding is created. */
const _lastPushedFingerprint = new Map<string, string>();

/** @internal For tests — the retained fingerprint is module state. */
export function forgetPublicPageFingerprints(): void {
  _lastPushedFingerprint.clear();
}

/** Push the current public page content to the `publicPage` ObjectNode's objinv. */
export async function pushPublicPageContent(
  session: Session,
  spaceId: string,
  pageNodeId: string,
): Promise<void> {
  const content = buildPublicPageDocument();
  const fingerprint = publicPageFingerprint(content);
  const key = `${spaceId}/${pageNodeId}`;

  // Guard 1 — nothing changed since our last push: no write, no read, no node
  // opened. This is the one that extinguishes the loop.
  if (_lastPushedFingerprint.get(key) === fingerprint) return;

  const handle = await getNodeAccess(
    spaceId,
    pageNodeId,
    { access: "invite", enc: false },
    session,
    null,
  );

  // Guard 2 — re-read what the server holds ourselves. Delegating this to the
  // mutator does not work: handle.push's fast path stops it ever seeing the
  // server state.
  try {
    const current = await handle.client.pull(objInvPull(spaceId, pageNodeId));
    if (current?.hash) {
      const data = handle.encryptor
        ? await handle.encryptor.decrypt(current.data)
        : current.data;
      if (publicPageFingerprint(data) === fingerprint) {
        _lastPushedFingerprint.set(key, fingerprint);
        return;
      }
    }
  } catch {
    // Network down or document absent: carry on, guard 3 takes over if
    // handle.push manages a read of its own.
  }

  // True once the server is established as holding this document, whether we
  // just wrote it or found it already there.
  let serverHasIt = false;
  await handle.push(
    objInvPull(spaceId, pageNodeId),
    objInvPush(spaceId, pageNodeId),
    (cur) => {
      // Guard 3 — the server already holds the equivalent. Returning null tells
      // handle.push to skip the write, as ensurePublicPageNode does above.
      if (cur && publicPageFingerprint(cur) === fingerprint) {
        serverHasIt = true;
        return null;
      }
      serverHasIt = true;
      return content as unknown as Record<string, unknown>;
    },
  );
  // Recorded AFTER the fact, and only if the call ran to completion: recording
  // it earlier would silence the retry that must follow a network failure.
  //
  // Guard 3 counts as much as the push itself: it re-read the server, so it
  // warmed the document cache (docKey maps read and write paths to one key).
  // Without recording here, the next call would take the fast path, get
  // cur = null, and write — the hole the loop would come back through.
  if (serverHasIt) _lastPushedFingerprint.set(key, fingerprint);
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
  const nbf = Math.floor(Date.now() / 1000) - 3600; // backdate 1h: absorb owner clock skew
  const ttlSec = 5 * 365 * 24 * 3600; // 5 years — links don't rot
  const { token } = await createNodeInviteLink(
    session,
    spaceId,
    pageNodeId,
    "Page mariage",
    { enc: false },
    false, // read-only
    origin,
    { ttlSec, nbf },
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

  const premium = isPremium();
  const gifts = useGiftsStore.getState().gifts;
  const publicGifts: PublicGift[] = gifts.map(
    ({ id, title, description, price, url, imageUrl, category, claimed }) => ({
      id, title, description, price, url, imageUrl, category, claimed: !!claimed,
    }),
  );

  const weddingEvents = useWeddingEventsStore.getState().weddingEvents;
  const publicEvents: PublicWeddingEvent[] = weddingEvents
    .filter((e) => e.isPublic)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.startTime || "").localeCompare(b.startTime || ""))
    .map(({ id, type, title, date, startTime, venueName, address }) => ({
      id, type, title, date, time: startTime, venueName, address,
    }));

  // Free tier's public page only publishes the earliest day — multi-day
  // programs are a premium feature. A single-day wedding is unaffected.
  const earliestDate = [
    ...publicItems.map((i) => i.date || weddingDate),
    ...publicEvents.map((e) => e.date),
  ].filter(Boolean).sort()[0];
  const timelineForPage = premium || !earliestDate
    ? publicItems
    : publicItems.filter((i) => (i.date || weddingDate) === earliestDate);
  const eventsForPage = premium || !earliestDate
    ? publicEvents
    : publicEvents.filter((e) => e.date === earliestDate);

  return {
    version: 2,
    timestamp: new Date().toISOString(),
    about: {
      partner1Name: wedding?.partner1Name,
      partner2Name: wedding?.partner2Name,
      weddingDate: wedding?.weddingDate,
      venueName: wedding?.venueName,
      description: wedding?.description,
    },
    timeline: timelineForPage,
    faq: premium && wedding?.faq
      ? (() => { try { return JSON.parse(wedding.faq); } catch { return []; } })()
      : [],
    gifts: premium && publicGifts.length > 0 ? publicGifts : undefined,
    events: eventsForPage.length > 0 ? eventsForPage : undefined,
    premium,
  };
}
