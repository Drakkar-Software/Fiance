import * as Linking from "expo-linking";
import { createSpaceInviteLink } from "@fiance/sdk";
import { resolveSessionConfig } from "@/lib/server";
import { ensureSpaceProvisioned } from "@/lib/space-provision";
import type { WeddingRegistryEntry } from "@/lib/wedding-registry";

/**
 * Generate a space invite link for the given wedding entry.
 * Throws an error with a human-readable message on failure.
 */
export async function createInviteLink(entry: WeddingRegistryEntry): Promise<string> {
  const cfg = await resolveSessionConfig(entry);
  if (!cfg) throw new Error("INVITE_NO_SESSION");
  const spaceId = await ensureSpaceProvisioned(cfg.session, entry);
  const origin = Linking.createURL("").replace(/\/$/, "");
  const { link } = await createSpaceInviteLink(cfg.session, spaceId, entry.label, true, origin);
  return link;
}
