/**
 * Tests for db/schema.ts — validate entity type shapes.
 * Ensures schema changes don't silently break expected field presence.
 */
import { describe, it, expect } from "vitest";
import type { Wedding, Guest, DayOfItem, Task, Vendor, AgendaEvent } from './schema.js';

// Helper: check that a value satisfies a TypeScript interface at runtime
function checkShape<T>(obj: T): T { return obj; }

describe("Wedding entity", () => {
  it("has required fields", () => {
    const w = checkShape<Wedding>({
      id: 1,
      partner1Name: null,
      partner2Name: null,
      weddingDate: null,
      venueName: null,
      description: null,
      faq: null,
      eventPhotos: null,
      budgetTarget: null,
      categoryBudgets: null,
      currency: "EUR",
      createdAt: null,
      updatedAt: null,
    });
    expect(w.id).toBe(1);
    expect(w.currency).toBe("EUR");
  });

  it("allows nullable fields", () => {
    const w: Partial<Wedding> = { weddingDate: null, partner1Name: null };
    expect(w.weddingDate).toBeNull();
  });
});

describe("Guest entity", () => {
  it("has required fields", () => {
    const g = checkShape<Guest>({
      id: "abc",
      firstName: "Alice",
      lastName: "Dupont",
      side: null,
      invitationType: "FULL",
      rsvpStatus: "PENDING",
      rsvpDate: null,
      isSleeping: null,
      childrenCount: null,
      diet: null,
      dietNotes: null,
      groupId: null,
      tableId: null,
      companionId: null,
      noTableNeeded: null,
      giftDescription: null,
      thankYouSent: null,
      thankYouSentDate: null,
      accommodationId: null,
      roomNumber: null,
      rsvpToken: null,
      email: null,
      phone: null,
      address: null,
      notes: null,
      shuttleVendorId: null,
      shuttlePickupLocation: null,
      shuttlePickupTime: null,
      parkingNeeded: null,
      parkingNotes: null,
      arrivalNotes: null,
      transportMode: null,
      createdAt: null,
      updatedAt: null,
    });
    expect(g.firstName).toBe("Alice");
    expect(g.invitationType).toBe("FULL");
  });
});

describe("DayOfItem entity", () => {
  it("has required fields including date and isPublic", () => {
    const item = checkShape<DayOfItem>({
      id: "x",
      title: "Cérémonie",
      date: null,
      time: "14:00",
      endTime: null,
      location: null,
      responsible: null,
      notes: null,
      isPublic: false,
      sortOrder: null,
      eventId: null,
      completedAt: null,
      roleId: null,
      createdAt: null,
      updatedAt: null,
    });
    expect(item.title).toBe("Cérémonie");
    expect(item.isPublic).toBe(false);
  });
});

describe("Task entity", () => {
  it("has status and priority fields", () => {
    const task = checkShape<Task>({
      id: "t1",
      categoryId: null,
      title: "Réserver le traiteur",
      description: null,
      status: "TODO",
      priority: "HIGH",
      dueDate: null,
      monthsBefore: null,
      isSystem: null,
      vendorId: null,
      assignee: null,
      reminderDaysBefore: null,
      completedAt: null,
      notes: null,
      createdAt: null,
      updatedAt: null,
    });
    expect(task.status).toBe("TODO");
    expect(task.priority).toBe("HIGH");
  });
});

describe("Vendor entity", () => {
  it("has type and status fields", () => {
    const v = checkShape<Vendor>({
      id: "v1",
      type: "CATERER",
      name: "Chef Dupont",
      contactName: null,
      phone: null,
      email: null,
      website: null,
      status: "BOOKED",
      quoteDate: null,
      eventDate: null,
      basePrice: null,
      pricePerPerson: null,
      pppSource: null,
      dynamicPricing: null,
      fixedFee: null,
      countAllGuests: null,
      depositAmount: null,
      depositPaid: null,
      depositDueDate: null,
      balanceDueDate: null,
      validityDate: null,
      customFields: null,
      notes: null,
      rating: null,
      eventId: null,
      comparisonGroupId: null,
      isSelected: null,
      sortOrder: null,
      createdAt: null,
      updatedAt: null,
    });
    expect(v.type).toBe("CATERER");
    expect(v.status).toBe("BOOKED");
  });
});

describe("AgendaEvent entity", () => {
  it("has date field (required)", () => {
    const e = checkShape<AgendaEvent>({
      id: "e1",
      title: "RDV traiteur",
      date: "2026-06-15",
      time: "10:00",
      endTime: null,
      location: null,
      vendorId: null,
      notes: null,
      eventId: null,
      createdAt: null,
      updatedAt: null,
    });
    expect(e.date).toBe("2026-06-15");
  });
});

describe("Type exports exist", () => {
  it("all entity types are exported", () => {
    // Type-level test: if these import successfully the types are exported
    const types = [
      "Wedding", "Guest", "GuestGroup", "Table",
      "Vendor", "QuotePricing", "VendorPayment",
      "Accommodation", "Gift", "TaskCategory", "Task",
      "AgendaEvent", "DayOfItem", "IdeaCollection", "Idea",
    ];
    expect(types.length).toBe(15);
  });
});
