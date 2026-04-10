/**
 * Public wedding page sync — pushes public day-of items, about info, and FAQ
 * to an unauthenticated Starfish collection so guests can view the timeline.
 */

import { StarfishClient, SyncManager, createDedupFetch, createDebouncedPush } from "@drakkar.software/starfish-client";
import { useWeddingStore } from "@/store/useWeddingStore";
import { usePlanningStore } from "@/store/usePlanningStore";
import { useGiftsStore } from "@/store/useGiftsStore";

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

let syncManager: SyncManager | null = null;
let debouncedNotify: (() => void) | null = null;
let debouncedCancel: (() => void) | null = null;

export function initPublicPageSync(config: {
  serverUrl: string;
  authToken: string;
  userId: string;
}): void {
  const client = new StarfishClient({
    baseUrl: config.serverUrl,
    auth: async () => ({ Authorization: `Bearer ${config.authToken}` }),
  });

  syncManager = new SyncManager({
    client,
    pullPath: `/pull/wedding-page/${config.userId}`,
    pushPath: `/push/wedding-page/${config.userId}`,
    maxRetries: 2,
  });

  const debounced = createDebouncedPush(syncManager, {
    serialize: () => buildPublicPageDocument() as unknown as Record<string, unknown>,
    onError: (err) => console.warn("[public-page] Push failed:", err),
  });
  debouncedNotify = debounced.notify;
  debouncedCancel = debounced.cancel;
}

/** Pull the current public page to seed the baseHash for subsequent pushes */
export async function pullPublicPageSync(): Promise<void> {
  if (!syncManager) return;
  try {
    await syncManager.pull();
  } catch {
    // First pull may 404 if nothing has been pushed yet — that's fine
  }
}

export function teardownPublicPageSync(): void {
  debouncedCancel?.();
  debouncedNotify = null;
  debouncedCancel = null;
  syncManager = null;
}

/** Collect public data from stores and build the page document */
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
      id,
      title,
      date,
      time,
      endTime,
      location,
      sortOrder,
    }));

  const gifts = useGiftsStore.getState().gifts;
  const publicGifts: PublicGift[] = gifts.map(({ id, title, description, price, url, imageUrl, category, claimed }) => ({
    id, title, description, price, url, imageUrl, category, claimed: !!claimed,
  }));

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
    faq: wedding?.faq ? (() => { try { return JSON.parse(wedding.faq); } catch { return []; } })() : [],
    gifts: publicGifts.length > 0 ? publicGifts : undefined,
  };
}

/** Debounced push of public page data to Starfish */
export function notifyPublicPageSync(): void {
  debouncedNotify?.();
}

/**
 * Fetch the public page for a given wedding userId.
 * No auth required — the collection has readRoles: ["public"].
 */
export async function fetchPublicPage(
  serverUrl: string,
  userId: string,
): Promise<PublicWeddingPage | null> {
  try {
    const client = new StarfishClient({ baseUrl: serverUrl, fetch: createDedupFetch() });
    const result = await client.pull(`/pull/wedding-page/${userId}`);
    if (result.data) {
      return result.data as unknown as PublicWeddingPage;
    }
  } catch (err) {
    console.warn("[public-page] Fetch failed:", err);
  }
  return null;
}
