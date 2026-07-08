import * as Linking from "expo-linking";
import * as Crypto from "expo-crypto";
import { createSpaceInviteLink, getSyncNamespace, roleCanWrite, serializeSpaceInviteStore } from "@fiance/sdk";
import { resolveSessionConfig } from "@/lib/server";
import { ensureSpaceProvisioned } from "@/lib/space-provision";
import { pushSpaceSnapshot } from "@/lib/space-sync";
import { usePermissionsStore } from "@/store/usePermissionsStore";
import { writeCollection } from "@/lib/kv-storage";
import type { WeddingRegistryEntry } from "@/lib/wedding-registry";

/** KV key holding the serialized space-invite store (edPub/kemPub/cap handles per invite),
 *  persisted so `revokeSpaceAccess` can look up the entry after an app restart. */
export const SPACE_INVITE_STORE_KEY = "spaceInviteStore";

/**
 * Generate a space invite link for the given wedding entry, scoped to a role.
 *
 * The role's `canWrite` drives the invite cap's write flag (Phase 2 — a read-only
 * role mints a read-only member cap). The role assignment is recorded against the
 * invite's ephemeral subject id and pushed so the joining member can resolve its
 * per-feature permissions (Phase 1). Throws a human-readable message on failure.
 */
export async function createInviteLink(entry: WeddingRegistryEntry, roleId?: string, name?: string): Promise<string> {
  const cfg = await resolveSessionConfig(entry);
  if (!cfg) throw new Error("INVITE_NO_SESSION");
  const spaceId = await ensureSpaceProvisioned(cfg.session, entry);

  // Record the assignment BEFORE snapshotting so it's part of the pushed content
  // the member will hydrate. Keyed by the invite's ephemeral subject id (below).
  const role = roleId ? usePermissionsStore.getState().roles.find((r) => r.id === roleId) : undefined;
  const canWrite = role ? roleCanWrite(role) : true;

  // ensureSpaceProvisioned only creates an empty index + keyring — otherwise content reaches the
  // space via the debounced push on a later mutation, or the nodeCount===0 one-shot in
  // providers.tsx (skipped once any node, e.g. a publicPage node, already exists in the index).
  // Publish now so an invite never points a member at a contentless space.
  const origin = Linking.createURL("").replace(/\/$/, "");
  // Name the invite after the collaborator when provided, so it's identifiable in the
  // invite store / roster; fall back to the wedding label.
  const collaboratorName = name?.trim() || undefined;
  const { token, link, inviteUserId } = await createSpaceInviteLink(cfg.session, spaceId, collaboratorName ?? entry.label, canWrite, origin);

  // Persist the (in-memory) invite store so this link's revocation handle survives an app
  // restart — revokeSpaceAccess needs getSpaceInviteEntry(spaceId, inviteUserId) to resolve.
  try { writeCollection(SPACE_INVITE_STORE_KEY, serializeSpaceInviteStore()); } catch (err) {
    console.warn("[invite] failed to persist space-invite store", err);
  }

  if (role) {
    const subjectUserId = inviteUserId ?? (token.cap as { subUserId?: string }).subUserId;
    if (subjectUserId) {
      const now = new Date().toISOString();
      usePermissionsStore.getState().upsertAssignment({
        id: Crypto.randomUUID(),
        subjectUserId,
        roleId: role.id,
        label: collaboratorName ?? null,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  // Publish the snapshot (incl. the new assignment) so the invite never points a
  // member at a contentless space and their role resolves on first hydrate.
  await pushSpaceSnapshot(cfg.session, spaceId, entry.weddingNodeId ?? entry.id);

  // Diagnostics for the "member joins but sees no data" (objdoc 403) bug: a link invitee
  // only earns space:member if its ephemeral subUserId is in the server _access roster.
  // Re-read the roster from the owner's device to confirm addSpaceMember's write landed
  // (addSpaceMember is a silent no-op when the id is already present — so check, don't assume).
  try {
    const memberUserId = (token.cap as { subUserId?: string }).subUserId;
    const access = await cfg.session.accountClient
      .pull(cfg.session.layout.spaceAccessPull(spaceId))
      .catch(() => null);
    const members: string[] = Array.isArray((access?.data as any)?.members)
      ? (access!.data as any).members
      : [];
    console.log("[invite] link created", {
      namespace: getSyncNamespace(),
      spaceId,
      owner: cfg.session.userId,
      memberUserId,
      rosterMembers: members,
      memberInRoster: memberUserId ? members.includes(memberUserId) : false,
    });
  } catch (err) {
    console.warn("[invite] roster diagnostics failed", err);
  }

  return link;
}
