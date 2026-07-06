/**
 * Regression tests for @drakkar.software/dk-spaces-platform-sdk's web
 * kvGet/kvSet/kvRemove (replaces the app's own global-kv.web.ts, which
 * implemented the identical flat-localStorage contract this test originally
 * guarded).
 *
 * Key regression (2026-06): the SDK's KvAdapter was backed by the per-wedding-
 * prefixed/gated web adapter (kv-storage.web.ts). At join time there is no
 * active wedding → getStorage() returns null → writes dropped silently →
 * credential memory-only → lost on reload → "neither sees the other".
 *
 * Fix: a flat, unprefixed, never-gated adapter over raw localStorage — now
 * sourced from dk-spaces-platform-sdk instead of the app's own copy.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock localStorage (Vitest runs in Node; no DOM) ───────────────────────────

const localStorageStore = new Map<string, string>();
const mockLocalStorage = {
  getItem: vi.fn((k: string) => localStorageStore.get(k) ?? null),
  setItem: vi.fn((k: string, v: string) => { localStorageStore.set(k, v); }),
  removeItem: vi.fn((k: string) => { localStorageStore.delete(k); }),
};
vi.stubGlobal("localStorage", mockLocalStorage);

beforeEach(() => {
  localStorageStore.clear();
  vi.clearAllMocks();
});

// ── Subject ───────────────────────────────────────────────────────────────────

import { kvGet, kvSet, kvRemove } from "@drakkar.software/dk-spaces-platform-sdk";

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("dk-spaces-platform-sdk kv (web) — basic read/write/remove", () => {
  it("kvSet writes to localStorage and kvGet reads it back", async () => {
    await kvSet("dk.spaceaccess.abc123", '{"foo":"bar"}');
    expect(localStorageStore.get("dk.spaceaccess.abc123")).toBe('{"foo":"bar"}');
    const value = await kvGet("dk.spaceaccess.abc123");
    expect(value).toBe('{"foo":"bar"}');
  });

  it("kvGet returns null for missing keys", async () => {
    expect(await kvGet("nonexistent")).toBeNull();
  });

  it("kvRemove deletes from localStorage", async () => {
    await kvSet("to-remove", "value");
    await kvRemove("to-remove");
    expect(await kvGet("to-remove")).toBeNull();
  });
});

describe("dk-spaces-platform-sdk kv (web) — no active-wedding gate", () => {
  it("works without any initStorage / active wedding — never short-circuits", async () => {
    // The old makeKvAdapter checked getStorage() and returned early when
    // webInitialized was false (no active wedding). The global adapter must
    // NOT gate on anything — this is the regression check.
    await kvSet("dk.spaceaccess.joiner001", "credential-payload");
    // Must be persisted — no silent drop.
    expect(localStorageStore.size).toBe(1);
    expect(await kvGet("dk.spaceaccess.joiner001")).toBe("credential-payload");
  });
});

describe("dk-spaces-platform-sdk kv (web) — no per-wedding prefix", () => {
  it("key is stored exactly as passed — no activePrefix prepended", async () => {
    const KEY = "dk.spaceaccess.userId-deadbeef";
    await kvSet(KEY, "data");
    // Must be in localStorage under the EXACT key, not under "wedding_xyz.db::KEY"
    expect(localStorageStore.has(KEY)).toBe(true);
    // Must NOT be under any prefixed variant
    for (const k of localStorageStore.keys()) {
      expect(k).toBe(KEY);
    }
  });

  it("credential is still readable even when a per-wedding prefix would differ", async () => {
    const CRED_KEY = "dk.spaceaccess.userId-abc";

    // Simulate: join flow writes credential
    await kvSet(CRED_KEY, "my-credential");

    // Simulate: wedding ID changes (different activePrefix would apply on old adapter)
    // On the old adapter, new prefix = "wedding_new123.db::" and read would fail.
    // The global adapter is unaffected — same key, same result.
    const value = await kvGet(CRED_KEY);
    expect(value).toBe("my-credential");
  });
});

describe("dk-spaces-platform-sdk kv (web) — error resilience", () => {
  it("kvGet returns null when localStorage.getItem throws", async () => {
    mockLocalStorage.getItem.mockImplementationOnce(() => { throw new Error("SecurityError"); });
    expect(await kvGet("any-key")).toBeNull();
  });

  it("kvRemove does not throw when localStorage.removeItem throws", async () => {
    mockLocalStorage.removeItem.mockImplementationOnce(() => { throw new Error("SecurityError"); });
    await expect(kvRemove("any-key")).resolves.toBeUndefined();
  });
});
