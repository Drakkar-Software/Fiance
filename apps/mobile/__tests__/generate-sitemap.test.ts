import { it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { writeSitemapFile, buildSitemapXml } from "@/lib/sitemap";
import { getBlogSlugs, getPublishedBlogSlugs } from "@/lib/blog";

/**
 * Side-effect: writes dist/sitemap.xml after expo export (see build:web).
 * Uses the real current date (or an externally-set BUILD_DATE override, per
 * CLAUDE.md's documented build-time flag) so the sitemap always matches
 * whatever generateStaticParams actually exported for this build.
 */
it("generates sitemap.xml with published blog posts only", () => {
  const path = writeSitemapFile();
  expect(path).toContain("dist/sitemap.xml");
  expect(existsSync(path)).toBe(true);

  const xml = readFileSync(path, "utf8");
  expect(xml).toContain("https://fiance.drakkar.software/fr/author/paul");
  expect(xml).toContain("https://fiance.drakkar.software/en/author/camille");
  expect(xml).toContain('hreflang="fr"');
  expect(xml).toContain('hreflang="x-default"');

  const publishedSlugs = new Set(getPublishedBlogSlugs());
  for (const slug of publishedSlugs) {
    expect(xml).toContain(`/fr/blog/${slug}`);
    expect(xml).toContain(`/en/blog/${slug}`);
  }
  for (const slug of getBlogSlugs()) {
    if (publishedSlugs.has(slug)) continue;
    expect(xml).not.toContain(`/fr/blog/${slug}`);
  }
});

it("buildSitemapXml respects BUILD_DATE for blog entries", () => {
  process.env.BUILD_DATE = "2026-06-22";
  const empty = buildSitemapXml();
  expect(empty).not.toContain("/blog/premieres-etapes-organiser-mariage");
  delete process.env.BUILD_DATE;
});
