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
