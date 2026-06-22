/**
 * Public wedding page sync — STUBBED for octospaces v3 migration.
 *
 * The v2 StarfishClient/SyncManager-based implementation is removed.
 * In B5 this will be replaced by:
 *  - A `publicPage` ObjectNode (access:'invite', enc:false) in the fiance namespace
 *  - `createNodeInviteLink` for guest access
 *  - `readNodeWithLinkCap` on the guest-page screen
 *
 * Exported types and `buildPublicPageDocument()` are kept unchanged.
 * Network functions are no-ops; `initPublicPageSync`, `notifyPublicPageSync`,
 * and `teardownPublicPageSync` are called from providers.tsx but do nothing yet.
 */

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
// Network stubs — TODO(B5): replace with ObjectNode invite-cap reads/writes
// ---------------------------------------------------------------------------

/** @deprecated TODO(B5): initialise public page node invite. */
export function initPublicPageSync(_config: {
  serverUrl: string;
  authToken: string;
  userId: string;
}): void {
  // no-op in v3 — will be replaced by createNode(publicPage) + createNodeInviteLink in B5
}

/** @deprecated TODO(B5): pull from objinv node via cap-cert. */
export async function pullPublicPageSync(): Promise<void> {
  // no-op
}

/** @deprecated TODO(B5): teardown node invite subscription. */
export function teardownPublicPageSync(): void {
  // no-op
}

/** @deprecated TODO(B5): push to objinv node via cap-cert. */
export function notifyPublicPageSync(): void {
  // no-op
}

/** @deprecated TODO(B5): read from objinv node via readNodeWithLinkCap. */
export async function fetchPublicPage(
  _serverUrl: string,
  _userId: string,
): Promise<PublicWeddingPage | null> {
  return null;
}

// ---------------------------------------------------------------------------
// Pure helpers — unchanged (used by B5 to build page content)
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
