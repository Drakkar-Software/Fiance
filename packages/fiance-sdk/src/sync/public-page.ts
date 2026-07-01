/**
 * Public wedding page — pure data builder.
 * No store references; the app-side wrapper reads stores and passes data here.
 */

// NodeNext .js extension required
import type { Wedding, DayOfItem, Gift, WeddingEvent } from '../domain/schema.js';

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

export interface PublicWeddingEvent {
  id: string;
  type: string;
  title: string;
  date: string;
  time?: string | null;
  venueName?: string | null;
  address?: string | null;
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
}

export interface FaqItem {
  question: string;
  answer: string;
}

/** Pure builder: assemble the public page document from raw entity data */
export function buildPublicPage(
  wedding: Wedding | null,
  dayOfItems: DayOfItem[],
  gifts: Gift[],
  weddingEvents: WeddingEvent[] = []
): PublicWeddingPage {
  const weddingDate = wedding?.weddingDate || "";

  const events: PublicWeddingEvent[] = weddingEvents
    .filter((e) => e.isPublic)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.startTime || "").localeCompare(b.startTime || ""))
    .map(({ id, type, title, date, startTime, venueName, address }) => ({
      id,
      type,
      title,
      date,
      time: startTime,
      venueName,
      address,
    }));

  const timeline = dayOfItems
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

  const publicGifts: PublicGift[] = gifts.map(
    ({ id, title, description, price, url, imageUrl, category, claimed }) => ({
      id,
      title,
      description,
      price,
      url,
      imageUrl,
      category,
      claimed: !!claimed,
    })
  );

  let faq: FaqItem[] = [];
  if (wedding?.faq) {
    try {
      faq = JSON.parse(wedding.faq);
    } catch {
      faq = [];
    }
  }

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
    timeline,
    faq,
    gifts: publicGifts.length > 0 ? publicGifts : undefined,
    events: events.length > 0 ? events : undefined,
  };
}
