import type { Communication } from './schema.js';

export function addCommunication(communications: Communication[], communication: Communication): Communication[] {
  return [...communications, communication];
}

export function updateCommunication(
  communications: Communication[],
  id: string,
  updates: Partial<Communication>,
): Communication[] {
  const now = new Date().toISOString();
  return communications.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: now } : c));
}

export function removeCommunication(communications: Communication[], id: string): Communication[] {
  return communications.filter((c) => c.id !== id);
}

export function toggleRecipient(
  communications: Communication[],
  commId: string,
  guestId: string,
  today: string,
): Communication[] {
  const now = new Date().toISOString();
  return communications.map((c) => {
    if (c.id !== commId) return c;
    const already = c.recipients.some((r) => r.guestId === guestId);
    const recipients = already
      ? c.recipients.filter((r) => r.guestId !== guestId)
      : [...c.recipients, { guestId, sentAt: today }];
    return { ...c, recipients, updatedAt: now };
  });
}

export function setRecipientDate(
  communications: Communication[],
  commId: string,
  guestId: string,
  sentAt: string | null,
): Communication[] {
  const now = new Date().toISOString();
  return communications.map((c) => {
    if (c.id !== commId) return c;
    const recipients = c.recipients.map((r) => (r.guestId === guestId ? { ...r, sentAt } : r));
    return { ...c, recipients, updatedAt: now };
  });
}

export function bulkSetRecipients(
  communications: Communication[],
  commId: string,
  guestIds: string[],
  sentAt: string | null,
): Communication[] {
  const now = new Date().toISOString();
  const idSet = new Set(guestIds);
  return communications.map((c) => {
    if (c.id !== commId) return c;
    if (sentAt === null) {
      return { ...c, recipients: c.recipients.filter((r) => !idSet.has(r.guestId)), updatedAt: now };
    }
    const existingIds = new Set(c.recipients.map((r) => r.guestId));
    const updated = c.recipients.map((r) => (idSet.has(r.guestId) ? { ...r, sentAt } : r));
    const toAdd = guestIds.filter((id) => !existingIds.has(id)).map((guestId) => ({ guestId, sentAt }));
    return { ...c, recipients: [...updated, ...toAdd], updatedAt: now };
  });
}

export function removeGuestFromAll(communications: Communication[], guestId: string): Communication[] {
  const now = new Date().toISOString();
  return communications.map((c) => {
    const had = c.recipients.some((r) => r.guestId === guestId);
    if (!had) return c;
    return { ...c, recipients: c.recipients.filter((r) => r.guestId !== guestId), updatedAt: now };
  });
}
