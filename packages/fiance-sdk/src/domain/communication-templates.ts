import type { CommunicationTemplate, Guest, Wedding } from './schema.js';

export function addCommunicationTemplate(
  templates: CommunicationTemplate[],
  template: CommunicationTemplate,
): CommunicationTemplate[] {
  return [...templates, template];
}

export function updateCommunicationTemplate(
  templates: CommunicationTemplate[],
  id: string,
  updates: Partial<CommunicationTemplate>,
): CommunicationTemplate[] {
  const now = new Date().toISOString();
  return templates.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: now } : t));
}

export function removeCommunicationTemplate(
  templates: CommunicationTemplate[],
  id: string,
): CommunicationTemplate[] {
  return templates.filter((t) => t.id !== id);
}

const PLACEHOLDER_RE = /\{\{\s*([\w.]+)\s*\}\}/g;

function placeholderValues(guest: Guest | null, wedding: Wedding | null): Record<string, string> {
  return {
    'guest.firstName': guest?.firstName ?? '',
    'guest.lastName': guest?.lastName ?? '',
    'wedding.partner1Name': wedding?.partner1Name ?? '',
    'wedding.partner2Name': wedding?.partner2Name ?? '',
    'wedding.weddingDate': wedding?.weddingDate ?? '',
    'wedding.venueName': wedding?.venueName ?? '',
  };
}

function fillPlaceholders(text: string, values: Record<string, string>): string {
  return text.replace(PLACEHOLDER_RE, (match, key) => (key in values ? values[key] : match));
}

/** Render a template's subject/body against a guest + wedding, substituting {{guest.x}} / {{wedding.x}} placeholders. */
export function renderTemplate(
  template: CommunicationTemplate,
  guest: Guest | null,
  wedding: Wedding | null,
): { subject: string | null; body: string } {
  const values = placeholderValues(guest, wedding);
  return {
    subject: template.subject ? fillPlaceholders(template.subject, values) : null,
    body: fillPlaceholders(template.body, values),
  };
}
