/** Earliest date an article may go live (inclusive). */
export const BLOG_FIRST_PUBLISH_DATE = "2026-06-23";

/**
 * Publication order by SEO importance (most important first).
 * Dates are assigned sequentially from BLOG_FIRST_PUBLISH_DATE — max 1 post per day.
 */
export const BLOG_PUBLISH_PRIORITY: string[] = [
  // Tier 1 — landing + core planning
  "premieres-etapes-organiser-mariage",
  "combien-temps-organiser-mariage",
  "budget-mariage-2026-combien-prevoir",
  "retroplanning-mariage-mois-par-mois",
  "organiser-mariage-10-etapes",
  "mariage-6-mois-checklist",
  "checklist-mariage-50-taches",
  "excel-vs-application-mariage",
  "app-mariage-privee-hors-ligne",
  "mariage-18-24-mois-premieres-actions",
  "sept-decisions-mariage",
  "repartir-taches-mariage-deux",
  // Tier 2 — comparisons & app roundups
  "fiance-vs-mariages-net",
  "fiance-vs-zankyou",
  "fiance-vs-mywed",
  "top-5-applications-mariage-2026",
  "meilleures-applications-mariage-gratuit-france",
  "top-5-apps-mariage-vie-privee-offline",
  // Tier 3 — budget
  "budget-mariage-cout-par-invite",
  "repartition-budget-mariage-par-poste",
  "acomptes-soldes-mariage-echeances",
  "postes-budget-mariage-depassements",
  "mariage-petit-budget-10-conseils",
  "open-bar-ou-consommation-mariage",
  "comparer-devis-traiteur-mariage",
  "budget-mariage-par-region-france",
  // Tier 4 — guests & RSVP
  "liste-invites-mariage-sans-conflits",
  "rsvp-mariage-quand-relancer",
  "rsvp-en-ligne-sans-compte",
  "taux-reponse-rsvp-mariage",
  "suivre-communications-invites-mariage",
  "save-the-date-faire-part-calendrier",
  "gerer-plus-un-enfants-regimes-alimentaires",
  "mariage-intime-vs-grande-reception",
  "protocole-invitations-qui-inviter",
  "faire-part-parents-divorces",
  // Tier 5 — seating
  "plan-de-table-mariage-guide-complet",
  "plan-de-table-5-regles-placement",
  "tables-rondes-ou-rectangulaires-mariage",
  "plan-de-table-serpentin-mariage",
  "finaliser-plan-de-table-traiteur",
  "table-honneur-formats-mariage",
  "plan-de-table-enfants-mariage",
  "placement-libre-ou-assigne-mariage",
  // Tier 6 — vendors
  "ordre-reservation-prestataires-mariage",
  "cinq-prestataires-a-booker-priorite",
  "negocier-devis-mariage",
  "centraliser-devis-prestataires-mariage",
  "tableau-bord-prestataires-mariage",
  "choisir-photographe-mariage",
  "choisir-dj-mariage",
  "choisir-fleuriste-mariage",
  // Tier 7 — day-of
  "planning-jour-j-minute-par-minute",
  "repartir-roles-jour-j-mariage",
  "mode-jour-j-suivre-deroule",
  "programme-mariage-partager-invites",
  "imprevus-jour-j-mariage",
  "pourboires-enveloppes-mariage-jour-j",
  // Tier 8 — wedding page & digital
  "creer-page-web-mariage",
  "faq-mariage-invites-15-questions",
  "partage-photos-mariage-qr-code",
  "liste-cadeaux-mariage-guide",
  "hebergement-invites-mariage",
  // Tier 9 — inspiration & theme
  "mood-board-mariage-organiser",
  "definir-theme-mariage-5-etapes",
  "tendances-mariage-2026",
  "palette-couleurs-mariage",
  "choisir-alliances-mariage",
  "organiser-mariage-a-deux-sync",
  // Tier 10 — admin & legal
  "dossier-mairie-bans-mariage-delais",
  "ceremonie-laique-choisir-officiant",
  "choisir-temoins-role-mariage",
  "assurance-annulation-mariage",
  "remerciements-apres-mariage",
];

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}

function buildPublishDates(): Record<string, string> {
  const dates: Record<string, string> = {};
  BLOG_PUBLISH_PRIORITY.forEach((slug, index) => {
    dates[slug] = addDays(BLOG_FIRST_PUBLISH_DATE, index);
  });
  return dates;
}

/** Publication dates from 23 Jun 2026 onward, ordered by SEO importance. */
export const BLOG_PUBLISH_DATES: Record<string, string> = buildPublishDates();

/** Last content-edit date per slug. Add an entry only when title, excerpt, or sections change. */
export const BLOG_CONTENT_UPDATED: Record<string, string> = {
  "fiance-vs-mariages-net": "2026-07-10",
  "fiance-vs-zankyou": "2026-07-10",
  "fiance-vs-mywed": "2026-07-10",
  "top-5-applications-mariage-2026": "2026-07-10",
  "meilleures-applications-mariage-gratuit-france": "2026-07-10",
  "top-5-apps-mariage-vie-privee-offline": "2026-07-10",
};

export function getBlogPublishDate(slug: string): string {
  return BLOG_PUBLISH_DATES[slug] ?? addDays(BLOG_FIRST_PUBLISH_DATE, BLOG_PUBLISH_PRIORITY.length);
}

export function getBlogContentUpdated(slug: string): string | undefined {
  return BLOG_CONTENT_UPDATED[slug];
}

/** ISO date (YYYY-MM-DD) used at build time to decide which posts are live. Override via BUILD_DATE env. */
export function getBuildDate(): string {
  const raw = typeof process !== "undefined" ? process.env.BUILD_DATE : undefined;
  if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  return new Date().toISOString().slice(0, 10);
}

/** True when the post's publish date is on or before the reference date (defaults to build date). */
export function isBlogPostPublished(slug: string, asOf?: string): boolean {
  const publishDate = getBlogPublishDate(slug);
  const reference = asOf ?? getBuildDate();
  return publishDate <= reference;
}
