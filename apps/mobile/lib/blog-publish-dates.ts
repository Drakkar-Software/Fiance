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
  // Tier 11 — attire, beauty, honeymoon, EVJF/EVG
  "robe-de-mariee-guide-choisir",
  "costume-marie-guide",
  "coiffure-maquillage-mariage-essai",
  "accessoires-mariee-voile-bijoux",
  "voyage-de-noces-organiser-budget",
  "evjf-organiser-guide",
  "evg-organiser-guide",
  // Tier 12 — food, drinks, music, speeches
  "degustation-traiteur-mariage",
  "gateau-piece-montee-mariage",
  "vin-honneur-cocktail-mariage",
  "brunch-lendemain-mariage",
  "premiere-danse-mariage-preparer",
  "playlist-mariage-construire",
  "discours-maries-temoins-reussir",
  // Tier 13 — ceremony types, stationery, legal
  "ceremonie-religieuse-catholique-preparer",
  "mariage-destination-etranger-organiser",
  "papeterie-mariage-faire-part-design",
  "faire-part-papier-ou-numerique",
  "changement-nom-apres-mariage",
  "contrat-mariage-regimes-matrimoniaux",
  // Tier 14 — venue types, season, accessibility
  "choisir-lieu-reception-types",
  "mariage-plein-air-plan-b-meteo",
  "mariage-hiver-organiser",
  "mariage-automne-organiser",
  "invites-ages-pmr-accessibilite",
  "animaux-mariage-chien-ceremonie",
  // Tier 15 — sustainability, family, logistics, decor
  "mariage-eco-responsable-conseils",
  "fleurs-mariage-saison-locales",
  "familles-recomposees-mariage",
  "transport-navette-invites-mariage",
  "welcome-bag-cadeaux-invites",
  "deco-centres-table-mariage",
  // Tier 16 — DIY, kids, traditions, scheduling, financing
  "diy-mariage-quoi-faire-soi-meme",
  "enfants-au-mariage-animation",
  "photobooth-livre-or-animations",
  "traditions-mariage-francais",
  "horaires-ceremonie-mariage-caler",
  "financer-mariage-epargne-aides",
  // Tier 17 — budget tiers, contracts, extras
  "budget-mariage-15000-euros-repartition",
  "budget-mariage-30000-euros-repartition",
  "contrat-prestataire-clauses-verifier",
  "ceremonie-civile-mairie-deroule",
  "nuit-de-noces-hebergement-maries",
  "forme-peau-avant-mariage-preparer",
  // Tier 18 — vendors, seating edge cases, comparison, wrap-up
  "videaste-mariage-vaut-le-cout",
  "location-mobilier-vaisselle-mariage",
  "plan-table-couples-familles-brouillees",
  "escort-cards-marque-places-plan-mural",
  "fiance-vs-the-knot-zola",
  "checklist-jour-j-mallette-secours",
  // Tier 19 — engagement funnel, formats, dates & venues
  "demande-en-mariage-idees-organiser",
  "bague-fiancailles-choisir-guide",
  "fiancailles-organiser-fete",
  "annoncer-mariage-proches-famille",
  "pacs-ou-mariage-choisir",
  "elopement-mariage-a-deux-organiser",
  "micro-mariage-petit-comite",
  "se-remarier-second-mariage",
  "renouvellement-voeux-organiser",
  "qui-paie-le-mariage-repartition",
  "choisir-date-mariage-saison",
  "mariage-printemps-organiser",
  "mariage-ete-canicule-chaleur",
  "se-marier-en-semaine-economiser",
  "mariage-chateau-guide",
  "mariage-grange-ferme-champetre",
  "mariage-a-la-maison-jardin",
  "mariage-vignoble-domaine-viticole",
  "mariage-plage-bord-de-mer",
  "chapiteau-tente-location-mariage",
  // Tier 20 — planners, food & drink, music & entertainment
  "wedding-planner-faut-il-engager",
  "coordinateur-jour-j-utilite",
  "repas-mariage-buffet-assis-cocktail",
  "food-truck-mariage",
  "traiteur-vegetarien-vegan-mariage",
  "menu-enfants-mariage",
  "boissons-mariage-champagne-quantites",
  "bar-a-cocktails-mariage",
  "dessert-bar-alternatives-piece-montee",
  "groupe-live-ou-dj-mariage",
  "ouverture-de-bal-choregraphie",
  "animations-soiree-mariage-idees",
  "livre-or-alternatives-idees",
  "seance-engagement-photos-couple",
  "styles-photographie-mariage-choisir",
  "album-photo-mariage-choisir",
  "seance-day-after-trash-dress",
  "drone-mariage-photo-video",
  "bouquet-mariee-choisir-forme-fleurs",
  "boutonniere-marie-corsages-famille",
  // Tier 21 — decor, attire, wedding party & ceremony detail
  "fleurs-sechees-stabilisees-mariage",
  "decoration-ceremonie-arche-allee",
  "decoration-salle-reception-planifier",
  "noms-numeros-tables-mariage",
  "location-decoration-mariage",
  "robe-mariee-morphologie-silhouette",
  "robe-mariee-seconde-main-louer",
  "chaussures-mariee-confort",
  "tenue-invite-mariage-dress-code",
  "tenue-temoins-demoiselles-honneur",
  "demoiselles-honneur-role-choisir",
  "cortege-enfants-honneur-organiser",
  "cadeaux-temoins-remercier",
  "cortege-entree-maries-organiser",
  "voeux-personnels-mariage-ecrire",
  "rituels-ceremonie-laique-idees",
  "livret-ceremonie-programme-imprimer",
  "cagnotte-liste-urne-mariage-choisir",
  "combien-donner-mariage-invite",
  "dragees-cadeaux-invites-mariage",
  // Tier 22 — wellbeing, timing & closing checklist
  "gerer-stress-mariage-serenite",
  "gerer-belle-famille-preparatifs",
  "nuit-avant-mariage-preparation",
  "combien-invites-mariage-decider",
  "faire-part-quand-envoyer-wording",
  "beaute-mains-ongles-avant-mariage",
  "coiffeur-maquilleur-domicile-jour-j",
  "checklist-derniere-semaine-avant-mariage",
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
