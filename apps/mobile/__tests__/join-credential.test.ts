/**
 * Regression tests for the B5 space-invite credential persistence bugs:
 *
 * Bug A: `configureFiance` never called `configureSpaceAccessStore`, so the
 *   space-access store's `_kv` was undefined and `persist()` was a silent no-op.
 *   Credentials survived only in volatile in-memory `_cache2`.
 *
 * Bug B: `joinSpaceByLink` stored the link credential under the store's
 *   current `_activeKey`. On member-boot, `hydrateSpaceAccessStore(newUserId)`
 *   saw an identity change and reset `_cache2 = {}`, wiping the entry before
 *   decryption could use it.
 *
 * Together: a joiner could never decrypt owner data → empty wedding, no sync.
 *
 * These tests exercise the space-access-store primitives directly (exported from
 * @fiance/sdk via @drakkar.software/starfish-spaces) to confirm that:
 *  1. `configureSpaceAccessStore` wires the KV adapter so credentials persist.
 *  2. Calling `hydrateSpaceAccessStore(userId, {}, {})` before
 *     `saveSpaceAccessEntry` pins the active identity, so a subsequent
 *     `hydrateSpaceAccessStore(userId, ...)` re-call does NOT reset the cache
 *     and the credential is written to the correct KV bucket.
 *
 * Each test uses its own isolated KV adapter (no shared state between tests).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  configureSpaceAccessStore,
  hydrateSpaceAccessStore,
  saveSpaceAccessEntry,
  getSpaceAccessEntry,
  clearSpaceAccessStore,
} from "@fiance/sdk";

// ─── KV adapter factory (fresh per test) ─────────────────────────────────────

function makeKv() {
  const store = new Map<string, string>();
  const getItem = vi.fn(async (key: string) => store.get(key) ?? null);
  const setItem = vi.fn(async (key: string, value: string) => { store.set(key, value); });
  const removeItem = vi.fn(async (key: string) => { store.delete(key); });
  return { getItem, setItem, removeItem, store };
}

const SPACE_ID = "sp-testspace001";
// Distinct user IDs per test role — unique enough to avoid cross-test KV bucket collisions.
const OLD_USER  = "a".repeat(32); // previous active wedding user
const NEW_USER  = "b".repeat(32); // joiner's fresh identity

function makeLinkEntry() {
  return {
    kind: "link" as const,
    cap: {},
    key: "e".repeat(64),
    kemPriv: "f".repeat(64),
    kemPub:  "a".repeat(64),
    write: true,
  };
}

// Reset in-memory cache + wire a fresh KV adapter before every test so tests
// cannot share state through the module-global _cache2 / _kv / _activeKey.
let kv: ReturnType<typeof makeKv>;
beforeEach(() => {
  clearSpaceAccessStore();
  kv = makeKv();
  configureSpaceAccessStore({ kvAdapter: kv });
});

// ─── Bug A fix: configureSpaceAccessStore wires KV ───────────────────────────

describe("configureSpaceAccessStore — KV wiring (Bug A fix)", () => {
  it("persists a link credential to KV when adapter is configured", async () => {
    // Pin identity first (Bug B fix), then save entry
    await hydrateSpaceAccessStore(NEW_USER, {}, {});
    saveSpaceAccessEntry(SPACE_ID, makeLinkEntry());

    // KV setItem must have been called
    expect(kv.setItem).toHaveBeenCalled();
    const [kvKey, kvValue] = kv.setItem.mock.calls[0];
    expect(kvKey).toContain(NEW_USER);
    const parsed = JSON.parse(kvValue);
    expect(parsed[SPACE_ID]).toBeDefined();
    expect(parsed[SPACE_ID].kind).toBe("link");
    expect(parsed[SPACE_ID].kemPriv).toBe("f".repeat(64));
  });

  it("entry is immediately readable from in-memory cache after saveSpaceAccessEntry", async () => {
    await hydrateSpaceAccessStore(NEW_USER, {}, {});
    saveSpaceAccessEntry(SPACE_ID, makeLinkEntry());

    const entry = getSpaceAccessEntry(SPACE_ID);
    expect(entry).not.toBeNull();
    expect(entry?.kind).toBe("link");
  });
});

// ─── Bug B fix: wrong KV bucket when identity is not pinned ──────────────────

describe("identity pinning before joinSpaceByLink (Bug B fix)", () => {
  it("WITHOUT pinning: credential is written to wrong KV bucket → lost on identity switch", async () => {
    // Simulate pre-fix state: OLD_USER is active (previous wedding's identity)
    await hydrateSpaceAccessStore(OLD_USER, {}, {});
    // joinSpaceByLink calls saveSpaceAccessEntry with credential — stored under OLD_USER's bucket
    saveSpaceAccessEntry(SPACE_ID, makeLinkEntry());

    // Credential is in KV but under OLD_USER's key
    const oldUserKey = `starfish.spaceaccess.${OLD_USER}`;
    const writtenKey = kv.setItem.mock.calls[0]?.[0];
    expect(writtenKey).toBe(oldUserKey);

    // On member-boot: switch to NEW_USER identity
    await hydrateSpaceAccessStore(NEW_USER, {}, {});
    // NEW_USER's KV bucket is empty → cache reset → entry gone
    expect(getSpaceAccessEntry(SPACE_ID)).toBeNull();
  });

  it("WITH pinning: credential is written to NEW_USER's KV bucket → survives identity switch", async () => {
    // Fix: pin to joiner's identity FIRST
    await hydrateSpaceAccessStore(NEW_USER, {}, {}); // ← the new line in join-space.ts
    // joinSpaceByLink stores credential — now under NEW_USER's bucket
    saveSpaceAccessEntry(SPACE_ID, makeLinkEntry());

    // Credential is in KV under NEW_USER's key
    const newUserKey = `starfish.spaceaccess.${NEW_USER}`;
    const writtenKey = kv.setItem.mock.calls[0]?.[0];
    expect(writtenKey).toBe(newUserKey);

    // On member-boot: same identity → no cache reset; entry survives
    await hydrateSpaceAccessStore(NEW_USER, {}, {});
    const entry = getSpaceAccessEntry(SPACE_ID);
    expect(entry).not.toBeNull();
    expect(entry?.kind).toBe("link");
    expect(entry?.kind === "link" ? entry.kemPriv : undefined).toBe("f".repeat(64));
  });

  it("merges server caps alongside the preserved link entry", async () => {
    await hydrateSpaceAccessStore(NEW_USER, {}, {});
    saveSpaceAccessEntry(SPACE_ID, makeLinkEntry());

    // On re-boot with the same user: server returns caps for another space
    await hydrateSpaceAccessStore(NEW_USER, { "sp-other": '{"sub":"..."}' }, {});

    expect(getSpaceAccessEntry(SPACE_ID)?.kind).toBe("link");   // original link survives
    expect(getSpaceAccessEntry("sp-other")?.kind).toBe("member"); // server cap merged in
  });
});

// ─── Web-prefixed adapter: reproduces the "neither sees the other" bug ────────
//
// The flat-Map KV above never exposes the bug because it has no activePrefix and
// no gate. This suite uses a KV that mimics kv-storage.web.ts: writes are dropped
// when no wedding is active, and keys are prefixed with the active wedding ID when
// one is active. This is the exact behavior that silently lost the credential.

describe("web-prefixed adapter reproduces the bug; flat global adapter fixes it", () => {
  /** Mimics apps/mobile/lib/kv-storage.web.ts behaviour (simplified). */
  function makeWebPrefixedKv(initialActiveWeddingId: string | null = null) {
    const store = new Map<string, string>();
    let activeWeddingId = initialActiveWeddingId;
    const prefix = () => activeWeddingId ? `wedding_${activeWeddingId}.db::` : null;

    return {
      getItem: vi.fn(async (key: string) => {
        const p = prefix();
        if (!p) return null; // no active wedding → gate blocks read
        return store.get(p + key) ?? null;
      }),
      setItem: vi.fn(async (key: string, value: string) => {
        const p = prefix();
        if (!p) return; // no active wedding → gate blocks write (the bug)
        store.set(p + key, value);
      }),
      removeItem: vi.fn(async (key: string) => {
        const p = prefix();
        if (!p) return;
        store.delete(p + key);
      }),
      /** Simulate switching the active wedding (different prefix). */
      setActiveWedding: (id: string | null) => { activeWeddingId = id; },
      store,
    };
  }

  it("BUG: web-prefixed adapter drops write at join time (no active wedding) → credential lost on reload", async () => {
    // At /join there is no active wedding → prefix gate blocks writes
    const webKv = makeWebPrefixedKv(null /* no active wedding */);
    clearSpaceAccessStore();
    configureSpaceAccessStore({ kvAdapter: webKv });

    await hydrateSpaceAccessStore(NEW_USER, {}, {});
    saveSpaceAccessEntry(SPACE_ID, makeLinkEntry());

    // The setItem call was made but the gate dropped it — nothing in the store
    expect(webKv.store.size).toBe(0);

    // Simulate reload: clear in-memory cache, reload from KV (which has nothing)
    clearSpaceAccessStore();
    const webKv2 = makeWebPrefixedKv("some-wedding-id"); // now has active wedding
    configureSpaceAccessStore({ kvAdapter: webKv2 });
    await hydrateSpaceAccessStore(NEW_USER, {}, {});

    // Credential is gone — this is the bug
    expect(getSpaceAccessEntry(SPACE_ID)).toBeNull();
  });

  it("FIX: flat global adapter persists write at join time → credential survives reload", async () => {
    // Flat store simulates global-kv.web.ts: no prefix, no gate
    const globalStore = new Map<string, string>();
    const globalKv = {
      getItem: vi.fn(async (k: string) => globalStore.get(k) ?? null),
      setItem: vi.fn(async (k: string, v: string) => { globalStore.set(k, v); }),
      removeItem: vi.fn(async (k: string) => { globalStore.delete(k); }),
    };

    clearSpaceAccessStore();
    configureSpaceAccessStore({ kvAdapter: globalKv });

    // Join: no active wedding in the app, but global adapter always accepts writes
    await hydrateSpaceAccessStore(NEW_USER, {}, {});
    saveSpaceAccessEntry(SPACE_ID, makeLinkEntry());

    expect(globalStore.size).toBeGreaterThan(0);

    // Simulate reload: clear in-memory cache, same KV data
    clearSpaceAccessStore();
    const globalKv2 = {
      getItem: vi.fn(async (k: string) => globalStore.get(k) ?? null),
      setItem: vi.fn(async (k: string, v: string) => { globalStore.set(k, v); }),
      removeItem: vi.fn(async (k: string) => { globalStore.delete(k); }),
    };
    configureSpaceAccessStore({ kvAdapter: globalKv2 });
    await hydrateSpaceAccessStore(NEW_USER, {}, {});

    // Credential is restored — the fix
    const entry = getSpaceAccessEntry(SPACE_ID);
    expect(entry).not.toBeNull();
    expect(entry?.kind).toBe("link");
    expect(entry?.kind === "link" ? entry.kemPriv : undefined).toBe("f".repeat(64));
  });
});

// ─── KV-backed cold-boot reload ───────────────────────────────────────────────

describe("KV-backed reload across process restarts", () => {
  it("credential written at join time is reloaded on a cold boot (different kv instance)", async () => {
    // === Process 1: join ===
    await hydrateSpaceAccessStore(NEW_USER, {}, {});
    saveSpaceAccessEntry(SPACE_ID, makeLinkEntry());

    // Snapshot what was written to KV
    expect(kv.store.size).toBeGreaterThan(0);
    const persistedStore = new Map(kv.store);

    // === Process 2: cold boot (fresh in-memory state, same KV data) ===
    clearSpaceAccessStore();
    const kv2 = makeKv();
    // Pre-populate kv2 with what process 1 wrote (simulates same persistent KV storage)
    for (const [k, v] of persistedStore) kv2.store.set(k, v);
    configureSpaceAccessStore({ kvAdapter: kv2 });

    // Member-boot: hydrateSpaceAccessStore loads from KV on first-load for this userId
    await hydrateSpaceAccessStore(NEW_USER, {}, {});

    // Credential is restored from KV — no dependency on server read-after-write
    const entry = getSpaceAccessEntry(SPACE_ID);
    expect(entry).not.toBeNull();
    expect(entry?.kind).toBe("link");
    expect(entry?.kind === "link" ? entry.kemPriv : undefined).toBe("f".repeat(64));
  });
});
