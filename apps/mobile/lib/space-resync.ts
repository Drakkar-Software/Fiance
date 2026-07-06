/**
 * One-time re-provisioning helper for a sync-namespace cutover (e.g. the
 * `fiance` → `dk` migration).
 *
 * Existing installs may hold a `spaceId` that was TOFU-owned under a retired
 * namespace — meaningless under the current one (different registry, different
 * KV credential prefix, possibly a different cap model). Since local Zustand/KV
 * state is always the source of truth (offline-first), there is no server data
 * to migrate: the fix is to forget the stale spaceId and let the wedding go
 * through the exact same first-sync path a brand-new wedding takes — which
 * re-provisions a fresh space under the current namespace and pushes local
 * state fresh (see SyncInitializer's `nodeCount === 0` one-shot push).
 */
import { kvRemove } from "@drakkar.software/dk-spaces-platform-sdk";
import { getSyncNamespace, DEFAULT_SYNC_NAMESPACE } from "@fiance/sdk";
import type { WeddingRegistryEntry } from "@/lib/wedding-registry";
import { activateSync, clearActivation } from "@/lib/providers";
import { teardownSync, getActiveSession, getActiveSpaceId, getActiveWeddingNodeId } from "@/lib/starfish";
import { pushSpaceSnapshot, resetDirtyPushBaseline } from "@/lib/space-sync";

/** Legacy (pre-`dk`) KV prefix for the join-link credential store — see starfish-spaces' default. */
const LEGACY_SPACEACCESS_KV_PREFIX = "starfish.spaceaccess.";

function currentNamespace(): string {
  try {
    return getSyncNamespace() ?? DEFAULT_SYNC_NAMESPACE;
  } catch {
    return DEFAULT_SYNC_NAMESPACE;
  }
}

/**
 * True when this wedding's space was provisioned under a different sync
 * namespace than the one currently configured — it needs a re-sync before
 * push/pull will work again.
 *
 * Owner-only: a member's `spaceId` comes from joining an invite link, not
 * from provisioning — re-syncing must start at the owner, who re-invites
 * members after (see `resyncWeddingToCurrentNamespace`'s guard).
 */
export function needsNamespaceResync(wedding: WeddingRegistryEntry | null | undefined): boolean {
  if (!wedding?.spaceId || wedding.role === "member") return false;
  return wedding.syncNamespace !== currentNamespace();
}

/**
 * Re-provision this wedding's sync space under the current namespace and
 * push all local data fresh. Owner-only.
 *
 * WARNING: any existing public-page/RSVP invite links tied to the old space
 * are invalidated — the couple must regenerate and redistribute them after
 * this completes.
 */
export async function resyncWeddingToCurrentNamespace(
  wedding: WeddingRegistryEntry,
): Promise<void> {
  if (wedding.role === "member") {
    throw new Error("Only the wedding owner can re-provision the sync space.");
  }

  teardownSync();
  // Drop any in-flight activation still running with the OLD (stale-spaceId)
  // entry — otherwise activateSync() below could return that cached promise
  // instead of actually re-provisioning (see clearActivation's doc comment).
  clearActivation(wedding.id);
  // Baselines are keyed by weddingNodeId, which is unchanged across a resync —
  // without this, a snapshot pushed earlier this session makes pushSpaceSnapshot
  // (below) see everything as already-pushed and silently push nothing into the
  // fresh space.
  resetDirtyPushBaseline();

  // Note: the registry entry is deliberately NOT cleared here. ensureSpaceProvisioned
  // (space-provision.ts) fast-paths on `freshEntry.spaceId` (this local clone), not
  // the persisted registry entry, and stamps the new spaceId/syncNamespace onto the
  // registry itself once provisioning actually succeeds. So if activateSync fails
  // below, the persisted entry still has its old (broken) spaceId — needsNamespaceResync
  // keeps returning true and the resync banner/action stays visible for a retry,
  // instead of silently disappearing.
  const freshEntry: WeddingRegistryEntry = {
    ...wedding,
    spaceId: undefined,
    weddingNodeId: undefined,
    syncNamespace: undefined,
  };

  const activated = await activateSync(freshEntry);
  if (!activated) {
    throw new Error("Failed to re-provision the sync space.");
  }

  // Best-effort cleanup of the old namespace's join-link credential — it's for a
  // space that no longer resolves under the current namespace. Not security-critical
  // (scoped to a retired space; a local attacker already has the plaintext wedding
  // data), so failure here must never fail the resync itself.
  await kvRemove(`${LEGACY_SPACEACCESS_KV_PREFIX}${activated.userId}`).catch(() => {});

  const session = getActiveSession();
  const spaceId = getActiveSpaceId();
  const weddingNodeId = getActiveWeddingNodeId();
  if (session && spaceId && weddingNodeId) {
    await pushSpaceSnapshot(session, spaceId, weddingNodeId);
  }
}
