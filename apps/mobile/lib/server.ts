/**
 * Server credential helpers — v3 (starfish-spaces).
 *
 * `ServerConfig` is kept for backward compatibility but `authToken` and
 * `encryptionKey` are deprecated stubs (Bearer auth and client-side key
 * derivation are removed in Starfish v3). Use `SessionConfig` /
 * `resolveSessionConfig` in new code.
 */

import { deriveSession, getSyncNamespace, type Session } from "@fiance/sdk";
import { normalizePhrase } from "@/lib/identity";
import type { WeddingRegistryEntry } from "@/lib/wedding-registry";

/** Sync namespace: sourced from configureFiance() at boot; "dk" is the fallback. */
function syncNamespace(): string {
  return getSyncNamespace() ?? "dk";
}

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * @deprecated Use `SessionConfig` instead.
 * `authToken` and `encryptionKey` are always empty strings in v3 — Bearer
 * auth and client-side AES key derivation no longer exist.
 */
export type ServerConfig = {
  serverUrl: string;
  /** @deprecated Always "" in v3. */
  authToken: string;
  userId: string;
  /** @deprecated Always "" in v3. */
  encryptionKey: string;
};

/** v3 replacement for ServerConfig. */
export type SessionConfig = {
  serverUrl: string;
  session: Session;
  userId: string;
};

// ─── URL resolution ───────────────────────────────────────────────────────────

/** Resolve server URL from an entry, a bare URL string, or the env fallback. */
export function resolveServerUrl(
  entryOrUrl?: WeddingRegistryEntry | string | null,
): string | undefined {
  if (process.env.EXPO_PUBLIC_SYNC_URL!) {
    return process.env.EXPO_PUBLIC_SYNC_URL;
  }
  const url =
    typeof entryOrUrl === "string" ? entryOrUrl : entryOrUrl?.serverUrl;
  return url;
}

/** Strip a trailing `/v1` suffix — starfish-spaces client adds its own `/v1/{namespace}/`. */
export function normalizeSyncBase(url: string): string {
  return url.replace(/\/v1\/?$/, "");
}

/** Build the starfish-spaces ClientOpts from a resolved server URL. */
function makeClientOpts(serverUrl: string) {
  return { baseUrl: normalizeSyncBase(serverUrl), namespace: syncNamespace() };
}

// ─── v3 session helpers ───────────────────────────────────────────────────────

/**
 * Derive the v3 userId (32-char hex from Ed25519 public key) from a seed phrase.
 * Accepts both v2 hyphenated and v3 space-separated phrases.
 *
 * Note: userId is purely crypto-derived from the keypair; the serverUrl is used
 * only to satisfy the per-call transport requirement of deriveSession.
 */
export async function deriveUserId(
  seedPhrase: string,
  serverUrl?: string,
): Promise<string> {
  const baseUrl = serverUrl ? normalizeSyncBase(serverUrl) : "http://localhost";
  const session = await deriveSession(
    normalizePhrase(seedPhrase).split(" "),
    { baseUrl, namespace: syncNamespace() },
    { sharedNamespace: syncNamespace(), autoProfile: false },
  );
  return session.userId;
}

/**
 * Resolve a full v3 SessionConfig from a registry entry.
 * Returns null if seedPhrase or serverUrl is missing.
 */
export async function resolveSessionConfig(
  entry: WeddingRegistryEntry | null | undefined,
): Promise<SessionConfig | null> {
  const seedPhrase = entry?.seedPhrase;
  const serverUrl = resolveServerUrl(entry);
  if (!seedPhrase || !serverUrl) return null;
  const session = await deriveSession(
    normalizePhrase(seedPhrase).split(" "),
    makeClientOpts(serverUrl),
    { sharedNamespace: syncNamespace(), autoProfile: false },
  );
  return { serverUrl, session, userId: session.userId };
}

// ─── Legacy compat ────────────────────────────────────────────────────────────

/**
 * @deprecated Use `resolveSessionConfig` instead.
 *
 * Kept for call sites that only need `serverUrl` and `userId`.
 * `authToken` and `encryptionKey` are always empty strings.
 */
export async function resolveServerConfig(
  entry: WeddingRegistryEntry | null | undefined,
): Promise<ServerConfig | null> {
  const seedPhrase = entry?.seedPhrase;
  const serverUrl = resolveServerUrl(entry);
  if (!seedPhrase || !serverUrl) return null;
  const session = await deriveSession(
    normalizePhrase(seedPhrase).split(" "),
    makeClientOpts(serverUrl),
    { sharedNamespace: syncNamespace(), autoProfile: false },
  );
  return {
    serverUrl,
    userId: session.userId,
    authToken: "", // deprecated — Bearer auth removed in v3
    encryptionKey: "", // deprecated — space keyring handles E2EE in v3
  };
}
