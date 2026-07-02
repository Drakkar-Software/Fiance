import type { BlogAuthor, BlogPost } from "./blog-types";
import { BASE_URL, localizedUrl, normalizeLang, type MarketingLang } from "./seo-urls";

export type BlogAuthorSlug = "paul" | "camille";

export interface BlogAuthorProfile extends BlogAuthor {
  slug: BlogAuthorSlug;
  /** i18n keys under marketing.authors.{slug}.* */
  roleKey: string;
  bioKey: string;
  expertiseKeys: string[];
  sameAs?: string[];
}

export const BLOG_AUTHORS: Record<BlogAuthorSlug, BlogAuthorProfile> = {
  paul: {
    slug: "paul",
    name: "Paul",
    url: `${BASE_URL}/fr/author/paul`,
    avatarInitials: "P",
    roleKey: "role",
    bioKey: "bio",
    expertiseKeys: ["expertise.product", "expertise.privacy", "expertise.planning"],
    sameAs: ["https://drakkar.software"],
  },
  camille: {
    slug: "camille",
    name: "Camille",
    url: `${BASE_URL}/fr/author/camille`,
    avatarInitials: "C",
    roleKey: "role",
    bioKey: "bio",
    expertiseKeys: ["expertise.budget", "expertise.guests", "expertise.seating"],
  },
};

/** Default author when no category mapping applies. */
export const DEFAULT_BLOG_AUTHOR_SLUG: BlogAuthorSlug = "paul";

/** Category → specialist author (budget, guests, seating). */
const AUTHOR_BY_CATEGORY: Partial<Record<string, BlogAuthorSlug>> = {
  budget: "camille",
  guests: "camille",
  seating: "camille",
};

export const BLOG_AUTHOR_SLUGS: BlogAuthorSlug[] = ["paul", "camille"];

export function getPostAuthorSlug(post: BlogPost): BlogAuthorSlug {
  return post.authorSlug ?? AUTHOR_BY_CATEGORY[post.categoryKey] ?? DEFAULT_BLOG_AUTHOR_SLUG;
}

export function getBlogAuthor(slug: BlogAuthorSlug): BlogAuthorProfile {
  return BLOG_AUTHORS[slug];
}

export function getPostAuthor(post: BlogPost): BlogAuthorProfile {
  return getBlogAuthor(getPostAuthorSlug(post));
}

export function authorProfileUrl(slug: BlogAuthorSlug, lang: string): string {
  return localizedUrl(normalizeLang(lang), `/author/${slug}`);
}

export function authorPersonId(slug: BlogAuthorSlug, lang: string): string {
  return `${authorProfileUrl(slug, lang)}#person`;
}

/** JSON-LD Person node for an author profile page. */
export function buildAuthorPersonJsonLd(slug: BlogAuthorSlug, lang: MarketingLang, copy: {
  role: string;
  bio: string;
}): object {
  const author = getBlogAuthor(slug);
  const url = authorProfileUrl(slug, lang);
  return {
    "@type": "Person",
    "@id": `${url}#person`,
    name: author.name,
    url,
    jobTitle: copy.role,
    description: copy.bio,
    worksFor: { "@id": `${BASE_URL}/#organization` },
    ...(author.sameAs?.length ? { sameAs: author.sameAs } : {}),
  };
}

/** @deprecated Use getPostAuthor() — kept for imports that expected a single author. */
export const BLOG_AUTHOR = BLOG_AUTHORS.paul;
