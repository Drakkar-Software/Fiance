import { describe, it, expect } from "vitest";
import { zipSync, strToU8 } from "fflate";
import { base64ToBytes, parseSpreadsheet, mapRowsToGuests, type ParsedSheet } from "@/lib/guest-import";
import type { GuestGroup, Table } from "@fiance/sdk";

// ─── Fixtures ────────────────────────────────────────────────────────────────

/** Build a minimal xlsx (shared-strings style, like mariages.net exports). */
function buildXlsx(headers: string[], rows: string[][]): Uint8Array {
  const allRows = [headers, ...rows];
  const strings: string[] = [];
  const stringIndex = new Map<string, number>();
  const colLetter = (i: number) => {
    let s = "";
    for (let n = i; n >= 0; n = Math.floor(n / 26) - 1) {
      s = String.fromCharCode(65 + (n % 26)) + s;
    }
    return s;
  };
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const rowsXml = allRows
    .map((row, r) => {
      const cells = row
        .map((value, c) => {
          const ref = `${colLetter(c)}${r + 1}`;
          if (value === "") return `<c r="${ref}"/>`; // self-closing empty cell
          let idx = stringIndex.get(value);
          if (idx == null) {
            idx = strings.length;
            strings.push(value);
            stringIndex.set(value, idx);
          }
          return `<c r="${ref}" t="s"><v>${idx}</v></c>`;
        })
        .join("");
      return `<row r="${r + 1}">${cells}</row>`;
    })
    .join("");

  const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet><sheetData>${rowsXml}</sheetData></worksheet>`;
  const shared = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><sst count="${strings.length}" uniqueCount="${strings.length}">${strings
    .map((s) => `<si><t>${escape(s)}</t></si>`)
    .join("")}</sst>`;

  return zipSync({
    "xl/sharedStrings.xml": strToU8(shared),
    "xl/worksheets/sheet1.xml": strToU8(sheet),
  });
}

const MARIAGES_NET_HEADERS = [
  "PRÉNOM", "NOM", "E-MAIL", "TÉLÉPHONE", "TÉLÉPHONE PORTABLE", "GROUPE", "INVITÉ",
  "CONFIRMÉ", "MENU", "ADRESSE", "CODE POSTAL", "VILLE", "DÉPARTEMENT", "TABLE", "SEXE",
];

function makeIdCounter() {
  let n = 0;
  return () => `id-${++n}`;
}

const NO_EXISTING = { groups: [] as GuestGroup[], tables: [] as Table[] };

// ─── parseSpreadsheet ────────────────────────────────────────────────────────

describe("parseSpreadsheet (xlsx)", () => {
  it("parses a mariages.net-style xlsx with shared strings and empty cells", () => {
    const bytes = buildXlsx(MARIAGES_NET_HEADERS, [
      ["Anastasia DANIEL", "", "ana@example.com", "", "0612345678", "Mariés", "OK", "CONFIRMÉ", "Adultes", "", "", "", "", "Table d'Honneur", "Femme"],
      ["Catherine", "", "", "", "", "Famille", "", "EN ATTENTE", "Adultes", "", "", "", "", "", "Femme"],
    ]);
    const sheet = parseSpreadsheet(bytes);
    expect(sheet.headers).toEqual(MARIAGES_NET_HEADERS);
    expect(sheet.rows).toHaveLength(2);
    expect(sheet.rows[0][0]).toBe("Anastasia DANIEL");
    expect(sheet.rows[0][13]).toBe("Table d'Honneur");
    expect(sheet.rows[1][7]).toBe("EN ATTENTE");
  });

  it("throws on empty content", () => {
    expect(() => parseSpreadsheet(strToU8("  \n \n"))).toThrow();
  });
});

describe("parseSpreadsheet (csv)", () => {
  it("parses semicolon-delimited CSV with BOM and quoted fields", () => {
    const csv = '﻿Prénom;Nom;Email\n"Jean; Junior";Dupont;jean@example.com\nMarie;"Du ""Pont""";\n';
    const sheet = parseSpreadsheet(strToU8(csv));
    expect(sheet.headers).toEqual(["Prénom", "Nom", "Email"]);
    expect(sheet.rows[0]).toEqual(["Jean; Junior", "Dupont", "jean@example.com"]);
    expect(sheet.rows[1][1]).toBe('Du "Pont"');
  });

  it("parses comma-delimited CSV with English headers", () => {
    const csv = "First name,Last name,Email,RSVP\nJohn,Smith,john@example.com,yes\n";
    const sheet = parseSpreadsheet(strToU8(csv));
    expect(sheet.headers).toEqual(["First name", "Last name", "Email", "RSVP"]);
    expect(sheet.rows[0]).toEqual(["John", "Smith", "john@example.com", "yes"]);
  });
});

// ─── mapRowsToGuests ─────────────────────────────────────────────────────────

describe("mapRowsToGuests", () => {
  it("maps mariages.net columns: rsvp, group, table, address, mobile preference", () => {
    const sheet: ParsedSheet = {
      headers: MARIAGES_NET_HEADERS,
      rows: [
        ["Paul", "Martin", "paul@example.com", "0102030405", "0612345678", "Mariés", "OK", "CONFIRMÉ", "Adultes", "1 rue de la Paix", "75001", "Paris", "75", "Table d'Honneur", "Homme"],
        ["Catherine", "Durand", "", "0102030405", "", "Famille", "", "EN ATTENTE", "Adultes", "", "", "", "", "", "Femme"],
      ],
    };
    const result = mapRowsToGuests(sheet, NO_EXISTING, { makeId: makeIdCounter(), now: "2026-07-02T00:00:00.000Z" });

    expect(result.guests).toHaveLength(2);
    expect(result.skippedRows).toBe(0);

    const paul = result.guests[0];
    expect(paul.firstName).toBe("Paul");
    expect(paul.lastName).toBe("Martin");
    expect(paul.rsvpStatus).toBe("ACCEPTED");
    expect(paul.phone).toBe("0612345678"); // mobile preferred over landline
    expect(paul.address).toBe("1 rue de la Paix, 75001, Paris");
    expect(paul.email).toBe("paul@example.com");
    expect(paul.invitationType).toBe("FULL");

    const catherine = result.guests[1];
    expect(catherine.rsvpStatus).toBe("PENDING");
    expect(catherine.phone).toBe("0102030405"); // landline fallback

    expect(result.groups.map((g) => g.name)).toEqual(["Mariés", "Famille"]);
    expect(result.tables.map((tb) => tb.name)).toEqual(["Table d'Honneur"]);
    expect(paul.groupId).toBe(result.groups[0].id);
    expect(paul.tableId).toBe(result.tables[0].id);
    expect(catherine.groupId).toBe(result.groups[1].id);
    expect(catherine.tableId).toBeNull();
  });

  it("splits a full name found in the first-name column", () => {
    const sheet: ParsedSheet = {
      headers: ["PRÉNOM", "NOM"],
      rows: [["Anastasia DANIEL", ""]],
    };
    const result = mapRowsToGuests(sheet, NO_EXISTING, { makeId: makeIdCounter() });
    expect(result.guests[0].firstName).toBe("Anastasia");
    expect(result.guests[0].lastName).toBe("DANIEL");
  });

  it("reuses existing groups and tables by case-insensitive name", () => {
    const existing = {
      groups: [{ id: "g1", name: "mariés", createdAt: null, updatedAt: null }],
      tables: [{ id: "t1", name: "TABLE D'HONNEUR", capacity: null, notes: null, positionX: null, positionY: null, shape: null }],
    };
    const sheet: ParsedSheet = {
      headers: ["Prénom", "Nom", "Groupe", "Table"],
      rows: [["Paul", "Martin", "Mariés", "Table d'Honneur"]],
    };
    const result = mapRowsToGuests(sheet, existing, { makeId: makeIdCounter() });
    expect(result.groups).toHaveLength(0);
    expect(result.tables).toHaveLength(0);
    expect(result.guests[0].groupId).toBe("g1");
    expect(result.guests[0].tableId).toBe("t1");
  });

  it("skips rows without any name and counts them", () => {
    const sheet: ParsedSheet = {
      headers: ["Prénom", "Nom", "Email"],
      rows: [
        ["", "", "orphan@example.com"],
        ["Marie", "", ""],
      ],
    };
    const result = mapRowsToGuests(sheet, NO_EXISTING, { makeId: makeIdCounter() });
    expect(result.guests).toHaveLength(1);
    expect(result.skippedRows).toBe(1);
  });

  it("maps rsvp values: declined, maybe, unknown → PENDING", () => {
    const sheet: ParsedSheet = {
      headers: ["Prénom", "Statut"],
      rows: [
        ["A", "Annulé"],
        ["B", "peut-être"],
        ["C", "???"],
        ["D", ""],
      ],
    };
    const result = mapRowsToGuests(sheet, NO_EXISTING, { makeId: makeIdCounter() });
    expect(result.guests.map((g) => g.rsvpStatus)).toEqual(["DECLINED", "MAYBE", "PENDING", "PENDING"]);
  });

  it("imports the full xlsx round-trip", () => {
    const bytes = buildXlsx(MARIAGES_NET_HEADERS, [
      ["Paul", "Martin", "", "", "", "Mariés", "OK", "CONFIRMÉ", "Adultes", "", "", "", "", "", "Homme"],
    ]);
    const result = mapRowsToGuests(parseSpreadsheet(bytes), NO_EXISTING, { makeId: makeIdCounter() });
    expect(result.guests).toHaveLength(1);
    expect(result.guests[0].rsvpStatus).toBe("ACCEPTED");
    expect(result.groups).toHaveLength(1);
  });
});

// ─── base64ToBytes ───────────────────────────────────────────────────────────

describe("base64ToBytes", () => {
  it("round-trips binary data", () => {
    const original = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0, 255, 128, 7]);
    const b64 = Buffer.from(original).toString("base64");
    expect(Array.from(base64ToBytes(b64))).toEqual(Array.from(original));
  });

  it("handles unpadded input", () => {
    const b64 = Buffer.from("hello!").toString("base64").replace(/=+$/, "");
    expect(Buffer.from(base64ToBytes(b64)).toString("utf8")).toBe("hello!");
  });
});
