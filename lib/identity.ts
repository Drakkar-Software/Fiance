/**
 * Identity & invite utilities for WeddingOS sync authentication.
 * Uses a user-chosen password as the root identity.
 */

import * as Crypto from "expo-crypto";
import * as Linking from "expo-linking";

const WORDLIST = [
  "apple","breeze","coral","dawn","ember","frost","grove","haze","ivory",
  "jade","kite","lemon","maple","noble","olive","pearl","quartz","river",
  "silk","tulip","umbra","violet","willow","zenith","amber","bloom",
  "cedar","dusk","echo","fern","glow","honey","iris","jewel","kelp",
  "lotus","moon","nest","opal","pine","rose","sage","tide","vine","wave",
] as const;

/** Generate a random 4-word passphrase using crypto-secure randomness */
export function generatePassphrase(): string {
  const bytes = Crypto.getRandomValues(new Uint8Array(4));
  return Array.from(bytes)
    .map((b) => WORDLIST[b % WORDLIST.length])
    .join("-");
}

/** Derive a deterministic auth token (hex string) from a password */
export async function deriveAuthToken(password: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password.trim()
  );
}

/**
 * Derive a deterministic encryption key from password + salt.
 * The salt should be wedding-specific (e.g. the wedding UUID) so
 * different weddings get different encryption keys.
 */
export async function deriveEncryptionKey(
  password: string,
  salt: string
): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${password.trim()}:${salt}`
  );
}

/** Build a deep link URL to invite someone to a wedding */
export function buildInviteUrl(name: string, password: string): string {
  return Linking.createURL("join", {
    queryParams: {
      name,
      password,
    },
  });
}

/** Parse invite params from a deep link URL. Returns null if not an invite link. */
export function parseInviteUrl(
  url: string
): { name: string; password: string } | null {
  const parsed = Linking.parse(url);
  const name = parsed.queryParams?.name;
  const password = parsed.queryParams?.password;
  if (
    typeof name === "string" &&
    typeof password === "string" &&
    name &&
    password
  ) {
    return { name, password };
  }
  return null;
}
