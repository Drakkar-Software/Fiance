/**
 * Guest list import from external spreadsheets (.xlsx / .csv).
 * Pure logic — no React Native or Expo imports, unit-testable in node.
 *
 * Supports generic Excel/CSV exports and mariages.net guest exports
 * (headers: PRÉNOM, NOM, E-MAIL, TÉLÉPHONE, TÉLÉPHONE PORTABLE, GROUPE,
 * INVITÉ, CONFIRMÉ, MENU, ADRESSE, CODE POSTAL, VILLE, DÉPARTEMENT, TABLE, SEXE).
 */

import { unzipSync, strFromU8 } from "fflate";
import type { Guest, GuestGroup, Table } from "@fiance/sdk";

export interface ParsedSheet {
  headers: string[];
  rows: string[][];
}

export interface GuestImportResult {
  guests: Guest[];
  /** Newly created groups only (existing ones are reused by name). */
  groups: GuestGroup[];
  /** Newly created tables only (existing ones are reused by name). */
  tables: Table[];
  skippedRows: number;
}

// ─── Bytes helpers ───────────────────────────────────────────────────────────

const B64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

export function base64ToBytes(b64: string): Uint8Array {
  const clean = b64.replace(/[^A-Za-z0-9+/]/g, "");
  const len = Math.floor((clean.length * 3) / 4);
  const bytes = new Uint8Array(len);
  let p = 0;
  for (let i = 0; i + 1 < clean.length; i += 4) {
    const a = B64_CHARS.indexOf(clean[i]);
    const b = B64_CHARS.indexOf(clean[i + 1]);
    const c = i + 2 < clean.length ? B64_CHARS.indexOf(clean[i + 2]) : -1;
    const d = i + 3 < clean.length ? B64_CHARS.indexOf(clean[i + 3]) : -1;
    bytes[p++] = (a << 2) | (b >> 4);
    if (c >= 0) bytes[p++] = ((b & 15) << 4) | (c >> 2);
    if (d >= 0) bytes[p++] = ((c & 3) << 6) | d;
  }
  return bytes.subarray(0, p);
}

// ─── Spreadsheet parsing ─────────────────────────────────────────────────────

/**
 * Parse .xlsx or .csv bytes into headers + rows.
 * Format detected by magic bytes (PK zip header → xlsx, else CSV text).
 * Throws on unreadable content.
 */
export function parseSpreadsheet(bytes: Uint8Array): ParsedSheet {
  const isZip = bytes.length > 3 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
  const grid = isZip ? parseXlsx(bytes) : parseCsv(strFromU8(bytes));
  const firstNonEmpty = grid.findIndex((r) => r.some((c) => c.trim() !== ""));
  if (firstNonEmpty < 0) throw new Error("empty spreadsheet");
  const headers = grid[firstNonEmpty].map((h) => h.trim());
  const rows = grid.slice(firstNonEmpty + 1).filter((r) => r.some((c) => c.trim() !== ""));
  return { headers, rows };
}

function unescapeXml(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&amp;/g, "&");
}

/** Strip XML tags from a shared-string item (rich text runs keep their text). */
function textFromXml(xml: string): string {
  return unescapeXml(xml.replace(/<[^>]*>/g, ""));
}

function colLetterToIndex(ref: string): number {
  const letters = ref.match(/^[A-Z]+/)?.[0] ?? "A";
  let idx = 0;
  for (const ch of letters) idx = idx * 26 + (ch.charCodeAt(0) - 64);
  return idx - 1;
}

function parseXlsx(bytes: Uint8Array): string[][] {
  const files = unzipSync(bytes, {
    filter: (f) => f.name === "xl/sharedStrings.xml" || /^xl\/worksheets\/sheet\d*\.xml$/.test(f.name),
  });
  const sharedXml = files["xl/sharedStrings.xml"];
  const shared: string[] = sharedXml
    ? (strFromU8(sharedXml).match(/<si>[\s\S]*?<\/si>/g) ?? []).map(textFromXml)
    : [];
  const sheetName = Object.keys(files)
    .filter((n) => n.startsWith("xl/worksheets/"))
    .sort()[0];
  if (!sheetName) throw new Error("no worksheet found");
  const sheetXml = strFromU8(files[sheetName]);

  const grid: string[][] = [];
  for (const rowXml of sheetXml.match(/<row[^>]*>[\s\S]*?<\/row>/g) ?? []) {
    const row: string[] = [];
    const cellRe = /<c\s([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g;
    let m: RegExpExecArray | null;
    while ((m = cellRe.exec(rowXml)) !== null) {
      const attrs = m[1];
      const inner = m[2] ?? "";
      const ref = attrs.match(/r="([A-Z]+\d+)"/)?.[1];
      const type = attrs.match(/t="(\w+)"/)?.[1];
      const col = ref ? colLetterToIndex(ref) : row.length;
      let value = "";
      if (type === "inlineStr") {
        value = textFromXml(inner);
      } else {
        const v = inner.match(/<v[^>]*>([\s\S]*?)<\/v>/)?.[1];
        if (v != null) {
          value = type === "s" ? (shared[parseInt(v, 10)] ?? "") : unescapeXml(v);
        }
      }
      row[col] = value;
    }
    grid.push(Array.from(row, (c) => c ?? ""));
  }
  return grid;
}

function sniffDelimiter(line: string): string {
  const counts: [string, number][] = [";", ",", "\t"].map((d) => [d, line.split(d).length - 1]);
  counts.sort((a, b) => b[1] - a[1]);
  return counts[0][1] > 0 ? counts[0][0] : ";";
}

function parseCsv(text: string): string[][] {
  const src = text.replace(/^\uFEFF/, "");
  const delimiter = sniffDelimiter(src.split(/\r?\n/, 1)[0] ?? "");
  const grid: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"' && field === "") {
      inQuotes = true;
    } else if (ch === delimiter) {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      grid.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    grid.push(row);
  }
  return grid;
}

// ─── Header → guest-field mapping ────────────────────────────────────────────

type GuestField =
  | "firstName"
  | "lastName"
  | "email"
  | "phoneMobile"
  | "phone"
  | "group"
  | "rsvp"
  | "table"
  | "addressStreet"
  | "addressZip"
  | "addressCity"
  | "notes";

const HEADER_SYNONYMS: Record<GuestField, string[]> = {
  firstName: ["prenom", "first name", "firstname"],
  lastName: ["nom", "nom de famille", "last name", "lastname", "surname"],
  email: ["e-mail", "email", "courriel", "mail"],
  phoneMobile: ["telephone portable", "portable", "mobile"],
  phone: ["telephone", "phone", "tel"],
  group: ["groupe", "group"],
  rsvp: ["confirme", "statut", "rsvp", "reponse", "status"],
  table: ["table"],
  addressStreet: ["adresse", "address"],
  addressZip: ["code postal", "postal code", "zip", "zip code"],
  addressCity: ["ville", "city"],
  notes: ["notes", "commentaire", "commentaires"],
};

function normalizeHeader(h: string): string {
  return h
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function mapHeaders(headers: string[]): Partial<Record<GuestField, number>> {
  const mapping: Partial<Record<GuestField, number>> = {};
  headers.forEach((header, idx) => {
    const norm = normalizeHeader(header);
    for (const [field, synonyms] of Object.entries(HEADER_SYNONYMS) as [GuestField, string[]][]) {
      if (mapping[field] == null && synonyms.includes(norm)) {
        mapping[field] = idx;
        return;
      }
    }
  });
  return mapping;
}

function mapRsvpStatus(raw: string): string {
  const norm = normalizeHeader(raw);
  if (["confirme", "confirmee", "accepte", "acceptee", "accepted", "oui", "yes", "ok"].includes(norm)) return "ACCEPTED";
  if (["annule", "annulee", "refuse", "refusee", "declined", "decline", "non", "no"].includes(norm)) return "DECLINED";
  if (["peut-etre", "peut etre", "maybe"].includes(norm)) return "MAYBE";
  return "PENDING";
}

// ─── Rows → guests mapping ───────────────────────────────────────────────────

export function mapRowsToGuests(
  sheet: ParsedSheet,
  existing: { groups: GuestGroup[]; tables: Table[] },
  opts: { makeId: () => string; now?: string },
): GuestImportResult {
  const now = opts.now ?? new Date().toISOString();
  const mapping = mapHeaders(sheet.headers);
  const cell = (row: string[], field: GuestField): string => {
    const idx = mapping[field];
    return idx == null ? "" : (row[idx] ?? "").trim();
  };

  const groupIdsByName = new Map(existing.groups.map((g) => [g.name.trim().toLowerCase(), g.id]));
  const tableIdsByName = new Map(existing.tables.map((tb) => [tb.name.trim().toLowerCase(), tb.id]));
  const newGroups: GuestGroup[] = [];
  const newTables: Table[] = [];
  const guests: Guest[] = [];
  let skippedRows = 0;

  for (const row of sheet.rows) {
    let firstName = cell(row, "firstName");
    let lastName = cell(row, "lastName");
    if (!firstName && !lastName) {
      skippedRows++;
      continue;
    }
    // mariages.net sometimes puts the full name in PRÉNOM with an empty NOM
    if (firstName && !lastName && firstName.includes(" ")) {
      const spaceIdx = firstName.indexOf(" ");
      lastName = firstName.slice(spaceIdx + 1).trim();
      firstName = firstName.slice(0, spaceIdx).trim();
    }

    const groupName = cell(row, "group");
    let groupId: string | null = null;
    if (groupName) {
      const key = groupName.toLowerCase();
      groupId = groupIdsByName.get(key) ?? null;
      if (!groupId) {
        groupId = opts.makeId();
        groupIdsByName.set(key, groupId);
        newGroups.push({ id: groupId, name: groupName, createdAt: now, updatedAt: now });
      }
    }

    const tableName = cell(row, "table");
    let tableId: string | null = null;
    if (tableName) {
      const key = tableName.toLowerCase();
      tableId = tableIdsByName.get(key) ?? null;
      if (!tableId) {
        tableId = opts.makeId();
        tableIdsByName.set(key, tableId);
        newTables.push({ id: tableId, name: tableName, capacity: null, notes: null, positionX: null, positionY: null, shape: null });
      }
    }

    const address = [cell(row, "addressStreet"), cell(row, "addressZip"), cell(row, "addressCity")]
      .filter(Boolean)
      .join(", ");

    guests.push({
      id: opts.makeId(),
      firstName,
      lastName,
      side: null,
      invitationType: "FULL",
      rsvpStatus: mapRsvpStatus(cell(row, "rsvp")),
      rsvpDate: null,
      isSleeping: null,
      childrenCount: 0,
      diet: "STANDARD",
      dietNotes: null,
      groupId,
      tableId,
      companionId: null,
      noTableNeeded: null,
      giftDescription: null,
      thankYouSent: null,
      thankYouSentDate: null,
      accommodationId: null,
      roomNumber: null,
      rsvpToken: null,
      email: cell(row, "email") || null,
      phone: cell(row, "phoneMobile") || cell(row, "phone") || null,
      address: address || null,
      notes: cell(row, "notes") || null,
      shuttleVendorId: null,
      shuttlePickupLocation: null,
      shuttlePickupTime: null,
      parkingNeeded: null,
      parkingNotes: null,
      arrivalNotes: null,
      transportMode: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  return { guests, groups: newGroups, tables: newTables, skippedRows };
}
