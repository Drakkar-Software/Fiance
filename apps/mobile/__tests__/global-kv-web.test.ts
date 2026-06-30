/**
 * Regression tests for apps/mobile/lib/global-kv.web.ts
 *
 * The web file is NOT exercised by the normal test run — Metro picks .web.ts
 * only at bundle time; Vitest resolves the plain .ts. This file imports the
 * .web.ts module directly so regressions in the platform-specific file are
 * caught by CI (same pattern as wedding-registry-web.test.ts).
 *
 * Key regression (2026-06): the SDK's KvAdapter was backed by the per-wedding-
 * prefixed/gated web adapter (kv-storage.web.ts). At join time there is no
 * active wedding → getStorage() returns null → writes dropped silently →
 * credential memory-only → lost on reload → "neither sees the other".
 *
 * Fix: global-kv.web.ts uses raw localStorage — no prefix, no gate.
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

import { makeGlobalKvAdapter } from "@/lib/global-kv.web";

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("makeGlobalKvAdapter (web) — basic read/write/remove", () => {
  it("setItem writes to localStorage and getItem reads it back", async () => {
    const kv = makeGlobalKvAdapter();
    await kv.setItem("starfish.spaceaccess.abc123", '{"foo":"bar"}');
    expect(localStorageStore.get("starfish.spaceaccess.abc123")).toBe('{"foo":"bar"}');
    const value = await kv.getItem("starfish.spaceaccess.abc123");
    expect(value).toBe('{"foo":"bar"}');
  });

  it("getItem returns null for missing keys", async () => {
    const kv = makeGlobalKvAdapter();
    expect(await kv.getItem("nonexistent")).toBeNull();
  });

  it("removeItem deletes from localStorage", async () => {
    const kv = makeGlobalKvAdapter();
    await kv.setItem("to-remove", "value");
    await kv.removeItem("to-remove");
    expect(await kv.getItem("to-remove")).toBeNull();
  });
});

describe("makeGlobalKvAdapter (web) — no active-wedding gate", () => {
  it("works without any initStorage / active wedding — never short-circuits", async () => {
    // The old makeKvAdapter checked getStorage() and returned early when
    // webInitialized was false (no active wedding). The global adapter must
    // NOT gate on anything — this is the regression check.
    const kv = makeGlobalKvAdapter();
    // Write with no wedding initialised (globalThis has no 'initStorage' gate here).
    await kv.setItem("starfish.spaceaccess.joiner001", "credential-payload");
    // Must be persisted — no silent drop.
    expect(localStorageStore.size).toBe(1);
    expect(await kv.getItem("starfish.spaceaccess.joiner001")).toBe("credential-payload");
  });
});

describe("makeGlobalKvAdapter (web) — no per-wedding prefix", () => {
  it("key is stored exactly as passed — no activePrefix prepended", async () => {
    const kv = makeGlobalKvAdapter();
    const KEY = "starfish.spaceaccess.userId-deadbeef";
    await kv.setItem(KEY, "data");
    // Must be in localStorage under the EXACT key, not under "wedding_xyz.db::KEY"
    expect(localStorageStore.has(KEY)).toBe(true);
    // Must NOT be under any prefixed variant
    for (const k of localStorageStore.keys()) {
      expect(k).toBe(KEY);
    }
  });

  it("credential is still readable even when a per-wedding prefix would differ", async () => {
    const kv = makeGlobalKvAdapter();
    const CRED_KEY = "starfish.spaceaccess.userId-abc";

    // Simulate: join flow writes credential
    await kv.setItem(CRED_KEY, "my-credential");

    // Simulate: wedding ID changes (different activePrefix would apply on old adapter)
    // On the old adapter, new prefix = "wedding_new123.db::" and read would fail.
    // The global adapter is unaffected — same key, same result.
    const value = await kv.getItem(CRED_KEY);
    expect(value).toBe("my-credential");
  });
});

describe("makeGlobalKvAdapter (web) — error resilience", () => {
  it("getItem returns null when localStorage.getItem throws", async () => {
    mockLocalStorage.getItem.mockImplementationOnce(() => { throw new Error("SecurityError"); });
    const kv = makeGlobalKvAdapter();
    expect(await kv.getItem("any-key")).toBeNull();
  });

  it("removeItem does not throw when localStorage.removeItem throws", async () => {
    mockLocalStorage.removeItem.mockImplementationOnce(() => { throw new Error("SecurityError"); });
    const kv = makeGlobalKvAdapter();
    await expect(kv.removeItem("any-key")).resolves.toBeUndefined();
  });
});
