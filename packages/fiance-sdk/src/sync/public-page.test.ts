/**
 * Tests for sync/public-page.ts — public page document building,
 * filtering of public items, date-based sorting, FAQ parsing.
 */
import { describe, it, expect } from "vitest";
import type { Wedding, DayOfItem, WeddingEvent } from '../domain/schema.js';
import { buildPublicPage, type PublicWeddingPage } from './public-page.js';

const mockWedding: Wedding = {
  id: 1,
  partner1Name: "Alice",
  partner2Name: "Bob",
  weddingDate: "2026-09-15",
  venueName: "Grand Hotel",
  description: "Our big day",
  faq: JSON.stringify([
    { question: "Dress code?", answer: "Smart casual" },
    { question: "Parking?", answer: "Free on site" },
  ]),
  eventPhotos: null,
  budgetTarget: null,
  categoryBudgets: null,
  currency: "EUR",
  createdAt: null,
  updatedAt: null,
};

const mockDayOfItems: DayOfItem[] = [
  { id: "1", title: "Ceremony", date: "2026-09-15", time: "14:00", endTime: "15:00", location: "Church", isPublic: true, sortOrder: 1, eventId: null, responsible: null, notes: null, createdAt: null, updatedAt: null },
  { id: "2", title: "Lunch prep", date: "2026-09-15", time: "12:00", endTime: null, location: null, isPublic: false, sortOrder: 2, eventId: null, responsible: null, notes: null, createdAt: null, updatedAt: null },
  { id: "3", title: "Reception", date: "2026-09-15", time: "18:00", endTime: "23:00", location: "Grand Hotel", isPublic: true, sortOrder: 3, eventId: null, responsible: null, notes: null, createdAt: null, updatedAt: null },
  { id: "4", title: "Brunch", date: "2026-09-16", time: "10:00", endTime: "12:00", location: "Garden", isPublic: true, sortOrder: 4, eventId: null, responsible: null, notes: null, createdAt: null, updatedAt: null },
  { id: "5", title: "Setup", date: null, time: "08:00", endTime: null, location: null, isPublic: false, sortOrder: 0, eventId: null, responsible: null, notes: null, createdAt: null, updatedAt: null },
];

describe("buildPublicPage", () => {
  it("includes wedding about info", () => {
    const doc = buildPublicPage(mockWedding, mockDayOfItems, []);
    expect(doc.about.partner1Name).toBe("Alice");
    expect(doc.about.partner2Name).toBe("Bob");
    expect(doc.about.weddingDate).toBe("2026-09-15");
    expect(doc.about.venueName).toBe("Grand Hotel");
    expect(doc.about.description).toBe("Our big day");
  });

  it("only includes public day-of items", () => {
    const doc = buildPublicPage(mockWedding, mockDayOfItems, []);
    expect(doc.timeline).toHaveLength(3);
    expect(doc.timeline.every((i) => ["1", "3", "4"].includes(i.id))).toBe(true);
  });

  it("excludes private items", () => {
    const doc = buildPublicPage(mockWedding, mockDayOfItems, []);
    const ids = doc.timeline.map((i) => i.id);
    expect(ids).not.toContain("2"); // Lunch prep (isPublic: false)
    expect(ids).not.toContain("5"); // Setup (isPublic: false)
  });

  it("sorts by date then time", () => {
    const doc = buildPublicPage(mockWedding, mockDayOfItems, []);
    const order = doc.timeline.map((i) => i.id);
    // Day 1: Ceremony (14:00), Reception (18:00), Day 2: Brunch (10:00)
    expect(order).toEqual(["1", "3", "4"]);
  });

  it("includes date field in timeline items", () => {
    const doc = buildPublicPage(mockWedding, mockDayOfItems, []);
    expect(doc.timeline[0].date).toBe("2026-09-15");
    expect(doc.timeline[2].date).toBe("2026-09-16");
  });

  it("strips private fields from timeline items", () => {
    const doc = buildPublicPage(mockWedding, mockDayOfItems, []);
    const item = doc.timeline[0] as any;
    // Should not include responsible, notes, isPublic
    expect(item.responsible).toBeUndefined();
    expect(item.notes).toBeUndefined();
    expect(item.isPublic).toBeUndefined();
  });

  it("parses FAQ from wedding JSON", () => {
    const doc = buildPublicPage(mockWedding, mockDayOfItems, []);
    expect(doc.faq).toHaveLength(2);
    expect(doc.faq[0].question).toBe("Dress code?");
    expect(doc.faq[1].answer).toBe("Free on site");
  });

  it("returns empty FAQ when wedding has no FAQ", () => {
    const doc = buildPublicPage({ ...mockWedding, faq: null }, mockDayOfItems, []);
    expect(doc.faq).toEqual([]);
  });

  it("returns empty FAQ for malformed JSON", () => {
    const doc = buildPublicPage({ ...mockWedding, faq: "not-json{{{{" }, mockDayOfItems, []);
    expect(doc.faq).toEqual([]);
  });

  it("sets version to 2 and includes timestamp", () => {
    const doc = buildPublicPage(mockWedding, mockDayOfItems, []);
    expect(doc.version).toBe(2);
    expect(doc.timestamp).toBeDefined();
    expect(new Date(doc.timestamp).getTime()).toBeGreaterThan(0);
  });

  it("omits events when there are none", () => {
    const doc = buildPublicPage(mockWedding, mockDayOfItems, []);
    expect(doc.events).toBeUndefined();
  });
});

const mockWeddingEvents: WeddingEvent[] = [
  { id: "e1", type: "CIVIL", title: "Mairie", date: "2026-09-15", startTime: "10:00", endTime: null, venueName: "Mairie du 11e", address: null, notes: null, isPrimary: false, isPublic: true, sortOrder: 1, createdAt: null, updatedAt: null },
  { id: "e2", type: "DINNER", title: "Réception", date: "2026-09-15", startTime: "19:00", endTime: null, venueName: "Grand Hotel", address: null, notes: null, isPrimary: true, isPublic: true, sortOrder: 2, createdAt: null, updatedAt: null },
  { id: "e3", type: "OTHER", title: "Répétition", date: "2026-09-14", startTime: "18:00", endTime: null, venueName: null, address: null, notes: "privé", isPrimary: false, isPublic: false, sortOrder: 0, createdAt: null, updatedAt: null },
];

describe("buildPublicPage — events (v2)", () => {
  it("only includes public events, sorted by date then time", () => {
    const doc = buildPublicPage(mockWedding, mockDayOfItems, [], mockWeddingEvents);
    expect(doc.events?.map((e) => e.id)).toEqual(["e1", "e2"]);
  });

  it("strips private notes/isPrimary/isPublic from event entries", () => {
    const doc = buildPublicPage(mockWedding, mockDayOfItems, [], mockWeddingEvents);
    const event = doc.events?.[0] as any;
    expect(event.notes).toBeUndefined();
    expect(event.isPrimary).toBeUndefined();
    expect(event.isPublic).toBeUndefined();
  });
});
