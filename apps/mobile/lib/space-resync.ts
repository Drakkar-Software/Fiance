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
import { getSyncNamespace } from "@fiance/sdk";
import type { WeddingRegistryEntry } from "@/lib/wedding-registry";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";
import { activateSync } from "@/lib/providers";
import { teardownSync, getActiveSession, getActiveSpaceId, getActiveWeddingNodeId } from "@/lib/starfish";
import { pushSpaceSnapshot } from "@/lib/space-sync";

function currentNamespace(): string {
  return getSyncNamespace() ?? "dk";
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

  await useWeddingRegistryStore.getState().updateWedding(wedding.id, {
    spaceId: undefined,
    weddingNodeId: undefined,
    syncNamespace: undefined,
  });

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

  const session = getActiveSession();
  const spaceId = getActiveSpaceId();
  const weddingNodeId = getActiveWeddingNodeId();
  if (session && spaceId && weddingNodeId) {
    await pushSpaceSnapshot(session, spaceId, weddingNodeId);
  }
}
