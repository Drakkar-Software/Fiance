/**
 * Tests for Starfish E2E encryption — the core data protection mechanism.
 *
 * The wedding collection uses client-side AES-256-GCM encryption. Data is
 * encrypted before push and decrypted after pull; the server stores an opaque
 * { _encrypted: "<base64>" } blob and never sees plaintext.
 *
 * These tests also cover the regression introduced during the Starfish 1.5.0
 * upgrade: notifySync must call store.set() (marks dirty → flush → encrypted
 * push), NOT store.restore() (local-only, never pushes to server).
 */
import { describe, it, expect, vi, beforeAll } from "vitest";
import { configurePlatform } from "@drakkar.software/starfish-protocol";
import {
  StarfishClient,
  SyncManager,
  ENCRYPTED_KEY,
  createEncryptor,
  type PullResult,
} from "@drakkar.software/starfish-client";
import { createStarfishStore } from "@drakkar.software/starfish-client/zustand";

// ─── Platform setup (Node has crypto.subtle but not btoa/atob in all versions)

beforeAll(() => {
  configurePlatform({
    base64: {
      encode: (data: Uint8Array) => Buffer.from(data).toString("base64"),
      decode: (str: string) => new Uint8Array(Buffer.from(str, "base64")),
    },
  });
});

// ─── Helpers ────────────────────────────────────────────────────────────────

const SECRET = "test-encryption-secret";
const SALT = "test-user-id-salt";
const SAMPLE_DOC = { version: 5, timestamp: "2026-01-01T00:00:00Z", wedding: { name: "Test" }, guests: [] };

function makeMockClient(pullResponse: unknown, pushResponse = { hash: "abc", timestamp: 1000 }) {
  return {
    pull: vi.fn().mockResolvedValue(pullResponse),
    push: vi.fn().mockResolvedValue(pushResponse),
  } as unknown as StarfishClient;
}

// `StarfishClient.pull` is overloaded (append-only collections return `T[]`).
// Cast to the plain document-pull signature so mock typings resolve correctly.
type PullFn = (path: string, checkpoint?: number) => Promise<PullResult>;

// ─── Encryptor round-trip ────────────────────────────────────────────────────

describe("createEncryptor", () => {
  it("encrypts data into { _encrypted } wrapper", async () => {
    const enc = createEncryptor(SECRET, SALT);
    const result = await enc.encrypt(SAMPLE_DOC);

    expect(result).toHaveProperty(ENCRYPTED_KEY);
    expect(typeof result[ENCRYPTED_KEY]).toBe("string");
    // Must not contain plaintext
    expect(JSON.stringify(result)).not.toContain("Test");
  });

  it("decrypt reverses encrypt (round-trip)", async () => {
    const enc = createEncryptor(SECRET, SALT);
    const encrypted = await enc.encrypt(SAMPLE_DOC);
    const decrypted = await enc.decrypt(encrypted);

    expect(decrypted).toEqual(SAMPLE_DOC);
  });

  it("different secrets produce different ciphertext", async () => {
    const enc1 = createEncryptor(SECRET, SALT);
    const enc2 = createEncryptor("other-secret", SALT);
    const e1 = await enc1.encrypt(SAMPLE_DOC);
    const e2 = await enc2.encrypt(SAMPLE_DOC);

    expect(e1[ENCRYPTED_KEY]).not.toBe(e2[ENCRYPTED_KEY]);
  });

  it("decrypt with wrong key throws", async () => {
    const enc = createEncryptor(SECRET, SALT);
    const encrypted = await enc.encrypt(SAMPLE_DOC);
    const wrong = createEncryptor("wrong-secret", SALT);

    await expect(wrong.decrypt(encrypted)).rejects.toThrow("Decryption failed");
  });

  it("decrypt throws when data is not encrypted", async () => {
    const enc = createEncryptor(SECRET, SALT);

    await expect(enc.decrypt(SAMPLE_DOC as any)).rejects.toThrow(
      "Expected encrypted data but received unencrypted document"
    );
  });

  it("decrypt throws on empty object (checkpoint edge case)", async () => {
    const enc = createEncryptor(SECRET, SALT);

    await expect(enc.decrypt({} as any)).rejects.toThrow(
      "Expected encrypted data but received unencrypted document"
    );
  });
});

// ─── SyncManager + encryption ────────────────────────────────────────────────

describe("SyncManager with encryption", () => {
  it("push sends encrypted payload to server", async () => {
    const client = makeMockClient(undefined);
    const manager = new SyncManager({
      client,
      pullPath: "/pull/wedding/user1",
      pushPath: "/push/wedding/user1",
      encryptionSecret: SECRET,
      encryptionSalt: SALT,
    });

    // Prime lastHash via a fake pull first
    const enc = createEncryptor(SECRET, SALT);
    const encrypted = await enc.encrypt(SAMPLE_DOC);
    vi.mocked(client.pull as PullFn).mockResolvedValueOnce({ data: encrypted, hash: "h1", timestamp: 100 });
    await manager.pull();

    vi.mocked(client.push).mockResolvedValueOnce({ hash: "h2", timestamp: 200 });
    await manager.push(SAMPLE_DOC);

    const pushCall = vi.mocked(client.push).mock.calls[0];
    const sentData = pushCall[1] as Record<string, unknown>;

    // The server must receive an encrypted blob, not plaintext
    expect(sentData).toHaveProperty(ENCRYPTED_KEY);
    expect(JSON.stringify(sentData)).not.toContain('"version"');
  });

  it("pull decrypts server response before returning", async () => {
    const enc = createEncryptor(SECRET, SALT);
    const encrypted = await enc.encrypt(SAMPLE_DOC);

    const client = makeMockClient({ data: encrypted, hash: "h1", timestamp: 100 });
    const manager = new SyncManager({
      client,
      pullPath: "/pull/wedding/user1",
      pushPath: "/push/wedding/user1",
      encryptionSecret: SECRET,
      encryptionSalt: SALT,
    });

    const result = await manager.pull();

    expect(result.data).toEqual(SAMPLE_DOC);
    expect(manager.getData()).toEqual(SAMPLE_DOC);
  });

  it("pull with checkpoint still decrypts the full document", async () => {
    const enc = createEncryptor(SECRET, SALT);
    const encrypted = await enc.encrypt(SAMPLE_DOC);

    const client = makeMockClient({ data: encrypted, hash: "h1", timestamp: 100 });
    const manager = new SyncManager({
      client,
      pullPath: "/pull/wedding/user1",
      pushPath: "/push/wedding/user1",
      encryptionSecret: SECRET,
      encryptionSalt: SALT,
    });

    // First pull sets lastCheckpoint = 100
    await manager.pull();
    expect(manager.getCheckpoint()).toBe(100);

    // Second pull — client will send ?checkpoint=100; server returns full doc again
    const updatedDoc = { ...SAMPLE_DOC, timestamp: "2026-02-01T00:00:00Z" };
    const encryptedV2 = await enc.encrypt(updatedDoc);
    vi.mocked(client.pull as PullFn).mockResolvedValueOnce({ data: encryptedV2, hash: "h2", timestamp: 200 });

    const result = await manager.pull();
    expect(result.data).toEqual(updatedDoc);
    // Second call must have sent the checkpoint
    expect(vi.mocked(client.pull).mock.calls[1][1]).toBe(100);
  });

  it("pull throws clear error when server returns unencrypted data (encryption mismatch)", async () => {
    // Simulates: server stored plaintext (e.g. encryption field misconfigured)
    const client = makeMockClient({ data: SAMPLE_DOC, hash: "h1", timestamp: 100 });
    const manager = new SyncManager({
      client,
      pullPath: "/pull/wedding/user1",
      pushPath: "/push/wedding/user1",
      encryptionSecret: SECRET,
      encryptionSalt: SALT,
    });

    await expect(manager.pull()).rejects.toThrow(
      "Expected encrypted data but received unencrypted document"
    );
  });
});

// ─── StarfishStore: set() vs restore() ──────────────────────────────────────
//
// This section tests the regression from the 1.5.0 upgrade:
// notifySync must call store.set() which marks dirty=true and triggers flush()
// (→ syncManager.push() → encrypted). Using restore() skips all of that.

describe("StarfishStore set() vs restore()", () => {
  function makeStore() {
    const pushMock = vi.fn().mockResolvedValue({ hash: "h1", timestamp: 100 });
    const pullMock = vi.fn().mockResolvedValue({ data: SAMPLE_DOC, hash: "h0", timestamp: 0 });
    const mockClient = { pull: pullMock, push: pushMock } as unknown as StarfishClient;

    const manager = new SyncManager({
      client: mockClient,
      pullPath: "/pull/wedding/user1",
      pushPath: "/push/wedding/user1",
      // No encryption here — testing store contract, not crypto
    });

    const store = createStarfishStore({ name: "test", syncManager: manager, storage: false });
    return { store, pushMock, pullMock };
  }

  it("restore() does NOT mark dirty and does NOT trigger a push", async () => {
    const { store, pushMock } = makeStore();
    store.getState().restore(SAMPLE_DOC);

    expect(store.getState().dirty).toBe(false);
    // Allow microtasks to flush
    await new Promise((r) => setTimeout(r, 10));
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("set() marks dirty and triggers flush() → push to server", async () => {
    const { store, pushMock } = makeStore();
    store.getState().set(() => SAMPLE_DOC);

    expect(store.getState().dirty).toBe(true);
    await new Promise((r) => setTimeout(r, 50));
    expect(pushMock).toHaveBeenCalledOnce();
  });

  it("notifySync equivalent: set() with isRestoring guard encrypts and pushes", async () => {
    const enc = createEncryptor(SECRET, SALT);
    const pushMock = vi.fn().mockResolvedValue({ hash: "h1", timestamp: 100 });
    const pullMock = vi.fn().mockResolvedValue({ data: await enc.encrypt(SAMPLE_DOC), hash: "h0", timestamp: 0 });
    const mockClient = { pull: pullMock, push: pushMock } as unknown as StarfishClient;

    const manager = new SyncManager({
      client: mockClient,
      pullPath: "/pull/wedding/user1",
      pushPath: "/push/wedding/user1",
      encryptionSecret: SECRET,
      encryptionSalt: SALT,
    });

    const store = createStarfishStore({ name: "test-enc", syncManager: manager, storage: false });

    // Simulate notifySync: set data to trigger push
    store.getState().set(() => SAMPLE_DOC);
    await new Promise((r) => setTimeout(r, 50));

    expect(pushMock).toHaveBeenCalledOnce();
    const sentData = pushMock.mock.calls[0][1] as Record<string, unknown>;
    // Server must receive encrypted data, not plaintext
    expect(sentData).toHaveProperty(ENCRYPTED_KEY);
    expect(JSON.stringify(sentData)).not.toContain('"version"');
  });
});
