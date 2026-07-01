import { describe, it, expect } from 'vitest';
import type { Document } from './schema.js';
import { addDocument, updateDocument, removeDocument, getDocumentsForOwner } from './documents.js';

function makeDoc(overrides: Partial<Document> = {}): Document {
  return {
    id: 'd1',
    ownerType: 'VENDOR',
    ownerId: 'v1',
    label: 'Devis',
    fileName: 'devis.pdf',
    mimeType: 'application/pdf',
    localUri: 'file:///docs/d1.pdf',
    fileSize: 1024,
    uploadedAt: null,
    notes: null,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  };
}

describe('addDocument / updateDocument / removeDocument', () => {
  it('adds, updates, removes', () => {
    const added = addDocument([], makeDoc());
    expect(added).toHaveLength(1);
    const updated = updateDocument(added, 'd1', { label: 'Contrat' });
    expect(updated[0].label).toBe('Contrat');
    expect(updated[0].updatedAt).not.toBeNull();
    const removed = removeDocument(updated, 'd1');
    expect(removed).toHaveLength(0);
  });
});

describe('getDocumentsForOwner', () => {
  it('filters by ownerType and ownerId', () => {
    const docs = [
      makeDoc({ id: 'd1', ownerType: 'VENDOR', ownerId: 'v1' }),
      makeDoc({ id: 'd2', ownerType: 'VENDOR', ownerId: 'v2' }),
      makeDoc({ id: 'd3', ownerType: 'LEGAL', ownerId: 'v1' }),
    ];
    expect(getDocumentsForOwner(docs, 'VENDOR', 'v1').map((d) => d.id)).toEqual(['d1']);
  });
});
