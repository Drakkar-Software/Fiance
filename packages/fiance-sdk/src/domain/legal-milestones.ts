import type { LegalMilestone } from './schema.js';

export function addLegalMilestone(
  milestones: LegalMilestone[],
  milestone: LegalMilestone,
): LegalMilestone[] {
  return [...milestones, milestone];
}

export function updateLegalMilestone(
  milestones: LegalMilestone[],
  id: string,
  updates: Partial<LegalMilestone>,
): LegalMilestone[] {
  const now = new Date().toISOString();
  return milestones.map((m) => (m.id === id ? { ...m, ...updates, updatedAt: now } : m));
}

export function removeLegalMilestone(milestones: LegalMilestone[], id: string): LegalMilestone[] {
  return milestones.filter((m) => m.id !== id);
}

export function completeLegalMilestone(
  milestones: LegalMilestone[],
  id: string,
  completedDate: string,
): LegalMilestone[] {
  const now = new Date().toISOString();
  return milestones.map((m) =>
    m.id === id ? { ...m, status: 'DONE', completedDate, updatedAt: now } : m,
  );
}
