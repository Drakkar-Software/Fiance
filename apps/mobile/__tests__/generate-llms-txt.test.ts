import { it, expect } from "vitest";
import { readFileSync } from "fs";
import { writeLlmsTxtFile } from "@/lib/llms-txt";
import { getBlogSlugs, getPublishedBlogSlugs } from "@/lib/blog";

/** Side-effect: rewrites dist/llms.txt after expo export (see build:web) to drop unpublished blog posts. */
it("filters llms.txt to published blog posts only", () => {
  const path = writeLlmsTxtFile();
  expect(path).toContain("dist/llms.txt");

  const content = readFileSync(path, "utf8");
  const publishedSlugs = new Set(getPublishedBlogSlugs());
  for (const slug of publishedSlugs) {
    expect(content).toContain(`/blog/${slug})`);
  }
  for (const slug of getBlogSlugs()) {
    if (publishedSlugs.has(slug)) continue;
    expect(content).not.toContain(`/blog/${slug})`);
  }

  // Non-blog sections (app features, authors, privacy) are untouched.
  expect(content).toContain("## Authors (Le Carnet)");
  expect(content).toContain("/author/paul");
});
