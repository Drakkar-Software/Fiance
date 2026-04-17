/**
 * Group-crypto helpers for Fiancé partner invite flow.
 *
 * Admin creates a GroupKeyring on first invite; the keyring wraps a shared GEK
 * for both admin and the pre-computed partner identity. Partner pulls the keyring
 * on their first sync and creates a matching Encryptor.
 *
 * Backward compat: entries without groupKeyring/memberId use legacy encryptionSecret/Salt.
 */

import * as Crypto from "expo-crypto";
import { StarfishClient, type Encryptor } from "@drakkar.software/starfish-client";
import {
  deriveGroupKeyPair,
  createGroupKeyring,
  createGroupEncryptor,
  type GroupKeyring,
} from "@drakkar.software/starfish-client/group";
import { createResilientFetch } from "@drakkar.software/starfish-client/fetch";
import { buildInviteUrl } from "@/lib/identity";
import type { WeddingRegistryEntry } from "@/lib/wedding-registry";
import type { ServerConfig } from "@/lib/server";

const KEYRING_COLLECTION = "keyring";

function makeClient(config: ServerConfig): StarfishClient {
  const { fetch: resilientFetch } = createResilientFetch(
    { maxRetries: 2, initialDelayMs: 500 },
    { threshold: 3, cooldownMs: 15_000 },
  );
  return new StarfishClient({
    baseUrl: config.serverUrl,
    auth: async () => ({ Authorization: `Bearer ${config.authToken}` }),
    fetch: resilientFetch,
  });
}

async function pushKeyring(
  client: StarfishClient,
  adminUserId: string,
  keyring: GroupKeyring,
): Promise<void> {
  await client.push(
    `/push/${KEYRING_COLLECTION}/${adminUserId}`,
    keyring as unknown as Record<string, unknown>,
    null,
  );
}

async function pullKeyring(
  client: StarfishClient,
  adminUserId: string,
): Promise<GroupKeyring | null> {
  try {
    const result = await client.pull(`/pull/${KEYRING_COLLECTION}/${adminUserId}`, 0);
    const d = result.data;
    if (!d || typeof (d as GroupKeyring).currentEpoch !== "number") return null;
    return d as unknown as GroupKeyring;
  } catch {
    return null;
  }
}

export interface GroupInviteResult {
  partnerMemberId: string;
  inviteUrl: string;
  groupKeyringJson: string;
}

/**
 * Admin flow: create a group keyring that wraps the GEK for both admin and
 * a pre-computed partner identity, then push the keyring to the server.
 *
 * Returns the partnerMemberId (to embed in the invite URL) and the serialized
 * keyring (to store in WeddingRegistryEntry.groupKeyring).
 */
export async function createGroupInvite(
  entry: WeddingRegistryEntry,
  config: ServerConfig,
): Promise<GroupInviteResult> {
  const { seedPhrase } = entry;
  if (!seedPhrase) throw new Error("No seedPhrase");

  const adminUserId = config.userId;
  const partnerMemberId = Crypto.randomUUID();

  const [adminKeyPair, partnerKeyPair] = await Promise.all([
    deriveGroupKeyPair(seedPhrase, adminUserId),
    deriveGroupKeyPair(seedPhrase, partnerMemberId),
  ]);

  const { keyring } = await createGroupKeyring(adminKeyPair, {
    [adminUserId]: adminKeyPair.publicKey,
    [partnerMemberId]: partnerKeyPair.publicKey,
  });

  const groupKeyringJson = JSON.stringify(keyring);

  // Push keyring to server so partner can pull it on join.
  // Non-fatal: partner's first sync retries automatically.
  try {
    await pushKeyring(makeClient(config), adminUserId, keyring);
  } catch (err) {
    console.warn("[group-crypto] Keyring push failed (will retry):", err);
  }

  const inviteUrl = buildInviteUrl(entry.label, seedPhrase, partnerMemberId);

  return { partnerMemberId, inviteUrl, groupKeyringJson };
}

/**
 * Resolve a group Encryptor for SyncManager, or null for legacy mode.
 *
 * - Admin with groupKeyring stored locally → parse and create encryptor
 * - Partner with memberId → pull keyring from server, then create encryptor
 * - Otherwise → null (legacy encryptionSecret/Salt path)
 */
export async function resolveGroupEncryptor(
  entry: WeddingRegistryEntry,
  config: ServerConfig,
): Promise<Encryptor | null> {
  const { seedPhrase } = entry;
  if (!seedPhrase) return null;

  // Admin: keyring stored in entry
  if (entry.groupKeyring) {
    const keyring: GroupKeyring = JSON.parse(entry.groupKeyring);
    const keyPair = await deriveGroupKeyPair(seedPhrase, config.userId);
    return createGroupEncryptor(keyring, config.userId, keyPair.privateKey);
  }

  // Partner: pull keyring from server using admin's userId (same seedPhrase → same userId)
  if (entry.memberId) {
    const keyring = await pullKeyring(makeClient(config), config.userId);
    if (!keyring) return null;
    const keyPair = await deriveGroupKeyPair(seedPhrase, entry.memberId);
    return createGroupEncryptor(keyring, entry.memberId, keyPair.privateKey);
  }

  return null; // legacy mode
}
