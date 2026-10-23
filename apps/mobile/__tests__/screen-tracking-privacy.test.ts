/**
 * Screen events must not carry a guest-link token or the couple's names.
 *
 * The web tracker (sunglasses-react useScreenTracking) sends
 * `$path`, `$url`, `$title`, and `$referrer`. The native tracker
 * (sunglasses-react-native useExpoRouterScreenTracking) sends the concrete
 * pathname as the screen name and `$path`. Both call `client.screen`.
 * The app forwards that call through `installScreenPrivacy`.
 */

import { describe, expect, it } from "vitest";
import { analytics } from "@/lib/analytics";
import {
  installScreenPrivacy,
  screenPrivacyInstalled,
  screenRoutePattern,
  sanitizeScreenEvent,
} from "@/lib/screen-tracking";

const GUEST_TOKEN =
  "eyJ2IjoxLCJwIjp7InNwYWNlSWQiOiJzcGFjZSJ9LCJyIjp7Im5vZGVJZCI6InJzdnAtd3JpdGUifX0";
const COUPLE = "Alice & Bob";
const FR_TITLE = `Mariage de ${COUPLE}`;
const EN_TITLE = `Wedding of ${COUPLE}`;

type ScreenCall = { name: string; properties?: Record<string, unknown> };

/** Same properties sunglasses-react writes on a history change. */
function webTrackerCall(pathname: string, href: string, title: string, referrer?: string) {
  const props: Record<string, unknown> = {
    $path: pathname,
    $url: href,
  };
  if (title) props.$title = title;
  if (referrer) props.$referrer = referrer;
  return { name: pathname, props };
}

/** Same properties the native Expo Router tracker writes. */
function nativeTrackerCall(pathname: string) {
  return { name: pathname, props: { $path: pathname } as Record<string, unknown> };
}

function delivered(name: string, props: Record<string, unknown>): ScreenCall[] {
  const calls: ScreenCall[] = [];
  const client = {
    screen(screenName: string, properties?: Record<string, unknown>) {
      calls.push({ name: screenName, properties });
    },
  };
  installScreenPrivacy(client);
  client.screen(name, props);
  return calls;
}

function assertPrivate(call: ScreenCall | undefined, pattern: string, secrets: string[]) {
  expect(call).toBeDefined();
  expect(call?.name).toBe(pattern);
  expect(call?.properties).toEqual({ $path: pattern });
  expect(call?.properties?.$url).toBeUndefined();
  expect(call?.properties?.$title).toBeUndefined();
  expect(call?.properties?.$referrer).toBeUndefined();
  const dumped = JSON.stringify(call);
  for (const secret of secrets) {
    expect(dumped).not.toContain(secret);
  }
}

describe("screen tracking privacy", () => {
  it("is installed on the analytics client the layout passes to screen tracking", () => {
    expect(Reflect.get(analytics, screenPrivacyInstalled)).toBe(true);
  });

  it("jeton invité absent des stats", () => {
    const path = `/wedding/${GUEST_TOKEN}`;
    const href = `https://fiance.example${path}?rsvp=1`;
    const web = webTrackerCall(path, href, FR_TITLE, "https://fiance.example/fr");
    const native = nativeTrackerCall(path);

    // The tracker input still carries the token. That is the leak this wrapper closes.
    expect(web.name).toContain(GUEST_TOKEN);
    expect(web.props.$path).toContain(GUEST_TOKEN);
    expect(web.props.$url).toContain(GUEST_TOKEN);
    expect(native.name).toContain(GUEST_TOKEN);
    expect(native.props.$path).toContain(GUEST_TOKEN);

    assertPrivate(delivered(web.name, web.props)[0], "/wedding/[id]", [GUEST_TOKEN, COUPLE]);
    assertPrivate(delivered(native.name, native.props)[0], "/wedding/[id]", [GUEST_TOKEN]);
    assertPrivate(sanitizeScreenEvent(web.name, web.props), "/wedding/[id]", [GUEST_TOKEN, COUPLE]);
  });

  it("noms du couple absents des stats, FR et EN", () => {
    const path = `/wedding/${GUEST_TOKEN}`;
    for (const title of [FR_TITLE, EN_TITLE]) {
      const web = webTrackerCall(path, `https://fiance.example${path}`, title);
      expect(web.props.$title).toBe(title);
      expect(String(web.props.$title)).toContain(COUPLE);

      const call = delivered(web.name, web.props)[0];
      assertPrivate(call, "/wedding/[id]", [COUPLE, "Mariage de", "Wedding of", GUEST_TOKEN]);
    }
  });

  it("/join# keeps the route pattern and drops the fragment token", () => {
    const href = `https://fiance.example/join#${GUEST_TOKEN}`;
    const web = webTrackerCall("/join", href, EN_TITLE, href);
    expect(String(web.props.$url)).toContain(GUEST_TOKEN);
    expect(String(web.props.$referrer)).toContain(GUEST_TOKEN);

    assertPrivate(delivered(web.name, web.props)[0], "/join", [GUEST_TOKEN, COUPLE]);
    assertPrivate(delivered(nativeTrackerCall("/join").name, nativeTrackerCall("/join").props)[0], "/join", [
      GUEST_TOKEN,
    ]);
  });

  it("still tracks the other screens under their route patterns", () => {
    const screens = ["/home", "/guests", "/budget", "/planning", "/vendors", "/settings"];
    for (const path of screens) {
      const web = webTrackerCall(path, `https://fiance.example${path}`, FR_TITLE);
      assertPrivate(delivered(web.name, web.props)[0], path, [COUPLE, "Mariage de"]);
      assertPrivate(delivered(path, { $path: path })[0], path, []);
    }
  });

  it("maps dynamic app routes to patterns and never echoes the raw segment", () => {
    const secret = "guest-row-9f3c";
    const cases: [string, string][] = [
      [`/guests/${secret}`, "/guests/[id]"],
      [`/guests/communication/${secret}`, "/guests/communication/[id]"],
      [`/planning/${secret}`, "/planning/[id]"],
      ["/vendors/photographer", "/vendors/[type]"],
      [`/vendors/photographer/${secret}`, "/vendors/[type]/[id]"],
      [`/ideas/${secret}`, "/ideas/[id]"],
      ["/fr/blog/seating-chart", "/[lang]/blog/[slug]"],
      ["/vendors/new", "/vendors/new"],
      ["/guests/communications/templates", "/guests/communications/templates"],
      ["/", "/"],
    ];
    for (const [path, pattern] of cases) {
      expect(screenRoutePattern(path)).toBe(pattern);
      const call = delivered(path, { $path: path, $url: `https://fiance.example${path}` })[0];
      assertPrivate(call, pattern, [secret]);
    }
  });
});
