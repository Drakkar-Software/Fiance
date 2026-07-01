/** Parse sourceUrl which can be a single URL string or a JSON array of URLs */
export function parseLinks(sourceUrl: string | null | undefined): string[] {
  if (!sourceUrl) return [];
  try {
    const parsed = JSON.parse(sourceUrl);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return [sourceUrl];
}

export function serializeLinks(links: string[]): string | null {
  const filtered = links.map((l) => l.trim()).filter(Boolean);
  if (filtered.length === 0) return null;
  if (filtered.length === 1) return filtered[0];
  return JSON.stringify(filtered);
}

export function isValidUrl(url: string): boolean {
  return /^https?:\/\//i.test(url.trim());
}
