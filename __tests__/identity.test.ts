/**
 * Tests for lib/identity.ts — invite token encode/decode, passphrase generation,
 * and wedding page URL building.
 */
import { describe, it, expect, vi } from "vitest";

// expo-linking is still needed for buildInviteUrl / buildWeddingPageUrl
vi.mock("expo-linking", () => ({
  createURL: (path: string, opts?: { queryParams?: Record<string, string> }) => {
    const base = `weddingos:///${path}`;
    if (opts?.queryParams) {
      const qs = Object.entries(opts.queryParams).map(([k, v]) => `${k}=${v}`).join("&");
      return `${base}?${qs}`;
    }
    return base;
  },
  parse: (url: string) => {
    const match = url.match(/\?(.+)$/);
    if (!match) return { queryParams: {} };
    const params: Record<string, string> = {};
    match[1].split("&").forEach((pair) => {
      const [k, v] = pair.split("=");
      params[k] = v;
    });
    return { queryParams: params };
  },
}));

import {
  generatePassphrase,
  deriveAuthToken,
  deriveEncryptionKey,
  buildInviteUrl,
  buildWeddingPageUrl,
  decodeInviteToken,
} from "@/lib/identity";

describe("generatePassphrase", () => {
  it("generates a 12-word passphrase separated by hyphens", () => {
    const phrase = generatePassphrase();
    const words = phrase.split("-");
    expect(words).toHaveLength(12);
    words.forEach((w) => expect(w.length).toBeGreaterThan(0));
  });

  it("produces different passphrases on repeated calls", () => {
    const a = generatePassphrase();
    const b = generatePassphrase();
    expect(a).not.toBe(b);
  });
});

describe("deriveAuthToken", () => {
  it("returns a 64-char hex string", async () => {
    const token = await deriveAuthToken("test-password");
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it("trims whitespace from password", async () => {
    const a = await deriveAuthToken("  hello  ");
    const b = await deriveAuthToken("hello");
    expect(a).toBe(b);
  });

  it("different passwords produce different tokens", async () => {
    const a = await deriveAuthToken("password-a");
    const b = await deriveAuthToken("password-b");
    expect(a).not.toBe(b);
  });

  it("is deterministic", async () => {
    const a = await deriveAuthToken("my-passphrase");
    const b = await deriveAuthToken("my-passphrase");
    expect(a).toBe(b);
  });
});

describe("deriveEncryptionKey", () => {
  it("returns a 64-char hex string", async () => {
    const key = await deriveEncryptionKey("pass", "salt");
    expect(key).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic", async () => {
    const a = await deriveEncryptionKey("pass", "userId");
    const b = await deriveEncryptionKey("pass", "userId");
    expect(a).toBe(b);
  });

  it("different passwords produce different keys", async () => {
    const a = await deriveEncryptionKey("pass-a", "userId");
    const b = await deriveEncryptionKey("pass-b", "userId");
    expect(a).not.toBe(b);
  });
});

describe("buildInviteUrl / decodeInviteToken", () => {
  it("round-trips name and password through token", () => {
    const url = buildInviteUrl("Alice & Bob", "super-secret-phrase");
    const match = url.match(/t=([^&]+)/);
    expect(match).not.toBeNull();
    const token = match![1];

    const decoded = decodeInviteToken(token);
    expect(decoded).toEqual({
      name: "Alice & Bob",
      password: "super-secret-phrase",
    });
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
    const token = url.match(/t=([^&]+)/)![1];
    const decoded = decodeInviteToken(token);
    expect(decoded?.name).toBe("Éloïse & François");
  });
});

describe("buildWeddingPageUrl", () => {
  it("creates URL with userId in path", () => {
    const url = buildWeddingPageUrl("abc123");
    expect(url).toContain("wedding/abc123");
  });
});
