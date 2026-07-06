import * as Linking from "expo-linking";
import { createSpaceInviteLink, getSyncNamespace } from "@fiance/sdk";
import { resolveSessionConfig } from "@/lib/server";
import { ensureSpaceProvisioned } from "@/lib/space-provision";
import { pushSpaceSnapshot } from "@/lib/space-sync";
import type { WeddingRegistryEntry } from "@/lib/wedding-registry";

/**
 * Generate a space invite link for the given wedding entry.
 * Throws an error with a human-readable message on failure.
 */
export async function createInviteLink(entry: WeddingRegistryEntry): Promise<string> {
  const cfg = await resolveSessionConfig(entry);
  if (!cfg) throw new Error("INVITE_NO_SESSION");
  const spaceId = await ensureSpaceProvisioned(cfg.session, entry);
  // ensureSpaceProvisioned only creates an empty index + keyring — otherwise content reaches the
  // space via the debounced push on a later mutation, or the nodeCount===0 one-shot in
  // providers.tsx (skipped once any node, e.g. a publicPage node, already exists in the index).
  // Publish now so an invite never points a member at a contentless space.
  await pushSpaceSnapshot(cfg.session, spaceId, entry.weddingNodeId ?? entry.id);
  const origin = Linking.createURL("").replace(/\/$/, "");
  const { token, link } = await createSpaceInviteLink(cfg.session, spaceId, entry.label, true, origin);

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
