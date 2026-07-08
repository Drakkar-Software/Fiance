/**
 * Collaborator revocation (owner side).
 *
 * True eviction = keyring rotation (evicted member can no longer decrypt new content) +
 * roster removal (server denies `space:member`, so every collection 403s for future reads/
 * writes). Revoking one subject evicts ONLY that subject — other links/members keep access.
 *
 * `submitRevocation` is local: the dk server has no RevocationList endpoint, and it isn't
 * needed here — every object collection requires the roster `space:member` role, which the
 * roster drop removes. We still persist the RevocationList (generation + cumulative entries)
 * so a future server endpoint can consume it.
 */

import {
  revokeSpaceAccess,
  removeSpaceMember,
  hydrateSpaceInviteStore,
} from "@fiance/sdk";
import { getActiveSession, getActiveSpaceId } from "@/lib/starfish";
import { pushSpaceSnapshot } from "@/lib/space-sync";
import { readCollection } from "@/lib/kv-storage";
import { SPACE_INVITE_STORE_KEY } from "@/lib/invite-link";
import { usePermissionsStore } from "@/store/usePermissionsStore";
import { useWeddingRegistryStore } from "@/store/useWeddingRegistryStore";

export interface RevokeResult {
  /** True when the keyring was rotated (full eviction); false when only the roster was dropped. */
  evicted: boolean;
}

export async function revokeCollaborator(
  subjectUserId: string,
  assignmentId: string,
): Promise<RevokeResult> {
  const permStore = usePermissionsStore.getState();
  const regStore = useWeddingRegistryStore.getState();
  const registry = regStore.registry;
  const active = registry?.weddings.find((w) => w.id === registry.activeWeddingId) ?? null;

  // 1. Drop the assignment + push FIRST, so the member (still in the old keyring epoch) can
  //    decrypt the deletion and clear its cached matrix before we rotate them out.
  permStore.removeAssignment(assignmentId);

  const session = getActiveSession();
  const spaceId = getActiveSpaceId();
  if (session && spaceId && active) {
    try {
      await pushSpaceSnapshot(session, spaceId, active.weddingNodeId ?? active.id);
    } catch (err) {
      console.warn("[revoke] pre-rotation snapshot push failed", err);
    }
  }

  if (!session || !spaceId || !active) return { evicted: false };

  // 2. Hydrate the invite store (entries minted in prior sessions) so getSpaceInviteEntry resolves.
  try {
    const raw = readCollection<string>(SPACE_INVITE_STORE_KEY);
    if (raw) hydrateSpaceInviteStore(raw);
  } catch (err) {
    console.warn("[revoke] failed to hydrate invite store", err);
  }

  const generation = (active.revocationGeneration ?? 0) + 1;
  const priorRevoked = (active.revokedEntries ?? []) as unknown[];

  try {
    await revokeSpaceAccess(session, spaceId, subjectUserId, {
      generation,
      priorRevoked: priorRevoked as never,
      submitRevocation: async (list: unknown) => {
        const revoked =
          (list as { revoked?: unknown[]; entries?: unknown[] }).revoked ??
          (list as { revoked?: unknown[]; entries?: unknown[] }).entries ??
          priorRevoked;
        await regStore.updateWedding(active.id, {
          revocationGeneration: generation,
          revokedEntries: revoked,
        });
      },
    });
    return { evicted: true };
  } catch (err) {
    // No stored invite entry (link minted on another device) — roster drop still cuts server
    // access, since every object collection requires the roster space:member role.
    console.warn("[revoke] revokeSpaceAccess failed; falling back to removeSpaceMember", err);
    try {
      await removeSpaceMember(session.accountClient, spaceId, subjectUserId, session);
    } catch (e) {
      console.warn("[revoke] removeSpaceMember fallback also failed", e);
    }
    return { evicted: false };
  }
}
