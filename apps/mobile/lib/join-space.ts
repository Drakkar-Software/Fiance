/**
 * Space-invite join helper — v3 (starfish-spaces).
 *
 * Replaces the legacy "join by seed phrase" flow. The invite token carries the
 * spaceId and ephemeral keys; the joiner mints their OWN seed phrase / identity
 * and adopts the owner's space via `joinSpaceByLink`.
 *
 * Kept in lib/ (not in the component) so it can be called from both join.tsx
 * and onboarding.tsx without React context.
 */

import { joinSpaceByLink, type SpaceInviteLinkToken } from "@fiance/sdk";
import { generatePassphrase, deriveSessionFromPhrase } from "@/lib/identity";
import { resolveServerUrl } from "@/lib/server";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";

/**
 * Join a wedding from a space-invite link token.
 *
 * - De-dupes: if this device already has a wedding for the token's spaceId,
 *   switches to it and returns without creating a new entry.
 * - Otherwise: generates a fresh BIP-39 identity for the joiner, calls
 *   `joinSpaceByLink` to store the link credential, then creates a local
 *   wedding entry with `role: "member"` so provisioning never tries to
 *   re-provision the space as owner.
 */
export async function joinWeddingByToken(token: SpaceInviteLinkToken): Promise<void> {
  const store = useWeddingRegistryStore.getState();
  const registry = store.registry;

  // De-dupe: already have this space — just switch to it.
  const existing = registry?.weddings.find((w) => w.spaceId === token.spaceId);
  if (existing) {
    await store.switchWedding(existing.id);
    return;
  }

  // Joiner mints their OWN identity — seed phrase is private to this device.
  const seed = generatePassphrase();
  const serverUrl = resolveServerUrl(undefined);
  if (!serverUrl) throw new Error("[join-space] No server URL configured");

  const { session } = await deriveSessionFromPhrase(seed, serverUrl);

  // Register the link credential in the space-access store BEFORE the wedding
  // becomes active so boot hydrate can decrypt content from the first launch.
  await joinSpaceByLink(session, token);

  // Create the local wedding entry. spaceId is persisted atomically so
  // ensureSpaceProvisioned fast-paths and never runs owner setup.
  await store.createWedding(
    token.spaceName,
    seed,
    serverUrl,
    token.spaceId,
    "member",
  );
}
