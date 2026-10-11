/**
 * Screen-event privacy.
 *
 * Automatic screen tracking calls `client.screen` with the concrete URL
 * (web also adds `$url`, `$title`, and `$referrer`). Those fields can carry
 * a guest-link token or the couple's names. `installScreenPrivacy` rewrites
 * every `screen` call to the Expo route pattern and `$path` only.
 */

export const screenPrivacyInstalled: unique symbol = Symbol.for("fiance.screenPrivacyInstalled");

/**
 * Expo Router patterns for `apps/mobile/app`. Parentheses groups are omitted
 * from the URL. Dynamic segments stay as `[param]` names from the file tree.
 */
const ROUTE_PATTERNS = [
  "/",
  "/onboarding",
  "/join",
  "/wedding-switch",
  "/wedding/[id]",
  "/ideas",
  "/ideas/collections",
  "/ideas/[id]",
  "/settings",
  "/settings/documents",
  "/settings/event-photos",
  "/settings/export-import",
  "/settings/faq",
  "/settings/gifts",
  "/settings/import-external",
  "/settings/import-file",
  "/settings/premium",
  "/settings/public-page",
  "/settings/roles",
  "/budget",
  "/guests",
  "/guests/accommodations",
  "/guests/communication/[id]",
  "/guests/communications",
  "/guests/communications/templates",
  "/guests/groups",
  "/guests/[id]",
  "/guests/invitation-types",
  "/guests/seating",
  "/guests/seating-constraints",
  "/guests/table-management",
  "/guests/tables",
  "/guests/wedding-party",
  "/home",
  "/home/wedding-day",
  "/planning",
  "/planning/agenda",
  "/planning/agenda-event",
  "/planning/categories",
  "/planning/ceremony",
  "/planning/ceremony-item",
  "/planning/day-of",
  "/planning/day-of-item",
  "/planning/events",
  "/planning/honeymoon",
  "/planning/[id]",
  "/planning/live",
  "/planning/speeches-music",
  "/planning/speech",
  "/vendors",
  "/vendors/compare",
  "/vendors/new",
  "/vendors/[type]",
  "/vendors/[type]/[id]",
  "/[lang]",
  "/[lang]/author/[slug]",
  "/[lang]/blog",
  "/[lang]/blog/[slug]",
  "/[lang]/feature/budget",
  "/[lang]/feature/photos",
  "/[lang]/feature/seating-chart",
  "/[lang]/privacy",
  "/[lang]/terms",
  "/[lang]/tools/budget-calculator",
  "/[lang]/tools/seating-chart",
  "/[lang]/tools/timeline",
] as const;

type Segment = { kind: "static"; value: string } | { kind: "param"; name: string };

const PARSED_PATTERNS: Segment[][] = ROUTE_PATTERNS.map(parsePattern);

function parsePattern(pattern: string): Segment[] {
  if (pattern === "/") return [];
  return pattern.split("/").filter(Boolean).map((part) => {
    const match = /^\[(.+)\]$/.exec(part);
    return match ? { kind: "param", name: match[1] } : { kind: "static", value: part };
  });
}

function pathnameOnly(input: string): string {
  const withoutHash = input.split("#")[0] ?? "";
  const withoutQuery = withoutHash.split("?")[0] ?? "";
  if (withoutQuery.startsWith("http://") || withoutQuery.startsWith("https://")) {
    try {
      return new URL(withoutQuery).pathname;
    } catch {
      return "/";
    }
  }
  if (withoutQuery === "" || withoutQuery === "/") return "/";
  return withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
}

function segmentsOf(pathname: string): string[] {
  return pathnameOnly(pathname).split("/").filter(Boolean);
}

function staticCount(pattern: Segment[]): number {
  return pattern.filter((segment) => segment.kind === "static").length;
}

function renderPattern(pattern: Segment[]): string {
  if (pattern.length === 0) return "/";
  return `/${pattern.map((segment) => (segment.kind === "param" ? `[${segment.name}]` : segment.value)).join("/")}`;
}

/**
 * Concrete pathname to an Expo route pattern.
 * An unmatched path is redacted segment by segment so a token cannot pass through.
 */
export function screenRoutePattern(pathname: string): string {
  const segments = segmentsOf(pathname);
  let best: Segment[] | null = null;
  let bestScore = -1;
  for (const pattern of PARSED_PATTERNS) {
    if (pattern.length !== segments.length) continue;
    let matches = true;
    for (let i = 0; i < pattern.length; i++) {
      const segment = pattern[i];
      if (segment.kind === "static" && segment.value !== segments[i]) {
        matches = false;
        break;
      }
    }
    if (!matches) continue;
    const score = staticCount(pattern);
    if (score > bestScore) {
      best = pattern;
      bestScore = score;
    }
  }
  if (best) return renderPattern(best);
  if (segments.length === 0) return "/";
  return `/${segments.map(() => "[param]").join("/")}`;
}

export type PrivateScreenEvent = {
  name: string;
  properties: { $path: string };
};

/**
 * Keep the route pattern as the screen name and `$path`.
 * Drop `$url`, `$title`, `$referrer`, and every other property.
 */
export function sanitizeScreenEvent(
  screenName: string,
  properties?: Record<string, unknown> | null,
): PrivateScreenEvent {
  const rawPath = typeof properties?.$path === "string" && properties.$path.length > 0
    ? properties.$path
    : screenName;
  const pattern = screenRoutePattern(rawPath);
  return { name: pattern, properties: { $path: pattern } };
}

type ScreenClient = {
  screen(screenName: string, properties?: Record<string, unknown>): void;
};

/**
 * Replace `client.screen` so automatic tracking cannot enqueue a raw URL,
 * a document title, or a referrer.
 */
export function installScreenPrivacy<T extends ScreenClient>(client: T): T {
  const forward = client.screen.bind(client);
  client.screen = (screenName, properties) => {
    const safe = sanitizeScreenEvent(screenName, properties);
    forward(safe.name, safe.properties);
  };
  Reflect.set(client, screenPrivacyInstalled, true);
  return client;
}
