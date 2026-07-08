/**
 * Tests for lib/space-resync.ts — needsNamespaceResync / resyncWeddingToCurrentNamespace
 *
 * Regression coverage for a review-flagged bug: resyncWeddingToCurrentNamespace
 * used to leave stale dirty-push baselines (keyed by weddingNodeId, unchanged
 * across a resync) and a stale in-flight activation in place, either of which
 * could make the resync silently push nothing into the freshly provisioned
 * space while still reporting success.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockGetSyncNamespace = vi.fn<() => string>(() => "dk");
vi.mock("@fiance/sdk", () => ({
  getSyncNamespace: () => mockGetSyncNamespace(),
  DEFAULT_SYNC_NAMESPACE: "dk",
}));

const mockActivateSync = vi.fn();
const mockClearActivation = vi.fn();
vi.mock("@/lib/providers", () => ({
  activateSync: (...args: unknown[]) => mockActivateSync(...args),
  clearActivation: (...args: unknown[]) => mockClearActivation(...args),
}));

const mockTeardownSync = vi.fn();
const mockGetActiveSession = vi.fn(() => ({ session: true }));
const mockGetActiveSpaceId = vi.fn(() => "sp-new");
const mockGetActiveWeddingNodeId = vi.fn(() => "w1");
vi.mock("@/lib/starfish", () => ({
  teardownSync: (...args: unknown[]) => mockTeardownSync(...args),
  getActiveSession: () => mockGetActiveSession(),
  getActiveSpaceId: () => mockGetActiveSpaceId(),
  getActiveWeddingNodeId: () => mockGetActiveWeddingNodeId(),
}));

const mockPushSpaceSnapshot = vi.fn().mockResolvedValue(undefined);
const mockResetDirtyPushBaseline = vi.fn();
vi.mock("@/lib/space-sync", () => ({
  pushSpaceSnapshot: (...args: unknown[]) => mockPushSpaceSnapshot(...args),
  resetDirtyPushBaseline: (...args: unknown[]) => mockResetDirtyPushBaseline(...args),
}));

const mockKvRemove = vi.fn().mockResolvedValue(undefined);
vi.mock("@drakkar.software/dk-spaces-platform-sdk", () => ({
  kvRemove: (...args: unknown[]) => mockKvRemove(...args),
}));

// ── Subject ───────────────────────────────────────────────────────────────────

import { needsNamespaceResync, resyncWeddingToCurrentNamespace } from "@/lib/space-resync";
import type { WeddingRegistryEntry } from "@/lib/wedding-registry";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const ownerWedding: WeddingRegistryEntry = {
  id: "w1",
  label: "Notre mariage",
  dbFileName: "w1.db",
  spaceId: "sp-old",
  syncNamespace: "fiance",
  role: "owner",
} as unknown as WeddingRegistryEntry;

beforeEach(() => {
  vi.clearAllMocks();
  mockGetSyncNamespace.mockReturnValue("dk");
  mockGetActiveSession.mockReturnValue({ session: true } as never);
  mockGetActiveSpaceId.mockReturnValue("sp-new");
  mockGetActiveWeddingNodeId.mockReturnValue("w1");
  mockPushSpaceSnapshot.mockResolvedValue(undefined);
  mockKvRemove.mockResolvedValue(undefined);
});

describe("needsNamespaceResync", () => {
  it("is false with no spaceId", () => {
    expect(needsNamespaceResync({ ...ownerWedding, spaceId: undefined })).toBe(false);
  });

  it("is false for member entries", () => {
    expect(needsNamespaceResync({ ...ownerWedding, role: "member" })).toBe(false);
  });

  it("is true when syncNamespace differs from the current namespace", () => {
    expect(needsNamespaceResync(ownerWedding)).toBe(true);
  });

  it("is false when syncNamespace already matches", () => {
    expect(needsNamespaceResync({ ...ownerWedding, syncNamespace: "dk" })).toBe(false);
  });
});

describe("resyncWeddingToCurrentNamespace", () => {
  it("throws for member entries without touching sync state", async () => {
    await expect(
      resyncWeddingToCurrentNamespace({ ...ownerWedding, role: "member" }),
    ).rejects.toThrow(/owner/i);

    expect(mockTeardownSync).not.toHaveBeenCalled();
    expect(mockActivateSync).not.toHaveBeenCalled();
  });

  it("tears down, clears in-flight activation, and resets dirty-push baselines before re-provisioning", async () => {
    mockActivateSync.mockResolvedValue({ userId: "user-abc" });

    await resyncWeddingToCurrentNamespace(ownerWedding);

    expect(mockTeardownSync).toHaveBeenCalledOnce();
    expect(mockClearActivation).toHaveBeenCalledWith("w1");
    expect(mockResetDirtyPushBaseline).toHaveBeenCalledOnce();

    // teardown + clearActivation + resetDirtyPushBaseline must all happen
    // BEFORE activateSync is called, so a still-in-flight stale activation
    // or a stale baseline can never survive into the fresh provisioning.
    const teardownOrder = mockTeardownSync.mock.invocationCallOrder[0];
    const clearOrder = mockClearActivation.mock.invocationCallOrder[0];
    const resetOrder = mockResetDirtyPushBaseline.mock.invocationCallOrder[0];
    const activateOrder = mockActivateSync.mock.invocationCallOrder[0];
    expect(teardownOrder).toBeLessThan(activateOrder);
    expect(clearOrder).toBeLessThan(activateOrder);
    expect(resetOrder).toBeLessThan(activateOrder);
  });

  it("passes a cleared (spaceId/weddingNodeId/syncNamespace undefined) entry to activateSync", async () => {
    mockActivateSync.mockResolvedValue({ userId: "user-abc" });

    await resyncWeddingToCurrentNamespace(ownerWedding);

    expect(mockActivateSync).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "w1",
        spaceId: undefined,
        weddingNodeId: undefined,
        syncNamespace: undefined,
      }),
    );
  });

  it("pushes a fresh snapshot into the newly activated space on success", async () => {
    mockActivateSync.mockResolvedValue({ userId: "user-abc" });

    await resyncWeddingToCurrentNamespace(ownerWedding);

    expect(mockPushSpaceSnapshot).toHaveBeenCalledWith({ session: true }, "sp-new", "w1");
  });

  it("purges the legacy spaceaccess KV credential for the activated user on success", async () => {
    mockActivateSync.mockResolvedValue({ userId: "user-abc" });

    await resyncWeddingToCurrentNamespace(ownerWedding);

    expect(mockKvRemove).toHaveBeenCalledWith("starfish.spaceaccess.user-abc");
  });

  it("throws and does not push or purge KV when activateSync fails", async () => {
    mockActivateSync.mockResolvedValue(null);

    await expect(resyncWeddingToCurrentNamespace(ownerWedding)).rejects.toThrow(/re-provision/i);

    expect(mockPushSpaceSnapshot).not.toHaveBeenCalled();
    expect(mockKvRemove).not.toHaveBeenCalled();
  });

  it("does not fail the resync if the legacy KV purge itself fails", async () => {
    mockActivateSync.mockResolvedValue({ userId: "user-abc" });
    mockKvRemove.mockRejectedValue(new Error("kv unavailable"));

    await expect(resyncWeddingToCurrentNamespace(ownerWedding)).resolves.toBeUndefined();
    expect(mockPushSpaceSnapshot).toHaveBeenCalledOnce();
  });
});
