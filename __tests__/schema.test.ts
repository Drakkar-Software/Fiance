/**
 * Tests for db/schema.ts — validate table structure, column presence,
 * and type exports. Ensures schema changes don't silently break.
 */
import { describe, it, expect, vi } from "vitest";

// Mock SQLite (drizzle-orm/sqlite-core uses it)
vi.mock("drizzle-orm/sqlite-core", async () => {
  const columns: Record<string, any> = {};
  const mockColumn = (name: string, opts?: any) => {
    const col: any = {
      _name: name,
      _opts: opts,
      notNull: () => { col._notNull = true; return col; },
      default: (v: any) => { col._default = v; return col; },
      primaryKey: () => { col._primaryKey = true; return col; },
      references: () => col,
    };
    return col;
  };
  return {
    sqliteTable: (tableName: string, columnDefs: Record<string, any>) => {
      const table: any = { _tableName: tableName, _columns: columnDefs, $inferSelect: {}, $inferInsert: {} };
      return table;
    },
    text: (name: string) => mockColumn(name),
    integer: (name: string, opts?: any) => mockColumn(name, opts),
    real: (name: string) => mockColumn(name),
  };
});

import * as schema from "@/db/schema";

describe("Schema tables exist", () => {
  it("exports wedding table", () => {
    expect(schema.wedding).toBeDefined();
    expect(schema.wedding._tableName).toBe("wedding");
  });

  it("exports guests table", () => {
    expect(schema.guests).toBeDefined();
    expect(schema.guests._tableName).toBe("guests");
  });

  it("exports dayOfItems table", () => {
    expect(schema.dayOfItems).toBeDefined();
    expect(schema.dayOfItems._tableName).toBe("day_of_items");
  });

  it("exports tasks table", () => {
    expect(schema.tasks).toBeDefined();
    expect(schema.tasks._tableName).toBe("tasks");
  });

  it("exports vendors table", () => {
    expect(schema.vendors).toBeDefined();
    expect(schema.vendors._tableName).toBe("vendors");
  });

  it("exports agendaEvents table", () => {
    expect(schema.agendaEvents).toBeDefined();
    expect(schema.agendaEvents._tableName).toBe("agenda_events");
  });
});

describe("dayOfItems schema", () => {
  it("has date column", () => {
    expect(schema.dayOfItems._columns.date).toBeDefined();
  });

  it("has isPublic column", () => {
    expect(schema.dayOfItems._columns.isPublic).toBeDefined();
  });

  it("has time column", () => {
    expect(schema.dayOfItems._columns.time).toBeDefined();
  });

  it("has title column", () => {
    expect(schema.dayOfItems._columns.title).toBeDefined();
  });

  it("has sortOrder column", () => {
    expect(schema.dayOfItems._columns.sortOrder).toBeDefined();
  });
});

describe("wedding schema", () => {
  it("has description column", () => {
    expect(schema.wedding._columns.description).toBeDefined();
  });

  it("has faq column", () => {
    expect(schema.wedding._columns.faq).toBeDefined();
  });

  it("has weddingDate column", () => {
    expect(schema.wedding._columns.weddingDate).toBeDefined();
  });
});

describe("Type exports", () => {
  // These just verify the exports exist (type-level, but the $inferSelect objects are defined)
  it("exports DayOfItem type reference", () => {
    expect(schema.dayOfItems.$inferSelect).toBeDefined();
  });

  it("exports Wedding type reference", () => {
    expect(schema.wedding.$inferSelect).toBeDefined();
  });

  it("exports Task type reference", () => {
    expect(schema.tasks.$inferSelect).toBeDefined();
  });
});
