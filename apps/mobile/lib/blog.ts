const BASE_URL = "https://fiance.drakkar.software";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface BlogAuthor {
  name: string;
  url: string;
  avatarInitials: string;
}

export type BlogSectionType = "text" | "quote" | "callout" | "list";

export interface BlogSection {
  type?: BlogSectionType; // defaults to "text"
  title?: string;
  paragraphs?: string[]; // for "text" and "callout"
  items?: string[]; // for "list"
  quote?: string; // for "quote"
}

export interface BlogPost {
  slug: string;
  categoryKey: string;
  category: string;
  title: string;
  excerpt: string;
  date: string; // ISO 8601, e.g. "2026-06-29"
  updated?: string; // ISO 8601
  readingMinutes: number;
  heroImage: string; // absolute URL — put real images in public/assets/blog/<slug>.jpg
  heroImageAlt: string;
  sections: BlogSection[];
}

// ─── Author ────────────────────────────────────────────────────────────────

/** Single source of truth for the blog byline and JSON-LD author node. */
export const BLOG_AUTHOR: BlogAuthor = {
  name: "Paul",
  url: BASE_URL,
  avatarInitials: "P",
};

// ─── Content ───────────────────────────────────────────────────────────────
// EXAMPLE POST — Replace with your first real article.
// To add a post: append one BlogPost object to BOTH the `fr` and `en` arrays
// below (same `slug` in both), then add the URL to public/sitemap.xml and llms.txt.

const POSTS: Record<"fr" | "en", BlogPost[]> = {
  fr: [
    {
      slug: "exemple-mariage",
      categoryKey: "planning",
      category: "Préparatifs",
      title: "Les premières étapes pour organiser votre mariage",
      excerpt:
        "Vous venez de vous fiancer — félicitations ! Voici par où commencer pour organiser votre mariage sereinement, sans vous noyer dans les détails.",
      date: "2026-06-29",
      readingMinutes: 4,
      // Replace with a real photo in public/assets/blog/exemple-mariage.jpg
      heroImage: `${BASE_URL}/assets/og-image.png`,
      heroImageAlt: "Organisation de mariage — Fiancé",
      sections: [
        {
          type: "text",
          title: "Commencer par l'essentiel",
          paragraphs: [
            "L'organisation d'un mariage peut sembler immense au premier abord. Des centaines de décisions à prendre, des prestataires à contacter, un budget à maîtriser. La bonne nouvelle : en commençant dans le bon ordre, tout devient gérable.",
            "La première étape, avant de contacter le moindre prestataire, est de définir trois choses : la date approximative, le nombre d'invités et le budget global. Ces trois paramètres conditionnent absolument tout le reste.",
          ],
        },
        {
          type: "list",
          title: "Vos 5 premières actions",
          items: [
            "Définir une date (ou une fenêtre de 2–3 mois) et le nombre d'invités approximatif",
            "Fixer votre budget global, en tenant compte de vos économies et des contributions éventuelles",
            "Choisir un lieu : c'est souvent le poste le plus contraint par la disponibilité",
            "Lister les prestataires indispensables (photographe, traiteur, DJ) et commencer à les contacter",
            "Créer votre mariage dans Fiancé pour centraliser tout en un seul endroit",
          ],
        },
        {
          type: "callout",
          paragraphs: [
            "💡 Astuce : commencez par réserver la salle et le traiteur. Ce sont les prestataires les plus demandés — ils se réservent parfois 12 à 18 mois à l'avance.",
          ],
        },
        {
          type: "quote",
          quote:
            "Un mariage bien organisé, c'est avant tout un mariage où les mariés profitent de leur journée.",
        },
      ],
    },
  ],
  en: [
    {
      slug: "exemple-mariage",
      categoryKey: "planning",
      category: "Planning",
      title: "First steps to planning your wedding",
      excerpt:
        "Just got engaged — congratulations! Here's where to start planning your wedding calmly, without getting lost in the details.",
      date: "2026-06-29",
      readingMinutes: 4,
      heroImage: `${BASE_URL}/assets/og-image.png`,
      heroImageAlt: "Wedding planning — Fiancé",
      sections: [
        {
          type: "text",
          title: "Start with the essentials",
          paragraphs: [
            "Planning a wedding can feel overwhelming at first. Hundreds of decisions to make, vendors to contact, a budget to manage. The good news: starting in the right order makes everything manageable.",
            "The first step, before contacting any vendor, is to define three things: an approximate date, the guest count, and your total budget. These three parameters drive everything else.",
          ],
        },
        {
          type: "list",
          title: "Your first 5 actions",
          items: [
            "Set a date (or a 2–3 month window) and approximate guest count",
            "Establish your total budget, accounting for savings and any family contributions",
            "Choose a venue: it's often the most constrained item due to availability",
            "List essential vendors (photographer, caterer, DJ) and start reaching out",
            "Create your wedding in Fiancé to centralize everything in one place",
          ],
        },
        {
          type: "callout",
          paragraphs: [
            "💡 Tip: start by booking the venue and caterer. These are the most in-demand vendors — they're often booked 12 to 18 months in advance.",
          ],
        },
        {
          type: "quote",
          quote:
            "A well-planned wedding is above all one where the couple gets to enjoy their day.",
        },
      ],
    },
  ],
};

// ─── Data access ───────────────────────────────────────────────────────────

export function getBlogPosts(lang: string): BlogPost[] {
  return POSTS[lang === "en" ? "en" : "fr"];
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

const PUBLISHER = {
  "@type": "Organization",
  name: "Fiancé",
  url: BASE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${BASE_URL}/assets/logo.png`,
  },
};

function computeWordCount(post: BlogPost): number {
  return post.sections
    .flatMap((s) => [
      ...(s.paragraphs ?? []),
      ...(s.items ?? []),
      s.quote ?? "",
    ])
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
}

/** BlogPosting + BreadcrumbList JSON-LD for a single post page. */
export function buildPostJsonLd(post: BlogPost, lang: string): object[] {
  const inLanguage = lang === "en" ? "en-US" : "fr-FR";
  const canonical = `${BASE_URL}/blog/${post.slug}`;
  const blogName = lang === "en" ? "Fiancé Journal" : "Fiancé — Le Carnet";

  return [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      image: post.heroImage,
      datePublished: post.date,
      dateModified: post.updated ?? post.date,
      author: {
        "@type": "Person",
        name: BLOG_AUTHOR.name,
        url: BLOG_AUTHOR.url,
      },
      publisher: PUBLISHER,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": canonical,
      },
      inLanguage,
      articleSection: post.category,
      wordCount: computeWordCount(post),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Fiancé", item: BASE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: blogName,
          item: `${BASE_URL}/blog`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: post.title,
          item: canonical,
        },
      ],
    },
  ];
}

/** Blog + BreadcrumbList JSON-LD for the blog index page. */
export function buildBlogJsonLd(posts: BlogPost[], lang: string): object[] {
  const inLanguage = lang === "en" ? "en-US" : "fr-FR";
  const blogName = lang === "en" ? "Fiancé Journal" : "Fiancé — Le Carnet";
  const blogUrl = `${BASE_URL}/blog`;

  return [
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: blogName,
      url: blogUrl,
      inLanguage,
      publisher: PUBLISHER,
      blogPost: posts.map((p) => ({
        "@type": "BlogPosting",
        headline: p.title,
        datePublished: p.date,
        url: `${BASE_URL}/blog/${p.slug}`,
        author: {
          "@type": "Person",
          name: BLOG_AUTHOR.name,
          url: BLOG_AUTHOR.url,
        },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Fiancé", item: BASE_URL },
        { "@type": "ListItem", position: 2, name: blogName, item: blogUrl },
      ],
    },
  ];
}
