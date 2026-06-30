/**
 * Regression tests for apps/mobile/lib/wedding-registry.web.ts
 *
 * The web stub is NOT exercised by the normal test run — Metro picks .web.ts
 * only at bundle time; Vitest uses the plain .ts. This file imports the .web.ts
 * module directly so regressions in the platform-specific file are caught by CI.
 *
 * Key regression (2026-06): the web stub's createWeddingEntry dropped the
 * `spaceId` and `role` arguments — every joiner on web got
 * { spaceId: undefined, role: undefined } — so ensureSpaceProvisioned minted a
 * brand-new owner space instead of fast-pathing to the invited one.
 */
import { describe, it, expect, vi } from "vitest";

// ── Minimal mocks needed to import the module ──────────────────────────────────
// The web stub touches secure-store, kv-storage, server, and expo-crypto.
// We mock them to prevent real I/O; we test only the returned entry values
// (the regression was in the object construction, not in storage persistence).

vi.mock("@/lib/secure-store", () => ({
  secureGet: vi.fn(async () => null),
  secureSet: vi.fn(async () => {}),
}));
vi.mock("@/lib/kv-storage", () => ({ purgeStorage: vi.fn() }));
vi.mock("@/lib/server", () => ({ resolveServerUrl: (u?: string) => u ?? "https://sync.example.com" }));

let uuidSeq = 0;
vi.mock("expo-crypto", () => ({
  randomUUID: vi.fn(() => `test-uuid-${uuidSeq++}`),
}));

// ── Subject ────────────────────────────────────────────────────────────────────

import { createWeddingEntry, updateWeddingEntry } from "@/lib/wedding-registry.web";

// ── createWeddingEntry — field contract ───────────────────────────────────────

describe("createWeddingEntry (web) — returned entry fields", () => {
  it("includes spaceId when passed as 4th argument", async () => {
    const entry = await createWeddingEntry("Mon mariage", "seed", undefined, "sp-abc123");
    expect(entry.spaceId).toBe("sp-abc123");
  });

  it("includes role when passed as 5th argument", async () => {
    const entry = await createWeddingEntry("Mon mariage", "seed", undefined, "sp-abc123", "member");
    expect(entry.role).toBe("member");
  });

  it("accepts role:'owner'", async () => {
    const entry = await createWeddingEntry("Mon mariage", "seed", undefined, "sp-xyz", "owner");
    expect(entry.role).toBe("owner");
  });

  it("leaves spaceId and role undefined when not passed (normal owner create)", async () => {
    const entry = await createWeddingEntry("Mon mariage", "seed");
    expect(entry.spaceId).toBeUndefined();
    expect(entry.role).toBeUndefined();
  });

  it("includes all base fields regardless of spaceId/role", async () => {
    const entry = await createWeddingEntry("Alice & Bob", "myseed", "https://sync.test", "sp-1", "member");
    expect(entry.id).toBeDefined();
    expect(entry.label).toBe("Alice & Bob");
    expect(entry.seedPhrase).toBe("myseed");
    expect(entry.serverUrl).toBe("https://sync.test");
    expect(entry.dbFileName).toMatch(/^wedding_/);
    expect(entry.createdAt).toBeDefined();
  });
});

// ── updateWeddingEntry — Pick type allows spaceId and role ─────────────────────

describe("updateWeddingEntry (web) — accepted fields", () => {
  it("accepts spaceId in updates (TypeScript type allows it)", async () => {
    // If the Pick<> type omitted spaceId (old bug), this would be a type error.
    // At runtime we just verify it doesn't throw.
    await expect(
      updateWeddingEntry("any-id", { spaceId: "sp-new" })
    ).resolves.toBeUndefined();
  });

  it("accepts role in updates", async () => {
    await expect(
      updateWeddingEntry("any-id", { role: "member" })
    ).resolves.toBeUndefined();
  });
});

// ── Regression: join-via-invite-link persists token.spaceId + role:'member' ───

describe("regression: join mints a new space instead of joining the invited one", () => {
  /**
   * Root cause: `createWeddingEntry` in the web stub dropped args 4 and 5.
   * joinWeddingByToken calls:
   *   store.createWedding(token.spaceName, seed, serverUrl, token.spaceId, "member")
   * which forwards to createWeddingEntry. Before the fix, the web entry had:
   *   { spaceId: undefined, role: undefined }
   * → ensureSpaceProvisioned's fast-path (space-provision.ts:42) was defeated
   * → member guard (space-provision.ts:45) was skipped (role was undefined)
   * → minted a brand-new owner space at space-provision.ts:51
   * → joiner landed in a different space than the owner
   */
  it("entry has token.spaceId — ensureSpaceProvisioned fast-path is satisfied", async () => {
    const TOKEN_SPACE_ID = "sp-44a5585a2027466d80f5c8beecc305e8";
    const entry = await createWeddingEntry(
      "Alice & Bob",
      "word1 word2 word3 word4 word5 word6",
      "https://sync.drakkar.software",
      TOKEN_SPACE_ID,
      "member",
    );
    // space-provision.ts:42: if (wedding.spaceId) return wedding.spaceId;
    // This was undefined before the fix → fell through to mint a new sp- id.
    expect(entry.spaceId).toBe(TOKEN_SPACE_ID);
  });

  it("entry has role:'member' — ensureSpaceProvisioned member guard fires if spaceId is lost", async () => {
    const entry = await createWeddingEntry(
      "Alice & Bob", "seed", "https://sync.drakkar.software", "sp-xyz", "member",
    );
    // space-provision.ts:45: if (wedding.role === "member") throw — safety net.
    // This was undefined before the fix → guard was skipped, minting continued.
    expect(entry.role).toBe("member");
  });

  it("neither spaceId nor role is silently dropped when both are provided", async () => {
    const entry = await createWeddingEntry("Test", "seed", undefined, "sp-real", "member");
    expect(entry.spaceId).toBe("sp-real");
    expect(entry.role).toBe("member");
  });
});
