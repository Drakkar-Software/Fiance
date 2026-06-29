export interface BlogAuthor {
  name: string;
  url: string;
  avatarInitials: string;
}

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
  date: string;
  updated?: string;
  readingMinutes: number;
  heroImage: string;
  heroImageAlt: string;
  sections: BlogSection[];
}
