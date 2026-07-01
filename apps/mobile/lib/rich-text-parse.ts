export type TextSegment =
  | { type: "text"; value: string }
  | { type: "link"; label: string; href: string };

const MARKDOWN_LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;

/** Ensure href works in router and Linking. */
export function normalizeHref(href: string): string {
  const trimmed = href.trim();
  if (trimmed.startsWith("/")) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/** Split plain text into segments, supporting `[label](url)` markdown links. */
export function parseInlineMarkdown(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  MARKDOWN_LINK_RE.lastIndex = 0;
  while ((match = MARKDOWN_LINK_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    segments.push({
      type: "link",
      label: match[1],
      href: normalizeHref(match[2]),
    });
    lastIndex = MARKDOWN_LINK_RE.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ type: "text", value: text }];
}
