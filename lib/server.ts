/**
 * Server credential helpers — derive and resolve auth credentials
 * needed to talk to the Starfish sync server.
 */

import { deriveAuthToken, deriveEncryptionKey } from "@/lib/identity";
import type { WeddingRegistryEntry } from "@/lib/wedding-registry";

export type ServerConfig = {
  serverUrl: string;
  authToken: string;
  userId: string;
  encryptionKey: string;
};

/** Derive just the userId from a seed phrase (for URL generation, no server needed) */
export async function deriveUserId(seedPhrase: string): Promise<string> {
  const authToken = await deriveAuthToken(seedPhrase);
  return authToken.slice(0, 16);
}

/**
 * Resolve full server credentials from a registry entry.
 * Returns null if seedPhrase or serverUrl (direct or env) is missing.
 */
export async function resolveServerConfig(
  entry: WeddingRegistryEntry | null | undefined,
): Promise<ServerConfig | null> {
  const password = entry?.seedPhrase;
  const serverUrl = entry?.serverUrl || process.env.EXPO_PUBLIC_SYNC_URL!;
  if (!password || !serverUrl) return null;
  const authToken = await deriveAuthToken(password);
  const userId = authToken.slice(0, 16);
  const encryptionKey = await deriveEncryptionKey(password, userId);
  return { serverUrl, authToken, userId, encryptionKey };
}
