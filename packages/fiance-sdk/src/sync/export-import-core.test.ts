import { describe, it, expect } from 'vitest';
import {
  buildExportFilename,
  parseExportDoc,
  validateExportDoc,
  parseAndRestore,
} from './export-import-core.js';
import {
  BACKUP_VERSION,
  createBackupDocument,
  migrateBackup,
  type WeddingSnapshot,
} from './backup.js';

function emptySnapshot(overrides: Partial<WeddingSnapshot> = {}): WeddingSnapshot {
  return {
    wedding: null,
    guests: [],
    tables: [],
    guestGroups: [],
    vendors: [],
    quotePricings: [],
    tasks: [],
    taskCategories: [],
    agendaEvents: [],
    dayOfItems: [],
    ideas: [],
    ideaCollections: [],
    vendorPayments: [],
    accommodations: [],
    gifts: [],
    contributors: [],
    invitationTypes: [],
    communications: [],
    weddingRoles: [],
    weddingRoleAssignments: [],
    seatingConstraints: [],
    weddingEvents: [],
    guestMealSelections: [],
    communicationTemplates: [],
    documents: [],
    legalMilestones: [],
    honeymoonPlans: [],
    ceremonyItems: [],
    speeches: [],
    playlistTracks: [],
    permissionRoles: [],
    permissionAssignments: [],
    ...overrides,
  } as WeddingSnapshot;
}

function validDocJson(snapshot: WeddingSnapshot = emptySnapshot()): string {
  return JSON.stringify(createBackupDocument(snapshot));
}

describe('buildExportFilename', () => {
  it('builds Fiancé_<label>_<YYYY-MM-DD>.json using today as the date', () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(buildExportFilename('Marie & Paul')).toBe(`Fiancé_Marie & Paul_${today}.json`);
  });

  it('keeps accented French letters in the label', () => {
    expect(buildExportFilename('Émilie & Léo')).toMatch(/^Fiancé_Émilie & Léo_\d{4}-\d{2}-\d{2}\.json$/);
  });

  it('strips characters that are unsafe in file names', () => {
    expect(buildExportFilename('Marie/Paul: "2026"!')).toMatch(/^Fiancé_MariePaul 2026_\d{4}-\d{2}-\d{2}\.json$/);
  });

  it('falls back to "wedding" when the label has no safe characters', () => {
    expect(buildExportFilename('///')).toMatch(/^Fiancé_wedding_\d{4}-\d{2}-\d{2}\.json$/);
    expect(buildExportFilename('')).toMatch(/^Fiancé_wedding_\d{4}-\d{2}-\d{2}\.json$/);
  });
});

describe('parseExportDoc', () => {
  it('returns invalid_json for text that is not JSON', () => {
    expect(parseExportDoc('{not json')).toBe('invalid_json');
    expect(parseExportDoc('')).toBe('invalid_json');
  });

  it.each([
    ['null', 'null'],
    ['an array', '[]'],
    ['a string', '"16"'],
    ['an object without version', '{"guests":[]}'],
    ['a non-numeric version', '{"version":"16"}'],
  ])('returns invalid_backup for %s', (_label, json) => {
    expect(parseExportDoc(json)).toBe('invalid_backup');
  });

  it('returns the parsed backup for a document produced by createBackupDocument', () => {
    const doc = parseExportDoc(validDocJson());
    expect(typeof doc).toBe('object');
    expect((doc as { version: number }).version).toBe(BACKUP_VERSION);
  });
});

describe('validateExportDoc', () => {
  it('returns invalid_backup when the version field is missing', () => {
    expect(validateExportDoc({})).toBe('invalid_backup');
    expect(validateExportDoc({ guests: [] })).toBe('invalid_backup');
  });

  it('returns invalid_backup when the version is not a number', () => {
    expect(validateExportDoc({ version: 'latest' })).toBe('invalid_backup');
  });

  it('returns the backup unchanged when the version is a number', () => {
    const raw = { version: BACKUP_VERSION, guests: [] };
    expect(validateExportDoc(raw)).toEqual(raw);
  });
});

describe('migrateBackup', () => {
  it('throws invalid_backup for non-object input', () => {
    expect(() => migrateBackup(null)).toThrow('invalid_backup');
    expect(() => migrateBackup('16')).toThrow('invalid_backup');
    expect(() => migrateBackup(16)).toThrow('invalid_backup');
  });

  it('throws invalid_backup when version is missing or not a number', () => {
    expect(() => migrateBackup({})).toThrow('invalid_backup');
    expect(() => migrateBackup({ version: null })).toThrow('invalid_backup');
  });

  it('accepts any object with a numeric version', () => {
    expect(migrateBackup({ version: 3 })).toEqual({ version: 3 });
  });
});

describe('parseAndRestore', () => {
  it('passes invalid JSON through as invalid_json', () => {
    expect(parseAndRestore('{')).toBe('invalid_json');
  });

  it('passes a structurally invalid document through as invalid_backup', () => {
    expect(parseAndRestore('{"guests":[]}')).toBe('invalid_backup');
  });

  it('round-trips a snapshot through JSON', () => {
    const guest = { id: 'g1', firstName: 'Ada', lastName: 'Lovelace', invitationType: 'FULL' };
    const restored = parseAndRestore(validDocJson(emptySnapshot({ guests: [guest as never] })));
    expect(restored).not.toBeTypeOf('string');
    expect((restored as WeddingSnapshot).guests).toEqual([guest]);
    expect((restored as WeddingSnapshot).wedding).toBeNull();
  });

  it('maps legacy DINNER and NEXT_DAY invitation types on guests during restore', () => {
    const guests = [
      { id: 'g1', invitationType: 'DINNER' },
      { id: 'g2', invitationType: 'NEXT_DAY' },
      { id: 'g3' },
    ];
    const restored = parseAndRestore(
      validDocJson(emptySnapshot({ guests: guests as never }))
    ) as WeddingSnapshot;
    expect(restored.guests.map((g) => g.invitationType)).toEqual(['FULL', 'BOTH_DAYS', 'FULL']);
  });

  it('rejects a backup written by a newer app version', () => {
    const doc = createBackupDocument(emptySnapshot());
    const newer = JSON.stringify({ ...doc, version: BACKUP_VERSION + 1 });
    expect(() => parseAndRestore(newer)).toThrow(/newer than app version/);
  });
});
