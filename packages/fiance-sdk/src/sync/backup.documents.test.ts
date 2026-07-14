/**
 * Documents are metadata-only in backups — binaries never leave the device.
 * createBackupDocument must strip localUri; restoreFromBackup passes the
 * stripped value through untouched (the app UI prompts "re-attach" on "").
 */
import { describe, it, expect } from 'vitest';
import { createBackupDocument, restoreFromBackup, type WeddingSnapshot } from './backup.js';

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
  };
}

describe('createBackupDocument — documents localUri strip', () => {
  it('strips localUri to "" so the exported JSON carries no device paths', () => {
    const snapshot = emptySnapshot({
      documents: [{
        id: 'd1',
        ownerType: 'VENDOR',
        ownerId: 'v1',
        label: 'Devis traiteur',
        fileName: 'devis.pdf',
        mimeType: 'application/pdf',
        localUri: 'file:///private/var/mobile/wedding-docs/d1.pdf',
        fileSize: 2048,
        uploadedAt: null,
        notes: null,
        createdAt: null,
        updatedAt: null,
      }],
    });
    const backup = createBackupDocument(snapshot);
    expect(backup.documents).toHaveLength(1);
    expect((backup.documents as any[])[0].localUri).toBe('');
    expect((backup.documents as any[])[0].label).toBe('Devis traiteur');
  });
});

describe('restoreFromBackup — documents pass through with stripped localUri', () => {
  it('restores document metadata with an empty localUri intact', () => {
    const snapshot = emptySnapshot({
      documents: [{
        id: 'd1',
        ownerType: 'VENDOR',
        ownerId: 'v1',
        label: 'Devis traiteur',
        fileName: 'devis.pdf',
        mimeType: 'application/pdf',
        localUri: 'file:///wedding-docs/d1.pdf',
        fileSize: 2048,
        uploadedAt: null,
        notes: null,
        createdAt: null,
        updatedAt: null,
      }],
    });
    const backup = createBackupDocument(snapshot);
    const restored = restoreFromBackup(backup);
    expect(restored.documents).toHaveLength(1);
    expect(restored.documents[0].localUri).toBe('');
  });
});

describe('v14 → v15 round trip — ceremonyItems, speeches, playlistTracks, DayOfItem live fields', () => {
  it('preserves the 3 new collections through a backup round trip', () => {
    const snapshot = emptySnapshot({
      ceremonyItems: [{
        id: 'c1', eventId: null, kind: 'READING', title: 'Lecture 1', reference: null,
        content: 'Un texte', guestId: null, performerName: 'Chorale', roleId: null,
        notes: null, sortOrder: 1, createdAt: null, updatedAt: null,
      }],
      speeches: [{
        id: 's1', title: 'Discours du témoin', guestId: null, speakerName: 'Alice',
        roleId: null, durationMin: 5, dayOfItemId: null, content: null,
        sortOrder: 1, createdAt: null, updatedAt: null,
      }],
      playlistTracks: [{
        id: 't1', title: 'Perfect', artist: 'Ed Sheeran', moment: 'FIRST_DANCE',
        dayOfItemId: null, mustPlay: true, notes: null, sortOrder: 1,
        createdAt: null, updatedAt: null,
      }],
    });
    const backup = createBackupDocument(snapshot);
    const restored = restoreFromBackup(backup);
    expect(restored.ceremonyItems).toHaveLength(1);
    expect(restored.ceremonyItems[0].title).toBe('Lecture 1');
    expect(restored.speeches).toHaveLength(1);
    expect(restored.speeches[0].speakerName).toBe('Alice');
    expect(restored.playlistTracks).toHaveLength(1);
    expect(restored.playlistTracks[0].mustPlay).toBe(true);
  });

  it('preserves DayOfItem completedAt/roleId through a backup round trip', () => {
    const snapshot = emptySnapshot({
      dayOfItems: [{
        id: 'd1', title: 'Entrée des mariés', date: null, time: '15:00', endTime: null,
        location: null, responsible: null, notes: null, isPublic: false, sortOrder: 1,
        eventId: null, completedAt: '2026-09-15T15:05:00.000Z', roleId: 'role1',
        createdAt: null, updatedAt: null,
      }],
    });
    const backup = createBackupDocument(snapshot);
    const restored = restoreFromBackup(backup);
    expect(restored.dayOfItems).toHaveLength(1);
    expect(restored.dayOfItems[0].completedAt).toBe('2026-09-15T15:05:00.000Z');
    expect(restored.dayOfItems[0].roleId).toBe('role1');
  });

  it('defaults the 3 new collections to empty arrays for pre-v15 backups', () => {
    const snapshot = emptySnapshot();
    const backup = createBackupDocument(snapshot);
    // Simulate a pre-v15 backup that never had these keys.
    delete (backup as any).ceremonyItems;
    delete (backup as any).speeches;
    delete (backup as any).playlistTracks;
    const restored = restoreFromBackup(backup);
    expect(restored.ceremonyItems).toEqual([]);
    expect(restored.speeches).toEqual([]);
    expect(restored.playlistTracks).toEqual([]);
  });
});

describe('wedding.premium round trip', () => {
  it('passes the premium flag through opaquely (additive field, no migration)', () => {
    const snapshot = emptySnapshot({
      wedding: {
        id: 1, partner1Name: 'Alice', partner2Name: 'Bob', weddingDate: null,
        venueName: null, description: null, faq: null, eventPhotos: null,
        budgetTarget: null, categoryBudgets: null, currency: 'EUR',
        createdAt: null, updatedAt: null, premium: true,
      },
    });
    const backup = createBackupDocument(snapshot);
    const restored = restoreFromBackup(backup);
    expect(restored.wedding?.premium).toBe(true);
  });

  it('restores undefined for a pre-existing backup that never had the field', () => {
    const snapshot = emptySnapshot({
      wedding: {
        id: 1, partner1Name: 'Alice', partner2Name: 'Bob', weddingDate: null,
        venueName: null, description: null, faq: null, eventPhotos: null,
        budgetTarget: null, categoryBudgets: null, currency: 'EUR',
        createdAt: null, updatedAt: null,
      },
    });
    const backup = createBackupDocument(snapshot);
    const restored = restoreFromBackup(backup);
    expect(restored.wedding?.premium).toBeUndefined();
  });
});
