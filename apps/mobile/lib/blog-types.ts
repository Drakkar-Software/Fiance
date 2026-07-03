export interface BlogAuthor {
  name: string;
  url: string;
  avatarInitials: string;
}

export type BlogAuthorSlug = "paul" | "camille";

export type BlogSectionType = "text" | "quote" | "callout" | "list";

export interface BlogSection {
  type?: BlogSectionType;
  title?: string;
  paragraphs?: string[];
  items?: string[];
  quote?: string;
}

export interface BlogPost {
  slug: string;
  categoryKey: string;
  category: string;
  title: string;
  excerpt: string;
  /** First publication date (ISO `YYYY-MM-DD`). Maps to JSON-LD `datePublished`. Set once in `blog-publish-dates.ts` or on the post; do not change on edits. */
  date: string;
  /** Last substantive content edit (ISO `YYYY-MM-DD`). Maps to JSON-LD `dateModified`. Set only when title, excerpt, or sections change — not for wiring, sitemap, or date-map-only changes. */
  updated?: string;
  readingMinutes: number;
  heroImage: string;
  heroImageAlt: string;
  /** Override default category-based author mapping. */
  authorSlug?: BlogAuthorSlug;
  sections: BlogSection[];
}
