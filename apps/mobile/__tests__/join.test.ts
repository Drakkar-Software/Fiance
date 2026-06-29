/**
 * Tests for the join wedding flow logic.
 *
 * The join screen's critical paths:
 * 1. Invalid/missing invite token → show error (InvalidInvite)
 * 2. Already joined this wedding → switch and redirect
 * 3. Has other weddings but not confirmed → show ConfirmJoin
 * 4. No existing weddings → go straight to join form
 * 5. Join action: existing seedPhrase → switchWedding; new → createWedding
 *
 * We test the pure decision logic extracted from these flows.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock expo-linking (needed by identity.ts)
vi.mock("expo-linking", () => ({
  createURL: (path: string, opts?: { queryParams?: Record<string, string> }) => {
    const base = `fiance:///${path}`;
    if (opts?.queryParams) {
      const qs = Object.entries(opts.queryParams).map(([k, v]) => `${k}=${v}`).join("&");
      return `${base}?${qs}`;
    }
    return base;
  },
}));


import { decodeInviteToken, buildInviteUrl, parseInviteUrl } from "@/lib/identity";

// ─── Pure helpers that mirror join.tsx decision logic ────────────────────────

interface WeddingEntry { id: string; seedPhrase?: string }
interface Registry { weddings: WeddingEntry[]; activeWeddingId: string }

/** Returns the existing wedding that matches this invite password, or null. */
function findExisting(registry: Registry | null, password: string): WeddingEntry | null {
  return registry?.weddings.find((w) => w.seedPhrase === password) ?? null;
}

/** Determines the action to take when joining via invite. */
function resolveJoinAction(
  registry: Registry | null,
  password: string
): "switch" | "create" {
  return findExisting(registry, password) ? "switch" : "create";
}

/** Determines which screen to show given the current state. */
function resolveJoinScreen(
  invite: { name: string; password: string } | null,
  registry: Registry | null,
  confirmed: boolean
): "invalid" | "already_joined" | "confirm" | "form" {
  if (!invite) return "invalid";
  const alreadyJoined = !!findExisting(registry, invite.password);
  if (alreadyJoined) return "already_joined";
  const hasWeddings = (registry?.weddings.length ?? 0) > 0;
  if (hasWeddings && !confirmed) return "confirm";
  return "form";
}

// ─── decodeInviteToken (via buildInviteUrl round-trip) ───────────────────────

describe("decodeInviteToken", () => {
  it("returns null for undefined", () => {
    expect(decodeInviteToken(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(decodeInviteToken("")).toBeNull();
  });

  it("returns null for garbage input", () => {
    expect(decodeInviteToken("!!!not-base64!!!")).toBeNull();
  });

  it("returns null for valid base64 with missing fields", () => {
    // valid base64 but JSON without required fields
    const token = btoa(JSON.stringify({ x: 1 })).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    expect(decodeInviteToken(token)).toBeNull();
  });

  it("round-trips through buildInviteUrl (fragment-based URL)", () => {
    const url = buildInviteUrl("Alice & Bob", "my-secret-pass");
    // v3: payload is in the URL fragment (#), not query param (?t=)
    const fragment = url.includes("#") ? url.split("#")[1] : "";
    expect(fragment).not.toBe("");
    const result = decodeInviteToken(fragment);
    expect(result).toEqual({ name: "Alice & Bob", password: "my-secret-pass" });
  });

  it("parseInviteUrl decodes a fragment-based invite URL end-to-end", () => {
    // Exercises the full builder → fragment → reader path (the path join.tsx now uses)
    const url = buildInviteUrl("Alice & Bob", "my-secret-pass");
    expect(parseInviteUrl(url)).toEqual({ name: "Alice & Bob", password: "my-secret-pass" });
  });

  it("handles special characters in wedding name", () => {
    const url = buildInviteUrl("Éloïse & François", "pass123");
    const fragment = url.includes("#") ? url.split("#")[1] : "";
    expect(decodeInviteToken(fragment)?.name).toBe("Éloïse & François");
  });
});

// ─── resolveJoinAction ───────────────────────────────────────────────────────

describe("resolveJoinAction", () => {
  it("returns 'create' when registry is null", () => {
    expect(resolveJoinAction(null, "pass")).toBe("create");
  });

  it("returns 'create' when no matching wedding exists", () => {
    const registry: Registry = { weddings: [{ id: "1", seedPhrase: "other-pass" }], activeWeddingId: "1" };
    expect(resolveJoinAction(registry, "new-pass")).toBe("create");
  });

  it("returns 'switch' when a wedding with this password already exists", () => {
    const registry: Registry = { weddings: [{ id: "abc", seedPhrase: "known-pass" }], activeWeddingId: "abc" };
    expect(resolveJoinAction(registry, "known-pass")).toBe("switch");
  });

  it("returns 'switch' when multiple weddings exist and one matches", () => {
    const registry: Registry = {
      weddings: [
        { id: "1", seedPhrase: "alpha" },
        { id: "2", seedPhrase: "beta" },
        { id: "3", seedPhrase: "gamma" },
      ],
      activeWeddingId: "1",
    };
    expect(resolveJoinAction(registry, "beta")).toBe("switch");
    expect(resolveJoinAction(registry, "delta")).toBe("create");
  });

  it("returns 'create' when matching wedding has no seedPhrase", () => {
    const registry: Registry = { weddings: [{ id: "1" }], activeWeddingId: "1" };
    expect(resolveJoinAction(registry, "some-pass")).toBe("create");
  });
});

// ─── _layout.tsx routing guard logic ─────────────────────────────────────────
//
// Mirrors the isOnboardingLike / redirect / spinner guards in app/_layout.tsx.
// A regression here means a user without a wedding clicking a /join?t=... link
// would be bounced to /onboarding and never see the join form.

function isOnboardingLike(segment: string | undefined): boolean {
  return segment === "onboarding" || segment === "join";
}

function shouldRedirectToOnboarding(
  isLoaded: boolean,
  isPublicPage: boolean,
  segment: string | undefined,
  hasWedding: boolean
): boolean {
  if (!isLoaded || isPublicPage || isOnboardingLike(segment)) return false;
  return !hasWedding;
}

function shouldShowLoadingSpinner(hasWedding: boolean, segment: string | undefined): boolean {
  return !hasWedding && !isOnboardingLike(segment);
}

describe("routing guards — /join deep link", () => {
  it("isOnboardingLike is true for 'join'", () => {
    expect(isOnboardingLike("join")).toBe(true);
  });

  it("isOnboardingLike is true for 'onboarding'", () => {
    expect(isOnboardingLike("onboarding")).toBe(true);
  });

  it("isOnboardingLike is false for app routes", () => {
    expect(isOnboardingLike("(tabs)")).toBe(false);
    expect(isOnboardingLike("wedding")).toBe(false);
    expect(isOnboardingLike(undefined)).toBe(false);
  });

  it("does NOT redirect to onboarding when segment is 'join' and no wedding", () => {
    expect(shouldRedirectToOnboarding(true, false, "join", false)).toBe(false);
  });

  it("does NOT redirect to onboarding when segment is 'onboarding' and no wedding", () => {
    expect(shouldRedirectToOnboarding(true, false, "onboarding", false)).toBe(false);
  });

  it("DOES redirect to onboarding when on a regular route with no wedding", () => {
    expect(shouldRedirectToOnboarding(true, false, "(tabs)", false)).toBe(true);
  });

  it("does NOT redirect when registry is loaded and wedding exists", () => {
    expect(shouldRedirectToOnboarding(true, false, "(tabs)", true)).toBe(false);
  });

  it("does NOT redirect before registry is loaded", () => {
    expect(shouldRedirectToOnboarding(false, false, "(tabs)", false)).toBe(false);
  });

  it("does NOT show spinner when segment is 'join' and no wedding", () => {
    expect(shouldShowLoadingSpinner(false, "join")).toBe(false);
  });

  it("does NOT show spinner when segment is 'onboarding' and no wedding", () => {
    expect(shouldShowLoadingSpinner(false, "onboarding")).toBe(false);
  });

  it("DOES show spinner on regular route with no wedding (redirect in flight)", () => {
    expect(shouldShowLoadingSpinner(false, "(tabs)")).toBe(true);
  });

  it("does NOT show spinner when wedding exists", () => {
    expect(shouldShowLoadingSpinner(true, "(tabs)")).toBe(false);
  });
});

// ─── resolveJoinScreen ───────────────────────────────────────────────────────

describe("resolveJoinScreen", () => {
  const validInvite = { name: "Alice & Bob", password: "secret" };

  it("shows 'invalid' when invite is null (bad token)", () => {
    expect(resolveJoinScreen(null, null, false)).toBe("invalid");
  });

  it("shows 'already_joined' when registry contains this password", () => {
    const registry: Registry = { weddings: [{ id: "1", seedPhrase: "secret" }], activeWeddingId: "1" };
    expect(resolveJoinScreen(validInvite, registry, false)).toBe("already_joined");
  });

  it("shows 'confirm' when user has other weddings and not yet confirmed", () => {
    const registry: Registry = { weddings: [{ id: "1", seedPhrase: "other" }], activeWeddingId: "1" };
    expect(resolveJoinScreen(validInvite, registry, false)).toBe("confirm");
  });

  it("shows 'form' when user has other weddings but has confirmed", () => {
    const registry: Registry = { weddings: [{ id: "1", seedPhrase: "other" }], activeWeddingId: "1" };
    expect(resolveJoinScreen(validInvite, registry, true)).toBe("form");
  });

  it("shows 'form' when registry is null (first-time user)", () => {
    expect(resolveJoinScreen(validInvite, null, false)).toBe("form");
  });

  it("shows 'form' when registry has no weddings", () => {
    const registry: Registry = { weddings: [], activeWeddingId: "" };
    expect(resolveJoinScreen(validInvite, registry, false)).toBe("form");
  });

  it("'already_joined' takes priority over 'confirm'", () => {
    // Registry has this wedding AND other weddings
    const registry: Registry = {
      weddings: [{ id: "1", seedPhrase: "secret" }, { id: "2", seedPhrase: "other" }],
      activeWeddingId: "1",
    };
    expect(resolveJoinScreen(validInvite, registry, false)).toBe("already_joined");
  });
});
