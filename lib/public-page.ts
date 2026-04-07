/**
 * Public wedding page sync — pushes public day-of items, about info, and FAQ
 * to an unauthenticated Starfish collection so guests can view the timeline.
 */

import { StarfishClient, SyncManager } from "@drakkar.software/starfish-client";
import { useWeddingStore } from "@/store/useWeddingStore";
import { usePlanningStore } from "@/store/usePlanningStore";

export interface PublicDayOfItem {
  id: string;
  title: string;
  time: string;
  endTime?: string | null;
  location?: string | null;
  sortOrder?: number | null;
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
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
}

let syncManager: SyncManager | null = null;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
const PUSH_DEBOUNCE_MS = 2000;

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
}

export function teardownPublicPageSync(): void {
  if (pushTimer) {
    clearTimeout(pushTimer);
    pushTimer = null;
  }
  syncManager = null;
}

/** Collect public data from stores and build the page document */
export function buildPublicPageDocument(): PublicWeddingPage {
  const wedding = useWeddingStore.getState().wedding;
  const dayOfItems = usePlanningStore.getState().dayOfItems;

  const publicItems = dayOfItems
    .filter((item) => item.isPublic)
    .sort((a, b) => (a.time || "").localeCompare(b.time || ""))
    .map(({ id, title, time, endTime, location, sortOrder }) => ({
      id,
      title,
      time,
      endTime,
      location,
      sortOrder,
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
    faq: wedding?.faq ? (() => { try { return JSON.parse(wedding.faq); } catch { return []; } })() : []
  };
}

/** Debounced push of public page data to Starfish */
export function notifyPublicPageSync(): void {
  if (!syncManager) return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(async () => {
    pushTimer = null;
    if (!syncManager) return;
    try {
      const doc = buildPublicPageDocument();
      await syncManager.push(doc as unknown as Record<string, unknown>);
    } catch (err) {
      console.warn("[public-page] Push failed:", err);
    }
  }, PUSH_DEBOUNCE_MS);
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
    const client = new StarfishClient({ baseUrl: serverUrl });
    const result = await client.pull(`/pull/wedding-page/${userId}`);
    if (result.data) {
      return result.data as unknown as PublicWeddingPage;
    }
  } catch (err) {
    console.warn("[public-page] Fetch failed:", err);
  }
  return null;
}
