import { writeFileSync } from "fs";
import { join } from "path";
import {
  BLOG_CONTENT_UPDATED,
  getBlogPublishDate,
  getBuildDate,
  isBlogPostPublished,
} from "./blog-publish-dates";
import { BASE_URL, localizedUrl } from "./seo-urls";
import { getBlogSlugs } from "./blog";
import { BLOG_AUTHOR_SLUGS } from "./blog-authors";

type SitemapEntry = {
  path: string;
  lastmod: string;
  changefreq: "weekly" | "monthly";
  priority: string;
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function hreflangLinks(path: string): string {
  const fr = localizedUrl("fr", path);
  const en = localizedUrl("en", path);
  return [
    `    <xhtml:link rel="alternate" hreflang="fr" href="${escapeXml(fr)}"/>`,
    `    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(en)}"/>`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(fr)}"/>`,
  ].join("\n");
}

function urlBlock(entry: SitemapEntry, lang: "fr" | "en"): string {
  const loc = localizedUrl(lang, entry.path);
  return [
    "  <url>",
    `    <loc>${escapeXml(loc)}</loc>`,
    hreflangLinks(entry.path),
    `    <lastmod>${entry.lastmod}</lastmod>`,
    `    <changefreq>${entry.changefreq}</changefreq>`,
    `    <priority>${entry.priority}</priority>`,
    "  </url>",
  ].join("\n");
}

function blogLastmod(slug: string): string {
  return BLOG_CONTENT_UPDATED[slug] ?? getBlogPublishDate(slug);
}

/** Static marketing routes always included in the sitemap. */
function staticEntries(asOf: string): SitemapEntry[] {
  const siteLastmod = asOf;
  return [
    { path: "/", lastmod: siteLastmod, changefreq: "weekly", priority: "1.0" },
    { path: "/feature/seating-chart", lastmod: siteLastmod, changefreq: "monthly", priority: "0.9" },
    { path: "/feature/budget", lastmod: siteLastmod, changefreq: "monthly", priority: "0.9" },
    { path: "/feature/photos", lastmod: siteLastmod, changefreq: "monthly", priority: "0.9" },
    { path: "/tools/seating-chart", lastmod: siteLastmod, changefreq: "monthly", priority: "0.8" },
    { path: "/tools/budget-calculator", lastmod: siteLastmod, changefreq: "monthly", priority: "0.8" },
    { path: "/tools/timeline", lastmod: siteLastmod, changefreq: "monthly", priority: "0.8" },
    { path: "/blog", lastmod: siteLastmod, changefreq: "weekly", priority: "0.8" },
    ...BLOG_AUTHOR_SLUGS.map((slug) => ({
      path: `/author/${slug}`,
      lastmod: siteLastmod,
      changefreq: "monthly" as const,
      priority: "0.6",
    })),
    { path: "/privacy", lastmod: siteLastmod, changefreq: "monthly", priority: "0.3" },
    { path: "/terms", lastmod: siteLastmod, changefreq: "monthly", priority: "0.3" },
  ];
}

export function buildSitemapXml(asOf: string = getBuildDate()): string {
  const entries: SitemapEntry[] = [...staticEntries(asOf)];

  for (const slug of getBlogSlugs()) {
    if (!isBlogPostPublished(slug, asOf)) continue;
    entries.push({
      path: `/blog/${slug}`,
      lastmod: blogLastmod(slug),
      changefreq: "monthly",
      priority: "0.7",
    });
  }

  const urls = entries.flatMap((entry) => [
    urlBlock(entry, "fr"),
    urlBlock(entry, "en"),
  ]);

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    "",
    ...urls,
    "",
    "</urlset>",
    "",
  ].join("\n");
}

/** Write sitemap into the web export output (not committed — generated at build time). */
export function writeSitemapFile(options?: { asOf?: string; distDir?: string }): string {
  const asOf = options?.asOf ?? getBuildDate();
  const xml = buildSitemapXml(asOf);
  const distPath = join(options?.distDir ?? join(__dirname, "..", "dist"), "sitemap.xml");
  writeFileSync(distPath, xml, "utf8");
  return distPath;
}
