/**
 * Tests for the join wedding flow logic.
 *
 * The join screen's critical paths:
 * 1. Invalid/missing invite token → show error (InvalidInvite)
 * 2. Already joined this wedding (by spaceId) → switch and redirect
 * 3. Not yet confirmed → show ConfirmJoin
 * 4. Confirmed → show AutoJoin (runs joinWeddingByToken)
 *
 * We test the pure decision logic extracted from these flows,
 * plus the parseSpaceInviteUrl URL parsing helper.
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


import { parseSpaceInviteUrl } from "@/lib/identity";
import {
  encodeSpaceInviteLink,
  decodeSpaceInviteLink,
  type SpaceInviteLinkToken,
} from "@fiance/sdk";

// ─── Pure helpers that mirror join.tsx decision logic ────────────────────────

interface WeddingEntry { id: string; spaceId?: string }
interface Registry { weddings: WeddingEntry[]; activeWeddingId: string }

/** Returns the existing wedding that matches this invite spaceId, or null. */
function findExisting(registry: Registry | null, spaceId: string): WeddingEntry | null {
  return registry?.weddings.find((w) => w.spaceId === spaceId) ?? null;
}

/** Determines the action to take when joining via invite. */
function resolveJoinAction(
  registry: Registry | null,
  spaceId: string
): "switch" | "join" {
  return findExisting(registry, spaceId) ? "switch" : "join";
}

/** Determines which screen to show given the current state. */
function resolveJoinScreen(
  token: { spaceId: string; spaceName: string } | null,
  registry: Registry | null,
  confirmed: boolean
): "invalid" | "already_joined" | "confirm" | "form" {
  if (!token) return "invalid";
  const alreadyJoined = !!findExisting(registry, token.spaceId);
  if (alreadyJoined) return "already_joined";
  if (!confirmed) return "confirm";
  return "form";
}

// Minimal valid SpaceInviteLinkToken for testing decode/encode round-trips
function makeTestToken(spaceId = "sp-test123", spaceName = "Alice & Bob"): SpaceInviteLinkToken {
  return {
    v: 1,
    spaceId,
    spaceName,
    cap: {},
    key: "a".repeat(64),
    kemPriv: "b".repeat(64),
    kemPub: "c".repeat(64),
    write: true,
  };
}

// ─── parseSpaceInviteUrl ─────────────────────────────────────────────────────

describe("parseSpaceInviteUrl", () => {
  it("returns null for a URL with no fragment", () => {
    expect(parseSpaceInviteUrl("https://fiance.drakkar.software/join")).toBeNull();
  });

  it("returns null for a URL with a garbage fragment", () => {
    expect(parseSpaceInviteUrl("https://fiance.drakkar.software/join#!!!garbage!!!")).toBeNull();
  });

  it("round-trips a valid SpaceInviteLinkToken through encodeSpaceInviteLink / parseSpaceInviteUrl", () => {
    const token = makeTestToken();
    const link = encodeSpaceInviteLink("https://fiance.drakkar.software", token);
    expect(link).toContain("#");
    const result = parseSpaceInviteUrl(link);
    expect(result).not.toBeNull();
    expect(result?.spaceId).toBe(token.spaceId);
    expect(result?.spaceName).toBe(token.spaceName);
    expect(result?.write).toBe(token.write);
  });

  it("tolerates a polluted fragment (share target appended text + duplicate url)", () => {
    // Reproduces the production bug where navigator.share produced:
    // <url>#<payload>%20Join%20us!%20<url>#<payload>
    // Only the leading base64url token should be decoded.
    const token = makeTestToken();
    const link = encodeSpaceInviteLink("https://fiance.drakkar.software", token);
    const fragment = link.split("#")[1];
    const polluted = `${link}%20Rejoins%20notre%20mariage%20!%20${link}`;
    const result = parseSpaceInviteUrl(polluted);
    expect(result).not.toBeNull();
    expect(result?.spaceId).toBe(token.spaceId);
    void fragment;
  });

  it("returns null when the fragment is a valid legacy invite (old { n, p } format)", () => {
    // Old links with { n: name, p: seedPhrase } should return null — the decoder
    // (decodeSpaceInviteLink) expects the v:1 SpaceInviteLinkToken shape.
    const legacyToken = btoa(JSON.stringify({ n: "Alice", p: "some seed phrase" }))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    const legacyUrl = `https://fiance.drakkar.software/join#${legacyToken}`;
    expect(parseSpaceInviteUrl(legacyUrl)).toBeNull();
  });
});

// ─── resolveJoinAction ───────────────────────────────────────────────────────

describe("resolveJoinAction", () => {
  it("returns 'join' when registry is null", () => {
    expect(resolveJoinAction(null, "sp-123")).toBe("join");
  });

  it("returns 'join' when no matching spaceId exists", () => {
    const registry: Registry = { weddings: [{ id: "1", spaceId: "sp-other" }], activeWeddingId: "1" };
    expect(resolveJoinAction(registry, "sp-new")).toBe("join");
  });

  it("returns 'switch' when a wedding with this spaceId already exists", () => {
    const registry: Registry = { weddings: [{ id: "abc", spaceId: "sp-known" }], activeWeddingId: "abc" };
    expect(resolveJoinAction(registry, "sp-known")).toBe("switch");
  });

  it("returns 'switch' when multiple weddings exist and one matches", () => {
    const registry: Registry = {
      weddings: [
        { id: "1", spaceId: "sp-alpha" },
        { id: "2", spaceId: "sp-beta" },
        { id: "3", spaceId: "sp-gamma" },
      ],
      activeWeddingId: "1",
    };
    expect(resolveJoinAction(registry, "sp-beta")).toBe("switch");
    expect(resolveJoinAction(registry, "sp-delta")).toBe("join");
  });

  it("returns 'join' when matching wedding has no spaceId", () => {
    const registry: Registry = { weddings: [{ id: "1" }], activeWeddingId: "1" };
    expect(resolveJoinAction(registry, "sp-any")).toBe("join");
  });
});

// ─── _layout.tsx routing guard logic ─────────────────────────────────────────

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
  const validToken = { spaceId: "sp-abc123", spaceName: "Alice & Bob" };

  it("shows 'invalid' when token is null (bad or missing invite)", () => {
    expect(resolveJoinScreen(null, null, false)).toBe("invalid");
  });

  it("shows 'already_joined' when registry contains this spaceId", () => {
    const registry: Registry = { weddings: [{ id: "1", spaceId: "sp-abc123" }], activeWeddingId: "1" };
    expect(resolveJoinScreen(validToken, registry, false)).toBe("already_joined");
  });

  it("shows 'confirm' when user has other weddings and not yet confirmed", () => {
    const registry: Registry = { weddings: [{ id: "1", spaceId: "sp-other" }], activeWeddingId: "1" };
    expect(resolveJoinScreen(validToken, registry, false)).toBe("confirm");
  });

  it("shows 'form' when user has other weddings but has confirmed", () => {
    const registry: Registry = { weddings: [{ id: "1", spaceId: "sp-other" }], activeWeddingId: "1" };
    expect(resolveJoinScreen(validToken, registry, true)).toBe("form");
  });

  it("shows 'confirm' when registry is null (first-time user — always confirm)", () => {
    expect(resolveJoinScreen(validToken, null, false)).toBe("confirm");
  });

  it("shows 'confirm' when registry has no weddings", () => {
    const registry: Registry = { weddings: [], activeWeddingId: "" };
    expect(resolveJoinScreen(validToken, registry, false)).toBe("confirm");
  });

  it("shows 'form' when registry is null and user has confirmed", () => {
    expect(resolveJoinScreen(validToken, null, true)).toBe("form");
  });

  it("shows 'form' when registry has no weddings and user has confirmed", () => {
    const registry: Registry = { weddings: [], activeWeddingId: "" };
    expect(resolveJoinScreen(validToken, registry, true)).toBe("form");
  });

  it("'already_joined' takes priority over 'confirm'", () => {
    const registry: Registry = {
      weddings: [{ id: "1", spaceId: "sp-abc123" }, { id: "2", spaceId: "sp-other" }],
      activeWeddingId: "1",
    };
    expect(resolveJoinScreen(validToken, registry, false)).toBe("already_joined");
  });
});
