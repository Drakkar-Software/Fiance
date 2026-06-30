import type {
  BlogAuthor,
  BlogPost,
  BlogSection,
  BlogSectionType,
} from "./blog-types";
import { POSTS_3_10_EN, POSTS_3_10_FR } from "./blog-posts-3-10";
import { POSTS_11_30_EN, POSTS_11_30_FR } from "./blog-posts-11-30";
import { POSTS_31_50_EN, POSTS_31_50_FR } from "./blog-posts-31-50";
import { POSTS_51_68_EN, POSTS_51_68_FR } from "./blog-posts-51-68";
import { POSTS_69_74_EN, POSTS_69_74_FR } from "./blog-posts-69-74";
import { getBlogPublishDate } from "./blog-publish-dates";

export type { BlogAuthor, BlogPost, BlogSection, BlogSectionType };

const BASE_URL = "https://fiance.drakkar.software";

// ─── Types ─────────────────────────────────────────────────────────────────
// Defined in blog-types.ts

// ─── Author ────────────────────────────────────────────────────────────────

/** Single source of truth for the blog byline and JSON-LD author node. */
export const BLOG_AUTHOR: BlogAuthor = {
  name: "Paul",
  url: BASE_URL,
  avatarInitials: "P",
};

// ─── Content ───────────────────────────────────────────────────────────────

const POSTS: Record<"fr" | "en", BlogPost[]> = {
  fr: [
    {
      slug: "premieres-etapes-organiser-mariage",
      categoryKey: "planning",
      category: "Préparatifs",
      title: "Les premières étapes pour organiser votre mariage",
      excerpt:
        "Vous venez de vous fiancer. Par où commencer sans vous noyer ? Date, budget, invités : l'ordre compte autant que la checklist.",
      date: getBlogPublishDate("premieres-etapes-organiser-mariage"),
      readingMinutes: 5,
      heroImage: `${BASE_URL}/assets/og-image.png`,
      heroImageAlt: "Organisation de mariage — Fiancé",
      sections: [
        {
          type: "text",
          paragraphs: [
            "Organiser un mariage, c'est enchaîner des décisions qui dépendent les unes des autres. Avant de contacter le moindre prestataire, trois paramètres fixent presque tout le reste : une date (ou une fenêtre), un ordre de grandeur pour les invités, et un budget global.",
          ],
        },
        {
          type: "text",
          title: "Pourquoi l'ordre des décisions compte",
          paragraphs: [
            "Chez Drakkar Software, quand nous avons conçu Fiancé, nous avons vu le même schéma revenir : des couples qui réservaient un traiteur avant d'avoir une date, ou qui visitaient des salles sans savoir combien de personnes accueillir.",
            "Le lieu dépend du budget. Le traiteur dépend du nombre d'invités. Les faire-part dépendent de la date. Si vous inversez ces étapes, vous perdez du temps à comparer des options incompatibles entre elles.",
          ],
        },
        {
          type: "quote",
          quote:
            "Un mariage bien préparé, c'est surtout un mariage où les mariés passent le jour J ensemble, pas debout à coordonner des imprévus évitables.",
        },
        {
          type: "text",
          title: "Les trois décisions à prendre en premier",
          paragraphs: [
            "1. Une date, ou une fenêtre de 2 à 3 mois. Sans ça, aucun prestataire ne peut confirmer sa disponibilité.",
            "2. Un nombre d'invités approximatif, même large (80 ou 120, pas 87). Ça fixe la taille de la salle et le poste traiteur.",
            "3. Un budget global, avec ce que vous mettez vous-mêmes et ce que la famille peut contribuer. Pas besoin d'être au centime près. Il faut un plafond.",
          ],
        },
        {
          type: "list",
          title: "Vos cinq premières actions concrètes",
          items: [
            "Fixer une date ou une fenêtre, et estimer le nombre d'invités",
            "Poser le budget global, contributions familiales comprises",
            "Rechercher et visiter des lieux de réception (souvent 12 à 18 mois avant en haute saison)",
            "Lister photographe, traiteur et DJ comme contacts prioritaires",
            "Centraliser date, budget, invités et tâches dans un seul endroit",
          ],
        },
        {
          type: "callout",
          paragraphs: [
            "Astuce : commencez par réserver la salle et le traiteur. Ce sont les prestataires les plus demandés. En été, certains se réservent 12 à 18 mois à l'avance.",
          ],
        },
        {
          type: "text",
          title: "Ce qui peut attendre",
          paragraphs: [
            "Déco finie, plan de table détaillé, choix des menus par invité : tout cela vient après les réponses RSVP. Beaucoup de couples ouvrent des tableaux d'inspiration dès le week-end de la demande. C'est normal, mais ce n'est pas urgent.",
            "De la même façon, comparer dix photographes avant d'avoir un budget, c'est du temps perdu. Fixez d'abord votre plafond, puis filtrez.",
          ],
        },
        {
          type: "text",
          title: "Erreurs qu'on voit souvent",
          paragraphs: [
            "1. Comparer des prestataires sans budget fixé.",
            "2. Verrouiller un lieu avant d'estimer la liste d'invités.",
            "3. Disperser les infos entre groupes de messages, tableurs et post-it.",
            "Bien sûr, chaque mariage est différent. Un petit mariage civil peut se faire en quelques mois. Une réception de 150 personnes en juin demande plus d'anticipation.",
          ],
        },
        {
          type: "text",
          title: "Comment Fiancé peut vous aider",
          paragraphs: [
            "Fiancé regroupe budget, invités, prestataires et checklist sur votre téléphone. Les données restent sur l'appareil, sans publicité. La synchronisation entre partenaires est optionnelle, avec des données sécurisées.",
            "Vous pouvez aussi tester notre [simulateur budget](/tools/budget-calculator), sans créer de compte. Pour le suivi complet, créez votre mariage dans l'app.",
          ],
        },
      ],
    },
    {
      slug: "combien-temps-organiser-mariage",
      categoryKey: "planning",
      category: "Préparatifs",
      title:
        "Combien de temps faut-il pour organiser un mariage en France ?",
      excerpt:
        "12 à 18 mois en moyenne, mais la vraie question est : quand réserver le lieu, les faire-part et le plan de table ? Un rétroplanning réaliste.",
      date: getBlogPublishDate("combien-temps-organiser-mariage"),
      readingMinutes: 6,
      heroImage: `${BASE_URL}/assets/og-image.png`,
      heroImageAlt: "Rétroplanning mariage — Fiancé",
      sections: [
        {
          type: "text",
          paragraphs: [
            "En France, la plupart des couples préparent leur mariage sur 12 à 18 mois. Ce délai n'est pas une règle officielle : c'est le temps qu'il faut généralement pour réserver les bons prestataires, gérer les démarches administratives et coordonner les invités sans courir.",
          ],
        },
        {
          type: "text",
          title: "Ce que disent les chiffres du secteur",
          paragraphs: [
            "Selon le rapport annuel du secteur nuptial publié par Mariages.net, la durée moyenne de préparation tourne autour de 14 mois. Environ 41 % des couples se situent entre 12 et 18 mois.",
            "Ces chiffres varient selon la saison, la région et le type de cérémonie. Un mariage en juillet dans un château prisé demande souvent plus d'anticipation qu'un repas de famille en novembre.",
          ],
        },
        {
          type: "text",
          title: "Les délais qui ne se compressent pas",
          paragraphs: [
            "Certains jalons ont des contraintes fixes. La publication des bans à la mairie intervient au minimum 10 jours avant la cérémonie civile (voir [service-public.fr](https://www.service-public.fr/particuliers/vosdroits/F1027)). Pour un mariage religieux, le parcours de préparation (CPM) prend plusieurs mois selon le diocèse.",
            "Côté prestataires, nous observons ces ordres de grandeur en haute saison :",
            "1. Lieu de réception : 12 à 24 mois",
            "2. Photographe : 9 à 15 mois",
            "3. Traiteur : 6 à 12 mois",
            "4. DJ ou groupe : 6 à 9 mois",
            "Si vous commencez à 6 mois de la date en plein été, certains créneaux seront déjà pris. Ce n'est pas impossible, mais vos choix se réduisent.",
          ],
        },
        {
          type: "quote",
          quote:
            "Le délai total compte moins que l'ordre des réservations. Un lieu bloqué tôt libère le reste du planning.",
        },
        {
          type: "text",
          title: "Rétroplanning type : 12 mois avant le jour J",
          paragraphs: [
            "Voici une trame que nous utilisons comme point de départ dans Fiancé. Adaptez selon votre date et votre calendrier.",
          ],
        },
        {
          type: "list",
          title: "12 à 9 mois avant",
          items: [
            "Fixer date et budget définitifs",
            "Réserver le lieu de réception",
            "Constituer la liste d'invités de travail",
            "Contacter photographe et traiteur",
          ],
        },
        {
          type: "list",
          title: "8 à 4 mois avant",
          items: [
            "Confirmer les prestataires principaux (musique, fleurs, beauté)",
            "Envoyer les save-the-date puis les faire-part",
            "Lancer les démarches administratives (mairie, cérémonie religieuse)",
            "Commander tenues et alliances",
          ],
        },
        {
          type: "list",
          title: "3 mois à J-7",
          items: [
            "Relancer les RSVP (idéalement 6 semaines avant le jour J)",
            "Finaliser menus et régimes alimentaires",
            "Construire le plan de table",
            "Valider le programme du jour J avec les témoins",
          ],
        },
        {
          type: "text",
          title: "Moins de 6 mois : est-ce jouable ?",
          paragraphs: [
            "Oui, dans certains cas. Mariage civil intimiste, date en basse saison, lieu déjà repéré, prestataires disponibles : nous avons vu des préparatifs tenir en 4 à 6 mois.",
            "En contrepartie, vous ferez moins de choix. Moins de dates libres, moins de créneaux photo, parfois des compromis sur la salle ou le menu. Anticipez aussi que le stress administratif sera plus concentré.",
          ],
        },
        {
          type: "text",
          title: "Plus de 18 mois : que faire de ce temps ?",
          paragraphs: [
            "Réserver tôt le lieu et le photographe, puis respirer. Utilisez les mois suivants pour affiner le budget, comparer les traiteurs sans urgence, et construire votre mood board.",
            "Attention à ne pas figer trop de détails trop tôt. Les listes d'invités évoluent. Les goûts aussi. Gardez de la marge sur la déco et les petits postes jusqu'à 6 mois avant.",
          ],
        },
        {
          type: "callout",
          paragraphs: [
            "Notre [outil timeline](/tools/timeline) génère un programme jour J exportable en PDF. Pour un rétroplanning complet avec rappels, la checklist Fiancé se cale sur votre date de mariage.",
          ],
        },
        {
          type: "text",
          title: "Comment Fiancé peut vous aider",
          paragraphs: [
            "Fiancé génère une checklist de préparatifs avec des échéances relatives à votre date (par exemple « 9 mois avant », « 1 mois avant »). Vous voyez les tâches en retard depuis l'accueil, et vous pouvez assigner chaque action à l'un des deux partenaires.",
            "Le module planning couvre aussi l'agenda (essayages, rendez-vous traiteur) et le programme du jour J. Tout reste sur votre appareil, avec sync optionnelle et données sécurisées entre partenaires.",
          ],
        },
        {
          type: "text",
          title: "Avertissement",
          paragraphs: [
            "Veuillez noter que le contenu de cet article est destiné à des fins d'information générale uniquement et ne constitue pas un conseil professionnel. Les informations contenues ici sont fournies à titre informatif. Rien dans ce document ne doit être interprété comme un conseil juridique, financier ou fiscal. Le contenu de cet article reflète les opinions de l'auteur et/ou de l'équipe Drakkar Software. Aucun des auteurs n'est conseiller agréé dans un domaine réglementé, sauf mention explicite. L'utilisation de tout produit ou méthode décrit ici peut comporter des risques. L'auteur et/ou Drakkar Software ne garantissent aucun résultat particulier. Les résultats passés ne préjugent pas des résultats futurs.",
          ],
        },
      ],
    },
    ...POSTS_3_10_FR,
    ...POSTS_11_30_FR,
    ...POSTS_31_50_FR,
    ...POSTS_51_68_FR,
    ...POSTS_69_74_FR,
  ],
  en: [
    {
      slug: "premieres-etapes-organiser-mariage",
      categoryKey: "planning",
      category: "Planning",
      title: "First steps to planning your wedding",
      excerpt:
        "Just got engaged. Where do you start without drowning in details? Date, budget, guests: the order matters as much as the checklist.",
      date: getBlogPublishDate("premieres-etapes-organiser-mariage"),
      readingMinutes: 5,
      heroImage: `${BASE_URL}/assets/og-image.png`,
      heroImageAlt: "Wedding planning — Fiancé",
      sections: [
        {
          type: "text",
          paragraphs: [
            "Planning a wedding means chaining decisions that depend on each other. Before you contact any vendor, three parameters drive almost everything else: a date (or a window), a rough guest count, and a total budget.",
          ],
        },
        {
          type: "text",
          title: "Why the order of decisions matters",
          paragraphs: [
            "At Drakkar Software, when we built Fiancé, we kept seeing the same pattern: couples booking a caterer before they had a date, or touring venues without knowing how many people they would host.",
            "The venue depends on the budget. The caterer depends on guest count. Invitations depend on the date. If you reverse these steps, you waste time comparing options that do not fit together.",
          ],
        },
        {
          type: "quote",
          quote:
            "A well-planned wedding is one where the couple spends the day together, not standing around fixing avoidable surprises.",
        },
        {
          type: "text",
          title: "Three decisions to make first",
          paragraphs: [
            "1. A date, or a 2 to 3 month window. Without it, no vendor can confirm availability.",
            "2. An approximate guest count, even if rough (80 or 120, not 87). That sets venue size and catering costs.",
            "3. A total budget, including what you contribute and what family may chip in. It does not need to be exact. You need a ceiling.",
          ],
        },
        {
          type: "list",
          title: "Your first five concrete actions",
          items: [
            "Set a date or window, and estimate guest count",
            "Set the total budget, family contributions included",
            "Research and visit reception venues (often 12 to 18 months ahead in peak season)",
            "List photographer, caterer, and DJ as priority contacts",
            "Centralize date, budget, guests, and tasks in one place",
          ],
        },
        {
          type: "callout",
          paragraphs: [
            "Tip: start by booking the venue and caterer. These are the most in-demand vendors. In summer, some book 12 to 18 months ahead.",
          ],
        },
        {
          type: "text",
          title: "What can wait",
          paragraphs: [
            "Final decor, a detailed seating chart, per-guest menu choices: all of that comes after RSVPs. Many couples open inspiration boards the weekend of the proposal. That is normal, but it is not urgent.",
            "Similarly, comparing ten photographers before you have a budget wastes time. Set your ceiling first, then filter.",
          ],
        },
        {
          type: "text",
          title: "Mistakes we see often",
          paragraphs: [
            "1. Comparing vendors without a fixed budget.",
            "2. Locking a venue before estimating the guest list.",
            "3. Spreading info across chat groups, spreadsheets, and sticky notes.",
            "Of course, every wedding is different. A small civil ceremony can happen in a few months. A 150-guest reception in June needs more lead time.",
          ],
        },
        {
          type: "text",
          title: "How Fiancé can help",
          paragraphs: [
            "Fiancé brings budget, guests, vendors, and checklist together on your phone. Data stays on your device, with no ads. Optional partner sync keeps your data secure.",
            "You can also try our free [budget calculator](/tools/budget-calculator), no account required. For full tracking, create your wedding in the app.",
          ],
        },
      ],
    },
    {
      slug: "combien-temps-organiser-mariage",
      categoryKey: "planning",
      category: "Planning",
      title: "How long does it take to plan a wedding in France?",
      excerpt:
        "12 to 18 months on average, but the real question is when to book the venue, invitations, and seating chart. A realistic timeline.",
      date: getBlogPublishDate("combien-temps-organiser-mariage"),
      readingMinutes: 6,
      heroImage: `${BASE_URL}/assets/og-image.png`,
      heroImageAlt: "Wedding timeline — Fiancé",
      sections: [
        {
          type: "text",
          paragraphs: [
            "In France, most couples prepare their wedding over 12 to 18 months. That is not an official rule: it is usually the time you need to book the right vendors, handle admin steps, and coordinate guests without rushing.",
          ],
        },
        {
          type: "text",
          title: "What industry numbers say",
          paragraphs: [
            "According to Mariages.net's annual wedding sector report, average preparation time is around 14 months. About 41% of couples fall between 12 and 18 months.",
            "These figures vary by season, region, and ceremony type. A July wedding at a popular chateau often needs more lead time than a family dinner in November.",
          ],
        },
        {
          type: "text",
          title: "Deadlines you cannot compress",
          paragraphs: [
            "Some milestones have fixed constraints. Banns publication at the town hall happens at least 10 days before the civil ceremony (see [service-public.fr](https://www.service-public.fr/particuliers/vosdroits/F1027)). For a religious wedding, preparation (CPM) takes several months depending on the diocese.",
            "On the vendor side, we see these rough lead times in peak season:",
            "1. Reception venue: 12 to 24 months",
            "2. Photographer: 9 to 15 months",
            "3. Caterer: 6 to 12 months",
            "4. DJ or band: 6 to 9 months",
            "If you start 6 months out in mid-summer, some slots are already gone. It is not impossible, but your options shrink.",
          ],
        },
        {
          type: "quote",
          quote:
            "Total lead time matters less than booking order. A venue locked in early frees up the rest of the plan.",
        },
        {
          type: "text",
          title: "Sample timeline: 12 months before the day",
          paragraphs: [
            "Here is a frame we use as a starting point in Fiancé. Adjust for your date and calendar.",
          ],
        },
        {
          type: "list",
          title: "12 to 9 months out",
          items: [
            "Set final date and budget",
            "Book the reception venue",
            "Build a working guest list",
            "Contact photographer and caterer",
          ],
        },
        {
          type: "list",
          title: "8 to 4 months out",
          items: [
            "Confirm main vendors (music, flowers, hair and makeup)",
            "Send save-the-dates then invitations",
            "Start admin steps (town hall, religious ceremony)",
            "Order attire and rings",
          ],
        },
        {
          type: "list",
          title: "3 months to 1 week out",
          items: [
            "Follow up on RSVPs (ideally 6 weeks before the day)",
            "Finalize menus and dietary needs",
            "Build the seating chart",
            "Validate the day-of schedule with witnesses",
          ],
        },
        {
          type: "text",
          title: "Under 6 months: is it doable?",
          paragraphs: [
            "Yes, in some cases. Intimate civil wedding, off-season date, venue already picked, vendors available: we have seen prep work in 4 to 6 months.",
            "The tradeoff is fewer choices. Fewer open dates, fewer photo slots, sometimes compromises on room or menu. Expect admin stress to be more concentrated too.",
          ],
        },
        {
          type: "text",
          title: "Over 18 months: what to do with the extra time?",
          paragraphs: [
            "Book the venue and photographer early, then breathe. Use the following months to refine the budget, compare caterers without urgency, and build your mood board.",
            "Be careful not to lock too many details too soon. Guest lists change. Tastes change too. Keep margin on decor and small line items until about 6 months out.",
          ],
        },
        {
          type: "callout",
          paragraphs: [
            "Our free [timeline tool](/tools/timeline) builds a day-of schedule you can export as PDF. For a full countdown checklist with reminders, Fiancé's planning module aligns tasks to your wedding date.",
          ],
        },
        {
          type: "text",
          title: "How Fiancé can help",
          paragraphs: [
            "Fiancé generates a prep checklist with deadlines relative to your date (for example \"9 months before\", \"1 month before\"). Overdue tasks show on the home screen, and you can assign each item to either partner.",
            "The planning module also covers appointments (fittings, caterer meetings) and the day-of schedule. Everything stays on your device, with optional partner sync and secure data.",
          ],
        },
        {
          type: "text",
          title: "Disclaimer",
          paragraphs: [
            "Please be advised that the contents of this article are intended for general information purposes only and not professional advice. The information contained herein is for informational purposes only. Nothing herein shall be construed as legal, financial, or tax advice. The content of this article reflects the opinions of the author and/or the Drakkar Software team. None of the authors are licensed advisors in regulated fields unless explicitly stated. Using any product or method discussed here may involve risk. The author and/or Drakkar Software does not guarantee any particular outcome. Past results do not indicate future results.",
          ],
        },
      ],
    },
    ...POSTS_3_10_EN,
    ...POSTS_11_30_EN,
    ...POSTS_31_50_EN,
    ...POSTS_51_68_EN,
    ...POSTS_69_74_EN,
  ],
};

// ─── Data access ───────────────────────────────────────────────────────────

/** Top 3 articles for the homepage Le Carnet section (order matters). */
export const LANDING_BLOG_SLUGS = [
  "premieres-etapes-organiser-mariage",
  "combien-temps-organiser-mariage",
  "budget-mariage-2026-combien-prevoir",
] as const;

export function getBlogPosts(lang: string): BlogPost[] {
  return POSTS[lang === "en" ? "en" : "fr"];
}

/** Curated posts for the marketing homepage — not the full blog index. */
export function getLandingBlogPosts(lang: string): BlogPost[] {
  const posts = getBlogPosts(lang);
  return LANDING_BLOG_SLUGS.flatMap((slug) => {
    const post = posts.find((p) => p.slug === slug);
    return post ? [post] : [];
  });
}

export function getBlogPost(lang: string, slug: string): BlogPost | undefined {
  return getBlogPosts(lang).find((p) => p.slug === slug);
}

/** All slugs — fed to generateStaticParams so Expo prerenders each post page. */
export function getBlogSlugs(): string[] {
  return POSTS.fr.map((p) => p.slug);
}

// ─── Date helpers ──────────────────────────────────────────────────────────

const MONTH_FR = [
  "jan", "fév", "mar", "avr", "mai", "juin",
  "juil", "aoû", "sep", "oct", "nov", "déc",
];
const MONTH_EN = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function parseIso(iso: string): [number, number, number] {
  const parts = iso.split("-").map(Number);
  return [parts[0], parts[1], parts[2]];
}

export function formatBlogDate(iso: string, lang: string): string {
  const [y, m, d] = parseIso(iso);
  return new Date(y, m - 1, d).toLocaleDateString(
    lang === "en" ? "en-GB" : "fr-FR",
    { year: "numeric", month: "long", day: "numeric" }
  );
}

/** 3-char month abbreviation for the Seal date stamp. */
export function formatBlogMonth(iso: string, lang: string): string {
  const [, m] = parseIso(iso);
  return lang === "en" ? MONTH_EN[m - 1] : MONTH_FR[m - 1];
}

export function formatBlogYear(iso: string): string {
  return iso.slice(0, 4);
}

// ─── JSON-LD builders ──────────────────────────────────────────────────────

const SCHEMA_CONTEXT = "https://schema.org";
const ORG_ID = `${BASE_URL}/#organization`;
const AUTHOR_ID = `${BASE_URL}/#author-paul`;
const BLOG_ID = `${BASE_URL}/blog#blog`;

const PUBLISHER = {
  "@type": "Organization",
  "@id": ORG_ID,
  name: "Fiancé",
  url: BASE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${BASE_URL}/assets/logo.png`,
  },
};

const AUTHOR = {
  "@type": "Person",
  "@id": AUTHOR_ID,
  name: BLOG_AUTHOR.name,
  url: BLOG_AUTHOR.url,
};

function blogNameForLang(lang: string): string {
  return lang === "en" ? "Fiancé Journal" : "Fiancé — Le Carnet";
}

function inLanguageForLang(lang: string): string {
  return lang === "en" ? "en-US" : "fr-FR";
}

/** ISO 8601 datetime for schema.org (date-only inputs get a stable UTC time). */
export function toSchemaDateTime(iso: string): string {
  if (iso.includes("T")) return iso;
  return `${iso}T08:00:00Z`;
}

function postCanonicalUrl(slug: string): string {
  return `${BASE_URL}/blog/${slug}`;
}

function computeWordCount(post: BlogPost): number {
  return post.sections
    .flatMap((s) => [
      ...(s.paragraphs ?? []),
      ...(s.items ?? []),
      s.quote ?? "",
      s.title ?? "",
    ])
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
}

/** Plain-text body for schema.org articleBody (strips markdown link syntax). */
export function extractArticleBody(post: BlogPost): string {
  const chunks = post.sections.flatMap((s) => {
    const parts: string[] = [];
    if (s.title) parts.push(s.title);
    if (s.paragraphs) parts.push(...s.paragraphs);
    if (s.items) parts.push(...s.items);
    if (s.quote) parts.push(s.quote);
    return parts;
  });
  return chunks
    .join("\n\n")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
}

/** Full BlogPosting node from BlogPost source data. */
export function buildBlogPostingNode(post: BlogPost, lang: string): object {
  const canonical = postCanonicalUrl(post.slug);
  const blogName = blogNameForLang(lang);
  const inLanguage = inLanguageForLang(lang);
  const dateModified = post.updated ?? post.date;

  return {
    "@type": "BlogPosting",
    "@id": `${canonical}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    url: canonical,
    headline: post.title,
    name: post.title,
    description: post.excerpt,
    abstract: post.excerpt,
    articleBody: extractArticleBody(post),
    image: {
      "@type": "ImageObject",
      url: post.heroImage,
      caption: post.heroImageAlt,
    },
    thumbnailUrl: post.heroImage,
    datePublished: toSchemaDateTime(post.date),
    dateModified: toSchemaDateTime(dateModified),
    author: { "@id": AUTHOR_ID },
    publisher: { "@id": ORG_ID },
    inLanguage,
    articleSection: post.category,
    keywords: post.categoryKey,
    wordCount: computeWordCount(post),
    timeRequired: `PT${post.readingMinutes}M`,
    isPartOf: {
      "@type": "Blog",
      "@id": BLOG_ID,
      name: blogName,
      url: `${BASE_URL}/blog`,
    },
  };
}

function buildBreadcrumbList(
  items: { name: string; item: string }[]
): object {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: entry.item,
    })),
  };
}

/** BlogPosting + WebPage + BreadcrumbList JSON-LD for a single post page. */
export function buildPostJsonLd(post: BlogPost, lang: string): object {
  const canonical = postCanonicalUrl(post.slug);
  const blogName = blogNameForLang(lang);
  const inLanguage = inLanguageForLang(lang);

  return {
    "@context": SCHEMA_CONTEXT,
    "@graph": [
      {
        "@type": "WebPage",
        "@id": canonical,
        url: canonical,
        name: post.title,
        description: post.excerpt,
        inLanguage,
        isPartOf: { "@id": BLOG_ID },
        primaryImageOfPage: { "@id": `${canonical}#article` },
        breadcrumb: { "@id": `${canonical}#breadcrumb` },
        mainEntity: { "@id": `${canonical}#article` },
      },
      buildBlogPostingNode(post, lang),
      {
        "@type": "Blog",
        "@id": BLOG_ID,
        name: blogName,
        url: `${BASE_URL}/blog`,
        inLanguage,
        publisher: { "@id": ORG_ID },
      },
      AUTHOR,
      PUBLISHER,
      {
        ...buildBreadcrumbList([
          { name: "Fiancé", item: BASE_URL },
          { name: blogName, item: `${BASE_URL}/blog` },
          { name: post.title, item: canonical },
        ]),
        "@id": `${canonical}#breadcrumb`,
      },
    ],
  };
}

/** Blog index + full BlogPosting entries + BreadcrumbList JSON-LD. */
export function buildBlogJsonLd(
  posts: BlogPost[],
  lang: string,
  blogDescription: string
): object {
  const blogName = blogNameForLang(lang);
  const blogUrl = `${BASE_URL}/blog`;
  const inLanguage = inLanguageForLang(lang);

  return {
    "@context": SCHEMA_CONTEXT,
    "@graph": [
      {
        "@type": "Blog",
        "@id": BLOG_ID,
        name: blogName,
        description: blogDescription,
        url: blogUrl,
        inLanguage,
        publisher: { "@id": ORG_ID },
        blogPost: posts.map((p) => ({ "@id": `${postCanonicalUrl(p.slug)}#article` })),
      },
      ...posts.map((p) => buildBlogPostingNode(p, lang)),
      AUTHOR,
      PUBLISHER,
      {
        ...buildBreadcrumbList([
          { name: "Fiancé", item: BASE_URL },
          { name: blogName, item: blogUrl },
        ]),
        "@id": `${blogUrl}#breadcrumb`,
      },
    ],
  };
}
