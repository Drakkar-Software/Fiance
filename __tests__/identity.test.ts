/**
 * Tests for lib/identity.ts — URL-safe base64 encoding, invite token
 * encode/decode, passphrase generation, and wedding page URL building.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock expo-crypto
vi.mock("expo-crypto", () => ({
  getRandomValues: (arr: Uint8Array) => {
    for (let i = 0; i < arr.length; i++) arr[i] = i;
    return arr;
  },
  digestStringAsync: vi.fn(async (_algo: string, data: string) => {
    // Deterministic fake hash for testing
    let hash = 0;
    for (let i = 0; i < data.length; i++) hash = ((hash << 5) - hash + data.charCodeAt(i)) | 0;
    return Math.abs(hash).toString(16).padStart(64, "0");
  }),
  CryptoDigestAlgorithm: { SHA256: "SHA-256" },
}));

// Mock expo-linking
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

let identity: typeof import("@/lib/identity");

beforeEach(async () => {
  identity = await import("@/lib/identity");
});

describe("generatePassphrase", () => {
  it("generates a 12-word passphrase separated by hyphens", () => {
    const phrase = identity.generatePassphrase();
    const words = phrase.split("-");
    expect(words).toHaveLength(12);
    words.forEach((w) => expect(w.length).toBeGreaterThan(0));
  });

  it("uses deterministic bytes in tests (mocked)", () => {
    const phrase = identity.generatePassphrase();
    // Bytes 0..11 map to WORDLIST[0]..WORDLIST[11]
    expect(phrase.startsWith("apple-")).toBe(true);
  });
});

describe("deriveAuthToken", () => {
  it("returns a hex string", async () => {
    const token = await identity.deriveAuthToken("test-password");
    expect(token).toMatch(/^[0-9a-f]+$/);
  });

  it("trims whitespace from password", async () => {
    const a = await identity.deriveAuthToken("  hello  ");
    const b = await identity.deriveAuthToken("hello");
    expect(a).toBe(b);
  });

  it("different passwords produce different tokens", async () => {
    const a = await identity.deriveAuthToken("password-a");
    const b = await identity.deriveAuthToken("password-b");
    expect(a).not.toBe(b);
  });
});

describe("deriveEncryptionKey", () => {
  it("includes salt in derivation", async () => {
    const a = await identity.deriveEncryptionKey("pass", "salt1");
    const b = await identity.deriveEncryptionKey("pass", "salt2");
    expect(a).not.toBe(b);
  });
});

describe("buildInviteUrl / decodeInviteToken", () => {
  it("round-trips name and password through token", () => {
    const url = identity.buildInviteUrl("Alice & Bob", "super-secret-phrase");
    // Extract token from URL
    const match = url.match(/t=([^&]+)/);
    expect(match).not.toBeNull();
    const token = match![1];

    const decoded = identity.decodeInviteToken(token);
    expect(decoded).toEqual({
      name: "Alice & Bob",
      password: "super-secret-phrase",
    });
  });

  it("returns null for undefined token", () => {
    expect(identity.decodeInviteToken(undefined)).toBeNull();
  });

  it("returns null for empty string token", () => {
    expect(identity.decodeInviteToken("")).toBeNull();
  });

  it("returns null for malformed token", () => {
    expect(identity.decodeInviteToken("not-valid-base64!!!")).toBeNull();
  });

  it("handles special characters in name", () => {
    const url = identity.buildInviteUrl("Éloïse & François", "pass");
    const token = url.match(/t=([^&]+)/)![1];
    const decoded = identity.decodeInviteToken(token);
    expect(decoded?.name).toBe("Éloïse & François");
  });
});

describe("buildWeddingPageUrl", () => {
  it("creates URL with userId in path", () => {
    const url = identity.buildWeddingPageUrl("abc123");
    expect(url).toContain("wedding/abc123");
  });
});
