/**
 * Tests for lib/public-page.ts — public page document building,
 * filtering of public items, date-based sorting, FAQ parsing.
 */
import { describe, it, expect, vi } from "vitest";

// Mock stores
const mockWedding = {
  partner1Name: "Alice",
  partner2Name: "Bob",
  weddingDate: "2026-09-15",
  venueName: "Grand Hotel",
  description: "Our big day",
  faq: JSON.stringify([
    { question: "Dress code?", answer: "Smart casual" },
    { question: "Parking?", answer: "Free on site" },
  ]),
};

const mockDayOfItems = [
  { id: "1", title: "Ceremony", date: "2026-09-15", time: "14:00", endTime: "15:00", location: "Church", isPublic: true, sortOrder: 1 },
  { id: "2", title: "Lunch prep", date: "2026-09-15", time: "12:00", endTime: null, location: null, isPublic: false, sortOrder: 2 },
  { id: "3", title: "Reception", date: "2026-09-15", time: "18:00", endTime: "23:00", location: "Grand Hotel", isPublic: true, sortOrder: 3 },
  { id: "4", title: "Brunch", date: "2026-09-16", time: "10:00", endTime: "12:00", location: "Garden", isPublic: true, sortOrder: 4 },
  { id: "5", title: "Setup", date: null, time: "08:00", endTime: null, location: null, isPublic: false, sortOrder: 0 },
];

vi.mock("@/store/useWeddingStore", () => ({
  useWeddingStore: {
    getState: () => ({ wedding: mockWedding }),
  },
}));

vi.mock("@/store/usePlanningStore", () => ({
  usePlanningStore: {
    getState: () => ({ dayOfItems: mockDayOfItems }),
  },
}));

vi.mock("@drakkar.software/starfish-client", () => ({
  StarfishClient: vi.fn(),
  SyncManager: vi.fn(),
}));

import { buildPublicPageDocument, type PublicWeddingPage } from "@/lib/public-page";

describe("buildPublicPageDocument", () => {
  it("includes wedding about info", () => {
    const doc = buildPublicPageDocument();
    expect(doc.about.partner1Name).toBe("Alice");
    expect(doc.about.partner2Name).toBe("Bob");
    expect(doc.about.weddingDate).toBe("2026-09-15");
    expect(doc.about.venueName).toBe("Grand Hotel");
    expect(doc.about.description).toBe("Our big day");
  });

  it("only includes public day-of items", () => {
    const doc = buildPublicPageDocument();
    expect(doc.timeline).toHaveLength(3);
    expect(doc.timeline.every((i) => ["1", "3", "4"].includes(i.id))).toBe(true);
  });

  it("excludes private items", () => {
    const doc = buildPublicPageDocument();
    const ids = doc.timeline.map((i) => i.id);
    expect(ids).not.toContain("2"); // Lunch prep (isPublic: false)
    expect(ids).not.toContain("5"); // Setup (isPublic: false)
  });

  it("sorts by date then time", () => {
    const doc = buildPublicPageDocument();
    const order = doc.timeline.map((i) => i.id);
    // Day 1: Ceremony (14:00), Reception (18:00), Day 2: Brunch (10:00)
    expect(order).toEqual(["1", "3", "4"]);
  });

  it("includes date field in timeline items", () => {
    const doc = buildPublicPageDocument();
    expect(doc.timeline[0].date).toBe("2026-09-15");
    expect(doc.timeline[2].date).toBe("2026-09-16");
  });

  it("strips private fields from timeline items", () => {
    const doc = buildPublicPageDocument();
    const item = doc.timeline[0] as any;
    // Should not include responsible, notes, isPublic
    expect(item.responsible).toBeUndefined();
    expect(item.notes).toBeUndefined();
    expect(item.isPublic).toBeUndefined();
  });

  it("parses FAQ from wedding JSON", () => {
    const doc = buildPublicPageDocument();
    expect(doc.faq).toHaveLength(2);
    expect(doc.faq[0].question).toBe("Dress code?");
    expect(doc.faq[1].answer).toBe("Free on site");
  });

  it("returns empty FAQ when wedding has no FAQ", () => {
    const orig = mockWedding.faq;
    (mockWedding as any).faq = null;
    const doc = buildPublicPageDocument();
    expect(doc.faq).toEqual([]);
    mockWedding.faq = orig;
  });

  it("returns empty FAQ for malformed JSON", () => {
    const orig = mockWedding.faq;
    mockWedding.faq = "not-json{{{";
    const doc = buildPublicPageDocument();
    expect(doc.faq).toEqual([]);
    mockWedding.faq = orig;
  });

  it("sets version to 1 and includes timestamp", () => {
    const doc = buildPublicPageDocument();
    expect(doc.version).toBe(1);
    expect(doc.timestamp).toBeDefined();
    expect(new Date(doc.timestamp).getTime()).toBeGreaterThan(0);
  });
});
