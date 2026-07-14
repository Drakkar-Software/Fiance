import { describe, it, expect } from "vitest";
import {
  buildBlogJsonLd,
  buildBlogPostingNode,
  buildPostJsonLd,
  extractArticleBody,
  getBlogPosts,
  getBlogSlugs,
  getPublishedBlogSlugs,
  getLandingBlogPosts,
  LANDING_BLOG_SLUGS,
  toSchemaDateTime,
  type BlogPost,
} from "@/lib/blog";
import { getBlogPublishDate } from "@/lib/blog-publish-dates";

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
      "https://fiance.drakkar.software/fr/blog/test-post"
    );
    expect(node.author).toEqual({
      "@id": "https://fiance.drakkar.software/fr/author/paul#person",
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
  it("uses lightweight @id refs on the index instead of full BlogPosting nodes", () => {
    const jsonLd = buildBlogJsonLd(
      [SAMPLE_POST],
      "fr",
      "Blog description."
    ) as { "@graph": Record<string, unknown>[] };

    const postings = jsonLd["@graph"].filter(
      (n) => n["@type"] === "BlogPosting"
    );
    expect(postings).toHaveLength(0);

    const blog = jsonLd["@graph"].find((n) => n["@type"] === "Blog") as Record<
      string,
      unknown
    >;
    expect(blog.description).toBe("Blog description.");
    expect(blog.blogPost).toEqual([
      { "@id": "https://fiance.drakkar.software/fr/blog/test-post#article" },
    ]);

    const types = jsonLd["@graph"].map((n) => n["@type"]);
    expect(types).toContain("Person");
    expect(types).toContain("Organization");
    expect(types).toContain("BreadcrumbList");
  });
});

describe("getBlogSlugs", () => {
  it("lists all post slugs in the content corpus", () => {
    expect(getBlogSlugs()).toHaveLength(192);
    expect(getBlogSlugs()).toContain("excel-vs-application-mariage");
  });
});

describe("getPublishedBlogSlugs", () => {
  it("returns only posts whose publish date is on or before BUILD_DATE", () => {
    process.env.BUILD_DATE = "2026-07-02";
    const published = getPublishedBlogSlugs();
    expect(published).toContain("premieres-etapes-organiser-mariage");
    expect(published).not.toContain("fiance-vs-mariages-net");
    expect(published).toHaveLength(10);
    delete process.env.BUILD_DATE;
  });

  it("excludes all posts before the first publish day", () => {
    process.env.BUILD_DATE = "2026-06-22";
    expect(getPublishedBlogSlugs()).toHaveLength(0);
    delete process.env.BUILD_DATE;
  });
});

describe("blog JSON-LD dates for all posts", () => {
  it("every post has datePublished and dateModified in BlogPosting JSON-LD", () => {
    for (const slug of getBlogSlugs()) {
      const post = getBlogPosts("fr").find((p) => p.slug === slug);
      expect(post, `missing post: ${slug}`).toBeDefined();
      expect(post!.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      const node = buildBlogPostingNode(post!, "fr") as Record<string, string>;
      expect(node.datePublished).toBe(`${post!.date}T08:00:00Z`);
      expect(node.dateModified).toBe(
        toSchemaDateTime(post!.updated ?? post!.date)
      );
    }
  });

  it("sets dateModified after content edits via BLOG_CONTENT_UPDATED", () => {
    const post = getBlogPosts("fr").find(
      (p) => p.slug === "fiance-vs-mariages-net"
    )!;
    expect(post.updated).toBe("2026-07-10");
    expect(post.date).toBe(getBlogPublishDate("fiance-vs-mariages-net"));
    const node = buildBlogPostingNode(post, "fr") as Record<string, string>;
    expect(node.datePublished).toBe(`${post.date}T08:00:00Z`);
    expect(node.dateModified).toBe("2026-07-10T08:00:00Z");
  });
});

describe("getLandingBlogPosts", () => {
  it("returns exactly three curated posts in order", () => {
    const posts = getLandingBlogPosts("fr");
    expect(posts).toHaveLength(3);
    expect(posts.map((p) => p.slug)).toEqual([...LANDING_BLOG_SLUGS]);
  });
});
