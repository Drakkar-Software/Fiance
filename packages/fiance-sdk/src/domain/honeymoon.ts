import type { HoneymoonPlan } from './schema.js';

/** 0–1 row enforced: setting a plan always replaces the collection wholesale. */
export function setHoneymoonPlan(_plans: HoneymoonPlan[], plan: HoneymoonPlan): HoneymoonPlan[] {
  return [plan];
}

export function updateHoneymoonPlan(
  plans: HoneymoonPlan[],
  updates: Partial<HoneymoonPlan>,
): HoneymoonPlan[] {
  if (plans.length === 0) return plans;
  const now = new Date().toISOString();
  return [{ ...plans[0], ...updates, updatedAt: now }];
}

export function removeHoneymoonPlan(_plans: HoneymoonPlan[]): HoneymoonPlan[] {
  return [];
}

export function getHoneymoonPlan(plans: HoneymoonPlan[]): HoneymoonPlan | null {
  return plans[0] ?? null;
}
