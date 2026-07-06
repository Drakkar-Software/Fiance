import * as Linking from "expo-linking";
import { createSpaceInviteLink } from "@fiance/sdk";
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
  const { link } = await createSpaceInviteLink(cfg.session, spaceId, entry.label, true, origin);
  return link;
}
