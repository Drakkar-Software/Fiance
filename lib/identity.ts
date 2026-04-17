/**
 * Identity & invite utilities for Fiancé sync authentication.
 * Built on top of @drakkar.software/starfish-client/identity.
 */

import * as Linking from "expo-linking";
import {
  generatePassphrase as _generatePassphrase,
  deriveCredentials,
  buildInviteUrl as _buildInviteUrl,
  parseInviteUrl as _parseInviteUrl,
} from "@drakkar.software/starfish-client/identity";

/** Generate a random 12-word passphrase using crypto-secure randomness */
export function generatePassphrase(): string {
  return _generatePassphrase().replace(/ /g, "-");
}

/** Derive a deterministic auth token (hex string) from a password */
export async function deriveAuthToken(password: string): Promise<string> {
  const { authToken } = await deriveCredentials(password.trim());
  return authToken;
}

/**
 * Derive a deterministic encryption key from a password.
 * The salt parameter is accepted for backward compatibility but is not used —
 * the key is always derived from the password alone (salt = userId internally).
 */
export async function deriveEncryptionKey(password: string, _salt: string): Promise<string> {
  const { encryptionSecret } = await deriveCredentials(password.trim());
  return encryptionSecret;
}

/** Build a deep link URL to invite someone to a wedding (URL-safe base64 payload) */
export function buildInviteUrl(name: string, password: string, memberId?: string): string {
  const baseUrl = Linking.createURL("join");
  const payload: Record<string, unknown> = { n: name, p: password };
  if (memberId) payload.m = memberId;
  return _buildInviteUrl(baseUrl, payload);
}

/** Build a URL to the public wedding page (uses userId, no secret needed) */
export function buildWeddingPageUrl(userId: string): string {
  return Linking.createURL(`wedding/${userId}`);
}

export interface InvitePayload {
  name: string;
  password: string;
  /** Partner's group-crypto member identity (present in group-crypto invites only) */
  memberId?: string;
}

/** Decode a URL-safe base64 invite token into name + password (+ optional memberId). Returns null if malformed. */
export function decodeInviteToken(token: string | undefined): InvitePayload | null {
  if (!token) return null;
  const result = _parseInviteUrl(`?t=${token}`);
  if (!result || typeof result.n !== "string" || typeof result.p !== "string") return null;
  return {
    name: result.n,
    password: result.p,
    memberId: typeof result.m === "string" ? result.m : undefined,
  };
}

/** Parse invite params from a deep link URL. Returns null if not an invite link. */
export function parseInviteUrl(url: string): InvitePayload | null {
  const result = _parseInviteUrl(url);
  if (!result || typeof result.n !== "string" || typeof result.p !== "string") return null;
  return {
    name: result.n,
    password: result.p,
    memberId: typeof result.m === "string" ? result.m : undefined,
  };
}
