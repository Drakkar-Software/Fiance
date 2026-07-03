import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { getPublishedBlogSlugs } from "./blog";

const BLOG_LINE_RE = /^- \[.*?\]\(https:\/\/fiance\.drakkar\.software\/[a-z]{2}\/blog\/([a-z0-9-]+)\):/;

/** Drops "## Le Carnet (blog)" entries whose slug isn't published yet (per BUILD_DATE). */
export function filterLlmsTxt(content: string, publishedSlugs: Set<string>): string {
  return content
    .split("\n")
    .filter((line) => {
      const match = line.match(BLOG_LINE_RE);
      if (!match) return true;
      return publishedSlugs.has(match[1]);
    })
    .join("\n");
}

/**
 * Writes dist/llms.txt from the source-of-truth public/llms.txt, filtered to
 * published posts. Reads the source file directly (not dist/, which expo
 * export may or may not have populated yet) so this is safe to run in any order.
 */
export function writeLlmsTxtFile(options?: { distDir?: string; publicDir?: string; asOf?: string }): string {
  const publicPath = join(options?.publicDir ?? join(__dirname, "..", "public"), "llms.txt");
  const distDir = options?.distDir ?? join(__dirname, "..", "dist");
  const distPath = join(distDir, "llms.txt");
  const content = readFileSync(publicPath, "utf8");
  const filtered = filterLlmsTxt(content, new Set(getPublishedBlogSlugs(options?.asOf)));
  writeFileSync(distPath, filtered, "utf8");
  return distPath;
}
