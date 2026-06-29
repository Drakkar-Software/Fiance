/**
 * Identity & invite utilities for Fiancé — v3 (starfish-spaces).
 *
 * v2 compat: `generatePassphrase`, `buildInviteUrl`, `decodeInviteToken`,
 * `parseInviteUrl` keep their signatures; `deriveAuthToken` and
 * `deriveEncryptionKey` are deprecated stubs (Bearer auth removed in v3).
 */

import * as Linking from "expo-linking";
import { getRandomBytes } from "expo-crypto";
import { entropyToMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import {
  isValidSeed as _isValidSeed,
  deriveSession as _deriveSession,
  fingerprintFromUserId,
  encodeLinkFragment,
  decodeLinkFragment,
  type Session,
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
  const session = await _deriveSession(
    words,
    { baseUrl: normalizeSyncBase(serverUrl), namespace: "fiance" },
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

// ─── Deprecated v2 stubs ──────────────────────────────────────────────────────

/**
 * @deprecated Removed in v3. Bearer auth tokens no longer exist.
 * Use `deriveSessionFromPhrase` to get a v3 Session instead.
 */
export async function deriveAuthToken(_password: string): Promise<string> {
  console.warn(
    "[identity] deriveAuthToken is deprecated — Bearer auth removed in v3. " +
      "Use deriveSessionFromPhrase() instead.",
  );
  return "";
}

/**
 * @deprecated Removed in v3. Client-side AES key derivation no longer needed —
 * encryption is handled by the space keyring via starfish-spaces.
 */
export async function deriveEncryptionKey(
  _password: string,
  _salt: string,
): Promise<string> {
  console.warn(
    "[identity] deriveEncryptionKey is deprecated — space keyring handles E2EE in v3.",
  );
  return "";
}

// ─── URL helpers ──────────────────────────────────────────────────────────────

/** Build a deep link URL to the public wedding page (by userId). */
export function buildWeddingPageUrl(userId: string): string {
  return Linking.createURL(`wedding/${userId}`);
}

// ─── Partner / guest invite (TODO B5: replace with starfish-spaces space invite links) ───

export interface InvitePayload {
  name: string;
  password: string;
  /** Group-crypto member identity (v2 legacy; unused in v3 space-invite flow). */
  memberId?: string;
}

/**
 * Build an invite deep-link URL.
 *
 * TODO(B5): Replace with `createSpaceInviteLink` / `encodeSpaceInviteLink`
 * from starfish-spaces for the partner-sharing flow.
 */
export function buildInviteUrl(
  name: string,
  seedPhrase: string,
  memberId?: string,
): string {
  const payload: Record<string, string> = { n: name, p: seedPhrase };
  if (memberId) payload.m = memberId;
  const origin = Linking.createURL("").replace(/\/$/, "");
  return encodeLinkFragment(origin, "join", payload);
}

/**
 * Decode a URL-safe base64 invite token into name + seedPhrase.
 * Returns null if the token is missing or malformed.
 */
export function decodeInviteToken(
  token: string | undefined,
): InvitePayload | null {
  if (!token) return null;
  try {
    const result = decodeLinkFragment<Record<string, string>>(
      token,
      (tok) => {
        if (tok && typeof tok === "object" && "n" in tok && "p" in tok) {
          return tok as Record<string, string>;
        }
        return null;
      },
    );
    if (!result || typeof result.n !== "string" || typeof result.p !== "string")
      return null;
    return {
      name: result.n,
      password: result.p,
      memberId: typeof result.m === "string" && result.m ? result.m : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Parse invite params from a deep link URL.
 * Returns null if the URL does not contain a valid invite token.
 */
export function parseInviteUrl(url: string): InvitePayload | null {
  try {
    const parsed = new URL(url);
    const fragment = parsed.hash.slice(1); // strip leading '#'
    return fragment ? decodeInviteToken(fragment) : null;
  } catch {
    return null;
  }
}
