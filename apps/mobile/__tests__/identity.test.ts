/**
 * Tests for lib/identity.ts — invite token encode/decode, passphrase generation,
 * and wedding page URL building.
 *
 * v3 migration notes:
 * - generatePassphrase() now returns space-separated BIP-39 words (not hyphens).
 * - deriveAuthToken() / deriveEncryptionKey() are deprecated stubs returning "".
 * - buildInviteUrl() now encodes payload in URL fragment (#) via encodeLinkFragment.
 * - Use parseInviteUrl() for full round-trip tests.
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
  deriveAuthToken,
  deriveEncryptionKey,
  buildInviteUrl,
  buildWeddingPageUrl,
  decodeInviteToken,
  parseInviteUrl,
} from "@/lib/identity";

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

describe("deriveAuthToken (deprecated stub)", () => {
  it("returns empty string (deprecated — Bearer auth removed in v3)", async () => {
    const token = await deriveAuthToken("test-password");
    expect(token).toBe("");
  });

  it("always returns the same empty string regardless of input", async () => {
    const a = await deriveAuthToken("password-a");
    const b = await deriveAuthToken("password-b");
    expect(a).toBe(b);
    expect(a).toBe("");
  });
});

describe("deriveEncryptionKey (deprecated stub)", () => {
  it("returns empty string (deprecated — space keyring handles E2EE in v3)", async () => {
    const key = await deriveEncryptionKey("pass", "salt");
    expect(key).toBe("");
  });
});

describe("buildInviteUrl / decodeInviteToken / parseInviteUrl", () => {
  it("round-trips name and password via parseInviteUrl", () => {
    const url = buildInviteUrl("Alice & Bob", "super-secret-phrase");
    const decoded = parseInviteUrl(url);
    expect(decoded).toEqual({
      name: "Alice & Bob",
      password: "super-secret-phrase",
    });
  });

  it("round-trips through fragment decodeInviteToken", () => {
    const url = buildInviteUrl("Test Name", "some-pass");
    // Fragment is everything after '#'
    const fragment = url.includes("#") ? url.split("#")[1] : "";
    expect(fragment).not.toBe("");
    const decoded = decodeInviteToken(fragment);
    expect(decoded?.name).toBe("Test Name");
    expect(decoded?.password).toBe("some-pass");
  });

  it("returns null for undefined token", () => {
    expect(decodeInviteToken(undefined)).toBeNull();
  });

  it("returns null for empty string token", () => {
    expect(decodeInviteToken("")).toBeNull();
  });

  it("returns null for malformed token", () => {
    expect(decodeInviteToken("not-valid-base64!!!")).toBeNull();
  });

  it("handles special characters in name", () => {
    const url = buildInviteUrl("Éloïse & François", "pass");
    const decoded = parseInviteUrl(url);
    expect(decoded?.name).toBe("Éloïse & François");
  });
});

describe("buildWeddingPageUrl", () => {
  it("creates URL with userId in path", () => {
    const url = buildWeddingPageUrl("abc123");
    expect(url).toContain("wedding/abc123");
  });
});
