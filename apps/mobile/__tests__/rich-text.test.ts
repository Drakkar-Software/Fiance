import { describe, it, expect } from "vitest";
import { normalizeHref, parseInlineMarkdown } from "@/lib/rich-text-parse";

describe("normalizeHref", () => {
  it("keeps absolute and relative URLs", () => {
    expect(normalizeHref("/tools/timeline")).toBe("/tools/timeline");
    expect(normalizeHref("https://example.com")).toBe("https://example.com");
  });

  it("adds https to bare domains", () => {
    expect(normalizeHref("fiance.drakkar.software/blog")).toBe(
      "https://fiance.drakkar.software/blog"
    );
  });
});

describe("parseInlineMarkdown", () => {
  it("parses markdown links", () => {
    expect(
      parseInlineMarkdown("Voir [service-public.fr](https://www.service-public.fr)")
    ).toEqual([
      { type: "text", value: "Voir " },
      {
        type: "link",
        label: "service-public.fr",
        href: "https://www.service-public.fr",
      },
    ]);
  });

  it("returns plain text when no links", () => {
    expect(parseInlineMarkdown("Hello world")).toEqual([
      { type: "text", value: "Hello world" },
    ]);
  });
});
