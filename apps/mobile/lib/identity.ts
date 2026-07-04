/**
 * Identity & invite utilities for Fiancé — v3 (starfish-spaces).
 */

import * as Linking from "expo-linking";
import { getRandomBytes } from "expo-crypto";
import { entropyToMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { createResilientFetch } from "@drakkar.software/starfish-client/fetch";
import {
  isValidSeed as _isValidSeed,
  deriveSession as _deriveSession,
  fingerprintFromUserId,
  decodeSpaceInviteLink,
  type Session,
  type SpaceInviteLinkToken,
} from "@fiance/sdk";

// ─── Seed phrase helpers ──────────────────────────────────────────────────────

/**
 * Normalize a stored seed phrase: replaces hyphens with spaces so that v2
 * hyphenated phrases (`word-word-word`) and v3 space-separated BIP-39 phrases
 * are both accepted by `deriveSession`.
 */
export function normalizePhrase(phrase: string): string {
  return phrase.trim().replace(/-/g, " ");
}

/**
 * Generate a fresh BIP-39 seed phrase (space-separated 12 words).
 * Previously returned a hyphen-separated phrase; new accounts use spaces.
 *
 * @deprecated alias — prefer `generateSeedWords()` in new code.
 */
export function generatePassphrase(): string {
  return entropyToMnemonic(getRandomBytes(16), wordlist);
}

/** Generate a BIP-39 seed phrase (space-separated, 12 words). */
export function generateSeedWords(): string {
  return entropyToMnemonic(getRandomBytes(16), wordlist);
}

/** Check that a phrase is a valid BIP-39 mnemonic (after normalizing). */
export function isValidSeed(phrase: string): boolean {
  return _isValidSeed(normalizePhrase(phrase).split(" "));
}

// ─── Session derivation ───────────────────────────────────────────────────────

/** Strip a trailing `/v1` suffix — starfish-spaces client adds its own `/v1/{namespace}/`. */
function normalizeSyncBase(url: string): string {
  return url.replace(/\/v1\/?$/, "");
}

/**
 * Derive a v3 Session from a seed phrase (space- or hyphen-separated).
 * Requires a `serverUrl` to satisfy the per-call transport requirement of
 * starfish-spaces.  Callers that only need the `userId` may pass any URL
 * since the userId is purely crypto-derived from the keypair.
 */
export async function deriveSessionFromPhrase(
  phrase: string,
  serverUrl: string,
): Promise<{ session: Session; userId: string }> {
  const words = normalizePhrase(phrase).split(" ");
  // Retries 429/5xx honoring Retry-After (falls back to exponential backoff); covers the
  // owner's content/account/index clients. Collaborator node-push clients are rebuilt
  // without this fetch.
  const { fetch: resilientFetch } = createResilientFetch();
  const session = await _deriveSession(
    words,
    { baseUrl: normalizeSyncBase(serverUrl), namespace: "fiance", fetch: resilientFetch },
    { sharedNamespace: "fiance", autoProfile: false },
  );
  return { session, userId: session.userId };
}

/**
 * Short hex fingerprint of a userId — suitable for display ("AB12…CD34").
 */
export function userDisplayId(userId: string): string {
  return fingerprintFromUserId(userId);
}

// ─── URL helpers ──────────────────────────────────────────────────────────────

/** Build a deep link URL to the public wedding page (by userId). */
export function buildWeddingPageUrl(userId: string): string {
  return Linking.createURL(`wedding/${userId}`);
}

// ─── Space invite link parsing ────────────────────────────────────────────────

export type { SpaceInviteLinkToken };

/**
 * Parse a starfish-spaces invite link token from a deep link URL.
 * Returns null if the URL does not contain a valid space invite token.
 *
 * Tolerant of polluted fragments: some share targets append human-readable text
 * and a duplicate URL after the payload (e.g. `#<token>%20Join%20us!%20https://…`).
 * Only the leading base64url token is decoded so such links still resolve.
 */
export function parseSpaceInviteUrl(url: string): SpaceInviteLinkToken | null {
  try {
    const hash = new URL(url).hash.slice(1); // strip leading '#'
    // `new URL().hash` percent-encodes spaces → %20, which terminates the base64url run
    const token = hash.match(/^[A-Za-z0-9_-]+/)?.[0];
    if (!token) return null;
    return decodeSpaceInviteLink(token);
  } catch {
    return null;
  }
}
