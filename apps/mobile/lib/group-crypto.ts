/**
 * Group-crypto helpers — STUBBED for octospaces v3 migration.
 *
 * The `starfish-client/group` subpath was removed in Starfish 3.0.
 * Partner sharing is now done via fiancespace space invites
 * (`createSpaceInviteLink` / `joinSpaceByLink`) — see Phase B5.
 *
 * These stubs keep existing callers compiling. The UI in settings/index.tsx
 * that calls `createGroupInvite` will be replaced with the space-invite flow
 * in B5; until then it falls back to the legacy seed-phrase invite URL.
 *
 * @deprecated Replace all callers with fiancespace space invite flow (B5).
 */

import type { WeddingRegistryEntry } from "@/lib/wedding-registry";
import type { ServerConfig } from "@/lib/server";

export interface GroupInviteResult {
  partnerMemberId: string;
  inviteUrl: string;
  groupKeyringJson: string;
}

/**
 * @deprecated Replaced by createSpaceInviteLink in B5.
 * Currently throws so the caller falls back to the legacy URL path.
 */
export async function createGroupInvite(
  _entry: WeddingRegistryEntry,
  _config: ServerConfig,
): Promise<GroupInviteResult> {
  throw new Error(
    '[group-crypto] createGroupInvite removed — use space invite flow (octospaces B5)',
  );
}

/**
 * @deprecated Replaced by space keyring in B5.
 */
export async function resolveGroupEncryptor(
  _entry: WeddingRegistryEntry,
  _config: ServerConfig,
): Promise<null> {
  return null;
}
