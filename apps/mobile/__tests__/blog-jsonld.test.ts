import { describe, it, expect } from "vitest";
import {
  buildBlogJsonLd,
  buildBlogPostingNode,
  buildPostJsonLd,
  extractArticleBody,
  getBlogSlugs,
  toSchemaDateTime,
  type BlogPost,
} from "@/lib/blog";

const SAMPLE_POST: BlogPost = {
  slug: "test-post",
  categoryKey: "planning",
  category: "Préparatifs",
  title: "Test article",
  excerpt: "Short excerpt for SEO.",
  date: "2026-06-29",
  updated: "2026-06-30",
  readingMinutes: 5,
  heroImage: "https://fiance.drakkar.software/assets/og-image.png",
  heroImageAlt: "Test cover",
  sections: [
    {
      type: "text",
      title: "Section one",
      paragraphs: [
        "Read our [budget tool](/tools/budget-calculator) for details.",
      ],
    },
    {
      type: "quote",
      quote: "A memorable quote.",
    },
  ],
};

describe("toSchemaDateTime", () => {
  it("appends UTC time to date-only ISO strings", () => {
    expect(toSchemaDateTime("2026-06-29")).toBe("2026-06-29T08:00:00Z");
  });

  it("preserves full datetimes", () => {
    expect(toSchemaDateTime("2026-06-29T12:00:00Z")).toBe(
      "2026-06-29T12:00:00Z"
    );
  });
});

describe("extractArticleBody", () => {
  it("joins sections and strips markdown links", () => {
    expect(extractArticleBody(SAMPLE_POST)).toContain("budget tool");
    expect(extractArticleBody(SAMPLE_POST)).not.toContain("](/tools/");
  });
});

describe("buildBlogPostingNode", () => {
  it("includes all BlogPost fields required for rich results", () => {
    const node = buildBlogPostingNode(SAMPLE_POST, "fr") as Record<
      string,
      unknown
    >;

    expect(node["@type"]).toBe("BlogPosting");
    expect(node.headline).toBe(SAMPLE_POST.title);
    expect(node.description).toBe(SAMPLE_POST.excerpt);
    expect(node.datePublished).toBe("2026-06-29T08:00:00Z");
    expect(node.dateModified).toBe("2026-06-30T08:00:00Z");
    expect(node.articleSection).toBe(SAMPLE_POST.category);
    expect(node.keywords).toBe(SAMPLE_POST.categoryKey);
    expect(node.timeRequired).toBe("PT5M");
    expect(node.url).toBe(
      "https://fiance.drakkar.software/blog/test-post"
    );
    expect(node.author).toEqual({
      "@id": "https://fiance.drakkar.software/#author-paul",
    });
    expect(node.image).toMatchObject({
      "@type": "ImageObject",
      url: SAMPLE_POST.heroImage,
      caption: SAMPLE_POST.heroImageAlt,
    });
    expect(typeof node.wordCount).toBe("number");
    expect((node.wordCount as number) > 0).toBe(true);
    expect(typeof node.articleBody).toBe("string");
  });
});

describe("buildPostJsonLd", () => {
  it("returns a @graph with WebPage, BlogPosting, Blog, author and breadcrumbs", () => {
    const jsonLd = buildPostJsonLd(SAMPLE_POST, "fr") as {
      "@graph": Record<string, unknown>[];
    };

    expect(jsonLd["@graph"].length).toBeGreaterThanOrEqual(5);

    const types = jsonLd["@graph"].map((n) => n["@type"]);
    expect(types).toContain("WebPage");
    expect(types).toContain("BlogPosting");
    expect(types).toContain("Blog");
    expect(types).toContain("Person");
    expect(types).toContain("Organization");
    expect(types).toContain("BreadcrumbList");
  });
});

describe("buildBlogJsonLd", () => {
  it("embeds full BlogPosting nodes for each post on the index", () => {
    const jsonLd = buildBlogJsonLd(
      [SAMPLE_POST],
      "fr",
      "Blog description."
    ) as { "@graph": Record<string, unknown>[] };

    const postings = jsonLd["@graph"].filter(
      (n) => n["@type"] === "BlogPosting"
    );
    expect(postings).toHaveLength(1);
    expect(postings[0].headline).toBe(SAMPLE_POST.title);
    expect(postings[0].datePublished).toBe("2026-06-29T08:00:00Z");

    const blog = jsonLd["@graph"].find((n) => n["@type"] === "Blog") as Record<
      string,
      unknown
    >;
    expect(blog.description).toBe("Blog description.");
  });
});

describe("getBlogSlugs", () => {
  it("lists all published post slugs for static export", () => {
    expect(getBlogSlugs()).toHaveLength(50);
    expect(getBlogSlugs()).toContain("excel-vs-application-mariage");
  });
});
