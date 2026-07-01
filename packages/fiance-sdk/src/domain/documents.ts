import type { Document } from './schema.js';

export function addDocument(documents: Document[], doc: Document): Document[] {
  return [...documents, doc];
}

export function updateDocument(
  documents: Document[],
  id: string,
  updates: Partial<Document>,
): Document[] {
  const now = new Date().toISOString();
  return documents.map((d) => (d.id === id ? { ...d, ...updates, updatedAt: now } : d));
}

export function removeDocument(documents: Document[], id: string): Document[] {
  return documents.filter((d) => d.id !== id);
}

export function getDocumentsForOwner(documents: Document[], ownerType: string, ownerId: string): Document[] {
  return documents.filter((d) => d.ownerType === ownerType && d.ownerId === ownerId);
}
