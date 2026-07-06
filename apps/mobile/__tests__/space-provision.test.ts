/**
 * Tests for lib/space-provision.ts — ensureSpaceProvisioned
 *
 * The critical sequence:
 *   1. writeSpaceAccess (fiance _access) — TOFU bootstrap write, must be FIRST
 *   2. seedSpaceObjectIndex (fiance content) — only runs after _access exists
 *   3. ownerEnsureSpaceKeyring (fiance _keyring) — idem
 *   4. readSpaces / writeSpaces (_spaces list) — best-effort (try/catch)
 *   5. updateWedding store action — persist spaceId to KV + live Zustand registry
 *
 * Ordering matters for the server's allowTofu design: the fiance enricher
 * gets allowTofu:true so step 1 can succeed with no prior _access doc. Steps 2-4
 * use owner-match because _access already exists after step 1.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockWriteSpaceAccess = vi.fn().mockResolvedValue(undefined);
const mockSeedSpaceObjectIndex = vi.fn().mockResolvedValue(undefined);
const mockOwnerEnsureSpaceKeyring = vi.fn().mockResolvedValue(undefined);
const mockReadSpaces = vi.fn().mockResolvedValue({ spaces: [] });
const mockWriteSpaces = vi.fn().mockResolvedValue(undefined);
const mockBuildSpace = vi.fn((spaceId: string, name: string) => ({ id: spaceId, name }));

vi.mock("@fiance/sdk", () => ({
  writeSpaceAccess: (...args: unknown[]) => mockWriteSpaceAccess(...args),
  seedSpaceObjectIndex: (...args: unknown[]) => mockSeedSpaceObjectIndex(...args),
  ownerEnsureSpaceKeyring: (...args: unknown[]) => mockOwnerEnsureSpaceKeyring(...args),
  readSpaces: (...args: unknown[]) => mockReadSpaces(...args),
  writeSpaces: (...args: unknown[]) => mockWriteSpaces(...args),
  buildSpace: (spaceId: string, name: string) => mockBuildSpace(spaceId, name),
  getSyncNamespace: () => "dk",
}));

// space-provision now calls the Zustand store action (not updateWeddingEntry directly)
// so we can update the in-memory registry alongside KV persistence.
const mockUpdateWedding = vi.fn().mockResolvedValue(undefined);

vi.mock("@/store/useWeddingRegistryStore", () => ({
  useWeddingRegistryStore: {
    getState: () => ({ updateWedding: mockUpdateWedding }),
  },
}));

vi.mock("expo-crypto", () => ({
  randomUUID: () => "12345678-1234-1234-1234-123456789abc",
}));

// ── Subject ───────────────────────────────────────────────────────────────────

import { ensureSpaceProvisioned } from "@/lib/space-provision";
import type { WeddingRegistryEntry } from "@/lib/wedding-registry";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const session = {
  userId: "user-abc",
  spaceIdPrefix: "sp-",
  spacesRegistryClient: {},
  spacesKeyringClient: {},
  contentClient: {},
  layout: {},
} as unknown as Parameters<typeof ensureSpaceProvisioned>[0];

const freshWedding: WeddingRegistryEntry = {
  id: "w1",
  label: "Notre mariage",
  dbFileName: "w1.db",
  spaceId: undefined,
  seedPhrase: "word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12",
  serverUrl: "https://sync.example.com",
  syncDisabled: false,
  createdAt: "2026-06-28T00:00:00Z",
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("ensureSpaceProvisioned", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReadSpaces.mockResolvedValue({ spaces: [] });
    mockUpdateWedding.mockResolvedValue(undefined);
  });

  it("fast-paths when spaceId already set", async () => {
    const wedding = { ...freshWedding, spaceId: "sp-existing" };
    const result = await ensureSpaceProvisioned(session, wedding);
    expect(result).toBe("sp-existing");
    expect(mockWriteSpaceAccess).not.toHaveBeenCalled();
  });

  it("provisions a fresh space with all 5 steps in order", async () => {
    const callOrder: string[] = [];
    mockWriteSpaceAccess.mockImplementation(async () => { callOrder.push("writeSpaceAccess"); });
    mockSeedSpaceObjectIndex.mockImplementation(async () => { callOrder.push("seedSpaceObjectIndex"); });
    mockOwnerEnsureSpaceKeyring.mockImplementation(async () => { callOrder.push("ownerEnsureSpaceKeyring"); });
    mockReadSpaces.mockImplementation(async () => { callOrder.push("readSpaces"); return { spaces: [] }; });
    mockWriteSpaces.mockImplementation(async () => { callOrder.push("writeSpaces"); });
    mockUpdateWedding.mockImplementation(async () => { callOrder.push("updateWedding"); });

    await ensureSpaceProvisioned(session, freshWedding);

    expect(callOrder).toEqual([
      "writeSpaceAccess",
      "seedSpaceObjectIndex",
      "ownerEnsureSpaceKeyring",
      "readSpaces",
      "writeSpaces",
      "updateWedding",
    ]);
  });

  it("calls writeSpaceAccess with correct args for TOFU bootstrap", async () => {
    await ensureSpaceProvisioned(session, freshWedding);

    expect(mockWriteSpaceAccess).toHaveBeenCalledOnce();
    const [client, spaceId, ownerId, members, , , opts] = mockWriteSpaceAccess.mock.calls[0];
    expect(client).toBe(session.spacesRegistryClient);
    expect(spaceId).toMatch(/^sp-/);          // prefixed spaceId
    expect(ownerId).toBe("user-abc");
    expect(members).toEqual([]);
    expect(opts).toMatchObject({ name: "Notre mariage" });
  });

  it("persists spaceId on the registry entry via the store action", async () => {
    const result = await ensureSpaceProvisioned(session, freshWedding);

    expect(mockUpdateWedding).toHaveBeenCalledOnce();
    const [id, patch] = mockUpdateWedding.mock.calls[0];
    expect(id).toBe("w1");
    expect(patch).toMatchObject({ spaceId: result });
  });

  it("appends the new space to the existing spaces list", async () => {
    const existing = [{ id: "sp-old", name: "Old" }];
    mockReadSpaces.mockResolvedValue({ spaces: existing });

    await ensureSpaceProvisioned(session, freshWedding);

    const [, , writtenSpaces] = mockWriteSpaces.mock.calls[0];
    expect(writtenSpaces).toHaveLength(2);
    expect(writtenSpaces[0]).toEqual(existing[0]);
  });

  it("continues to step 5 even if writeSpaces (step 4) throws (best-effort)", async () => {
    mockWriteSpaces.mockRejectedValue(new Error("409 hash_mismatch"));

    // Must not throw — the try/catch makes _spaces registration non-fatal.
    await expect(ensureSpaceProvisioned(session, freshWedding)).resolves.toMatch(/^sp-/);
    // Step 5 must still run despite step 4 failing.
    expect(mockUpdateWedding).toHaveBeenCalledOnce();
  });
});
