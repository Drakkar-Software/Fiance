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

import { joinSpaceByLink, hydrateSpaceAccessStore, type SpaceInviteLinkToken } from "@fiance/sdk";
import { generatePassphrase, deriveSessionFromPhrase } from "@/lib/identity";
import { resolveServerUrl } from "@/lib/server";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";
import { resolveActiveMemberPermissions } from "@/lib/permissions/resolve";

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

  // Pin the access-store identity to the joiner BEFORE calling joinSpaceByLink.
  // joinSpaceByLink calls saveSpaceAccessEntry(spaceId, …) which writes to
  // _cache2 under the store's current _activeKey. If _activeKey is still set
  // to a *previous* user's id (or null), the entry is saved under the wrong key,
  // then wiped when hydrateSpaceAccessStore(newUserId) runs at member-boot and
  // resets _cache2. Pinning first ensures the credential is stored under the
  // joiner's namespace and is later reloaded from KV without depending on
  // a server read-after-write of _spaces.pubAccess.
  await hydrateSpaceAccessStore(session.userId, {}, {});

  // Register the link credential in the space-access store BEFORE the wedding
  // becomes active so boot hydrate can decrypt content from the first launch.
  await joinSpaceByLink(session, token);

  // Create the local wedding entry. spaceId is persisted atomically so
  // ensureSpaceProvisioned fast-paths and never runs owner setup.
  const entry = await store.createWedding(
    token.spaceName,
    seed,
    serverUrl,
    token.spaceId,
    "member",
  );

  // Remember the invite's ephemeral subject id so we can resolve (and later
  // re-resolve) the role the owner assigned to this link, keyed by that id.
  const inviteSubjectId = (token.cap as { subUserId?: string }).subUserId;
  if (inviteSubjectId) {
    await store.updateWedding(entry.id, { inviteSubjectId });
    // Best-effort immediate resolve; providers re-runs it once the owner's
    // permission assignments sync in (they may not be present yet).
    await resolveActiveMemberPermissions().catch(() => {});
  }
}
