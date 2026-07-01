import { describe, it, expect } from 'vitest';
import type { CommunicationTemplate, Guest, Wedding } from './schema.js';
import {
  addCommunicationTemplate,
  updateCommunicationTemplate,
  removeCommunicationTemplate,
  renderTemplate,
} from './communication-templates.js';

function makeTemplate(overrides: Partial<CommunicationTemplate> = {}): CommunicationTemplate {
  return {
    id: 't1',
    name: 'Save-the-date',
    channel: 'EMAIL',
    subject: 'Save the date {{guest.firstName}} !',
    body: 'Bonjour {{guest.firstName}}, {{wedding.partner1Name}} & {{wedding.partner2Name}} se marient le {{wedding.weddingDate}} à {{wedding.venueName}}.',
    isSystem: null,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  };
}

function makeGuest(overrides: Partial<Guest> = {}): Guest {
  return {
    id: 'g1',
    firstName: 'Alice',
    lastName: 'Dupont',
    side: null,
    invitationType: 'FULL',
    rsvpStatus: null,
    rsvpDate: null,
    isSleeping: null,
    childrenCount: null,
    diet: null,
    dietNotes: null,
    groupId: null,
    tableId: null,
    companionId: null,
    noTableNeeded: null,
    giftDescription: null,
    thankYouSent: null,
    thankYouSentDate: null,
    accommodationId: null,
    roomNumber: null,
    rsvpToken: null,
    email: null,
    phone: null,
    address: null,
    notes: null,
    shuttleVendorId: null,
    shuttlePickupLocation: null,
    shuttlePickupTime: null,
    parkingNeeded: null,
    parkingNotes: null,
    arrivalNotes: null,
    transportMode: null,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  };
}

const wedding: Wedding = {
  id: 1,
  partner1Name: 'Léa',
  partner2Name: 'Thomas',
  weddingDate: '2026-06-20',
  venueName: 'Domaine des Oliviers',
  description: null,
  faq: null,
  eventPhotos: null,
  budgetTarget: null,
  categoryBudgets: null,
  currency: null,
  createdAt: null,
  updatedAt: null,
};

describe('addCommunicationTemplate / updateCommunicationTemplate / removeCommunicationTemplate', () => {
  it('adds, updates, removes', () => {
    const added = addCommunicationTemplate([], makeTemplate());
    expect(added).toHaveLength(1);
    const updated = updateCommunicationTemplate(added, 't1', { name: 'Faire-part' });
    expect(updated[0].name).toBe('Faire-part');
    expect(updated[0].updatedAt).not.toBeNull();
    const removed = removeCommunicationTemplate(updated, 't1');
    expect(removed).toHaveLength(0);
  });
});

describe('renderTemplate', () => {
  it('substitutes guest and wedding placeholders', () => {
    const result = renderTemplate(makeTemplate(), makeGuest(), wedding);
    expect(result.subject).toBe('Save the date Alice !');
    expect(result.body).toBe('Bonjour Alice, Léa & Thomas se marient le 2026-06-20 à Domaine des Oliviers.');
  });

  it('leaves unknown placeholders untouched', () => {
    const result = renderTemplate(makeTemplate({ body: 'Hello {{unknown.key}}' }), makeGuest(), wedding);
    expect(result.body).toBe('Hello {{unknown.key}}');
  });

  it('substitutes with empty strings when guest/wedding are null', () => {
    const result = renderTemplate(makeTemplate({ subject: null }), null, null);
    expect(result.subject).toBeNull();
    expect(result.body).toBe('Bonjour ,  &  se marient le  à .');
  });
});
