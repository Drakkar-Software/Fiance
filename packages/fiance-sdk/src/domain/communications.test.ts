import { describe, it, expect } from 'vitest';
import type { Communication } from './schema.js';
import {
  addCommunication,
  updateCommunication,
  removeCommunication,
  toggleRecipient,
  setRecipientDate,
  removeGuestFromAll,
} from './communications.js';

function makeComm(overrides: Partial<Communication> = {}): Communication {
  return {
    id: 'c1',
    label: 'Faire-part',
    date: null,
    notes: null,
    recipients: [],
    createdAt: null,
    updatedAt: null,
    ...overrides,
  };
}

describe('addCommunication', () => {
  it('appends to list', () => {
    const comm = makeComm();
    const result = addCommunication([], comm);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('c1');
  });
});

describe('updateCommunication', () => {
  it('updates matching entry', () => {
    const comms = [makeComm()];
    const result = updateCommunication(comms, 'c1', { label: 'Save the date' });
    expect(result[0].label).toBe('Save the date');
    expect(result[0].updatedAt).not.toBeNull();
  });

  it('ignores non-matching id', () => {
    const comms = [makeComm()];
    const result = updateCommunication(comms, 'other', { label: 'X' });
    expect(result[0].label).toBe('Faire-part');
  });
});

describe('removeCommunication', () => {
  it('removes matching entry', () => {
    const comms = [makeComm(), makeComm({ id: 'c2', label: 'Menu' })];
    const result = removeCommunication(comms, 'c1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('c2');
  });
});

describe('toggleRecipient', () => {
  it('adds recipient when not present', () => {
    const comms = [makeComm()];
    const result = toggleRecipient(comms, 'c1', 'g1', '2026-06-28');
    expect(result[0].recipients).toHaveLength(1);
    expect(result[0].recipients[0]).toEqual({ guestId: 'g1', sentAt: '2026-06-28' });
  });

  it('removes recipient when already present', () => {
    const comms = [makeComm({ recipients: [{ guestId: 'g1', sentAt: '2026-06-28' }] })];
    const result = toggleRecipient(comms, 'c1', 'g1', '2026-06-28');
    expect(result[0].recipients).toHaveLength(0);
  });

  it('does not touch other communications', () => {
    const comms = [makeComm({ id: 'c1' }), makeComm({ id: 'c2', label: 'Menu' })];
    const result = toggleRecipient(comms, 'c1', 'g1', '2026-06-28');
    expect(result[1].recipients).toHaveLength(0);
  });
});

describe('setRecipientDate', () => {
  it('updates sentAt for matching guest', () => {
    const comms = [makeComm({ recipients: [{ guestId: 'g1', sentAt: null }] })];
    const result = setRecipientDate(comms, 'c1', 'g1', '2026-06-20');
    expect(result[0].recipients[0].sentAt).toBe('2026-06-20');
  });
});

describe('removeGuestFromAll', () => {
  it('strips guest from all communications', () => {
    const comms = [
      makeComm({ id: 'c1', recipients: [{ guestId: 'g1', sentAt: null }, { guestId: 'g2', sentAt: null }] }),
      makeComm({ id: 'c2', label: 'Menu', recipients: [{ guestId: 'g1', sentAt: null }] }),
    ];
    const result = removeGuestFromAll(comms, 'g1');
    expect(result[0].recipients).toHaveLength(1);
    expect(result[0].recipients[0].guestId).toBe('g2');
    expect(result[1].recipients).toHaveLength(0);
  });

  it('does not touch communications without the guest', () => {
    const comms = [makeComm({ recipients: [{ guestId: 'g2', sentAt: null }] })];
    const result = removeGuestFromAll(comms, 'g1');
    expect(result[0].recipients).toHaveLength(1);
    expect(result[0].updatedAt).toBeNull();
  });
});
