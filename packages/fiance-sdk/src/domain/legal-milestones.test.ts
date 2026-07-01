import { describe, it, expect } from 'vitest';
import type { LegalMilestone } from './schema.js';
import {
  addLegalMilestone,
  updateLegalMilestone,
  removeLegalMilestone,
  completeLegalMilestone,
} from './legal-milestones.js';

function makeMilestone(overrides: Partial<LegalMilestone> = {}): LegalMilestone {
  return {
    id: 'm1',
    type: 'CIVIL_APPOINTMENT',
    title: 'RDV à la mairie',
    dueDate: null,
    completedDate: null,
    status: 'TODO',
    location: null,
    notes: null,
    documentIds: null,
    reminderDaysBefore: null,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  };
}

describe('addLegalMilestone / updateLegalMilestone / removeLegalMilestone', () => {
  it('adds, updates, removes', () => {
    const added = addLegalMilestone([], makeMilestone());
    expect(added).toHaveLength(1);
    const updated = updateLegalMilestone(added, 'm1', { title: 'Mairie du 11e' });
    expect(updated[0].title).toBe('Mairie du 11e');
    expect(updated[0].updatedAt).not.toBeNull();
    const removed = removeLegalMilestone(updated, 'm1');
    expect(removed).toHaveLength(0);
  });
});

describe('completeLegalMilestone', () => {
  it('marks status DONE and stamps completedDate', () => {
    const result = completeLegalMilestone([makeMilestone()], 'm1', '2026-05-01');
    expect(result[0].status).toBe('DONE');
    expect(result[0].completedDate).toBe('2026-05-01');
  });

  it('does not touch other milestones', () => {
    const milestones = [makeMilestone({ id: 'm1' }), makeMilestone({ id: 'm2' })];
    const result = completeLegalMilestone(milestones, 'm1', '2026-05-01');
    expect(result[1].status).toBe('TODO');
  });
});
