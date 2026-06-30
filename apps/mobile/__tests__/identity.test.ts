/**
 * Tests for lib/identity.ts — passphrase generation, space invite URL parsing,
 * and wedding page URL building.
 *
 * v3: `buildInviteUrl` / `parseInviteUrl` / `decodeInviteToken` removed.
 * Use `parseSpaceInviteUrl` + `encodeSpaceInviteLink` from @fiance/sdk for
 * invite link round-trip tests.
 */
import { describe, it, expect, vi } from "vitest";

vi.mock("expo-linking", () => ({
  createURL: (path: string) => {
    const p = path ? `/${path}` : "";
    return `fiance:/${p}`;
  },
}));

import {
  generatePassphrase,
  buildWeddingPageUrl,
  parseSpaceInviteUrl,
} from "@/lib/identity";
import { encodeSpaceInviteLink, type SpaceInviteLinkToken } from "@fiance/sdk";

function makeTestToken(spaceId = "sp-test", spaceName = "Alice & Bob"): SpaceInviteLinkToken {
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

describe("generatePassphrase", () => {
  it("generates a 12-word passphrase separated by spaces", () => {
    const phrase = generatePassphrase();
    const words = phrase.split(" ");
    expect(words).toHaveLength(12);
    words.forEach((w) => expect(w.length).toBeGreaterThan(0));
  });

  it("produces different passphrases on repeated calls", () => {
    const a = generatePassphrase();
    const b = generatePassphrase();
    expect(a).not.toBe(b);
  });
});

describe("parseSpaceInviteUrl", () => {
  it("returns null for URL with no fragment", () => {
    expect(parseSpaceInviteUrl("https://fiance.drakkar.software/join")).toBeNull();
  });

  it("returns null for garbage fragment", () => {
    expect(parseSpaceInviteUrl("https://fiance.drakkar.software/join#!!!garbage")).toBeNull();
  });

  it("round-trips spaceId and spaceName via encodeSpaceInviteLink", () => {
    const token = makeTestToken("sp-abc", "Éloïse & François");
    const link = encodeSpaceInviteLink("https://fiance.drakkar.software", token);
    const result = parseSpaceInviteUrl(link);
    expect(result?.spaceId).toBe("sp-abc");
    expect(result?.spaceName).toBe("Éloïse & François");
    expect(result?.write).toBe(true);
  });

  it("tolerates polluted fragment (share target appended extra text)", () => {
    const token = makeTestToken();
    const link = encodeSpaceInviteLink("https://fiance.drakkar.software", token);
    const polluted = `${link}%20extra%20text%20${link}`;
    const result = parseSpaceInviteUrl(polluted);
    expect(result?.spaceId).toBe(token.spaceId);
  });

  it("returns null for a legacy seed-phrase invite token (old { n, p } format)", () => {
    const legacy = btoa(JSON.stringify({ n: "Alice", p: "word1 word2" }))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    expect(parseSpaceInviteUrl(`https://fiance.drakkar.software/join#${legacy}`)).toBeNull();
  });
});

describe("buildWeddingPageUrl", () => {
  it("creates URL with userId in path", () => {
    const url = buildWeddingPageUrl("abc123");
    expect(url).toContain("wedding/abc123");
  });
});
