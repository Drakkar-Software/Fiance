/**
 * Server credential helpers — pure derivation logic.
 * No Expo env references — the app passes config via parameters.
 * Crypto derivation depends on @drakkar.software/starfish-client/identity
 * which is a pure Node/web-compatible package.
 */

// NodeNext .js extension required
import type { WeddingRegistryEntry } from '../domain/registry.js';

export type { WeddingRegistryEntry };

export type ServerConfig = {
  serverUrl: string;
  authToken: string;
  userId: string;
  encryptionKey: string;
};

/** Injected credential derivation — implemented app-side using starfish-client/identity */
export interface CredentialDeriver {
  deriveAuthToken(password: string): Promise<string>;
  deriveEncryptionKey(password: string, userId: string): Promise<string>;
}

/** Derive just the userId from a seed phrase (for URL generation, no server needed) */
export async function deriveUserId(
  seedPhrase: string,
  deriver: CredentialDeriver
): Promise<string> {
  const authToken = await deriver.deriveAuthToken(seedPhrase);
  return authToken.slice(0, 16);
}

/**
 * Resolve server URL from an entry, a bare URL string, or an env fallback.
 * Pass envSyncUrl from process.env.EXPO_PUBLIC_SYNC_URL on the app side.
 */
export function resolveServerUrl(
  entryOrUrl?: WeddingRegistryEntry | string | null,
  envSyncUrl?: string
): string | undefined {
  if (envSyncUrl) return envSyncUrl;
  const url = typeof entryOrUrl === "string" ? entryOrUrl : entryOrUrl?.serverUrl;
  return url;
}

/**
 * Resolve full server credentials from a registry entry.
 * Returns null if seedPhrase or serverUrl (direct or env) is missing.
 */
export async function resolveServerConfig(
  entry: WeddingRegistryEntry | null | undefined,
  deriver: CredentialDeriver,
  envSyncUrl?: string
): Promise<ServerConfig | null> {
  const password = entry?.seedPhrase;
  const serverUrl = resolveServerUrl(entry, envSyncUrl);
  if (!password || !serverUrl) return null;
  const authToken = await deriver.deriveAuthToken(password);
  const userId = authToken.slice(0, 16);
  const encryptionKey = await deriver.deriveEncryptionKey(password, userId);
  return { serverUrl, authToken, userId, encryptionKey };
}
