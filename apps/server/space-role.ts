/**
 * Synthesizes `space:owner` / `space:member` by reading the per-space access
 * record (`spaces/{spaceId}/_access`) from the R2 store.
 *
 * TOFU: when the record doesn't exist yet (space not created) the first writer
 * becomes owner — both roles are granted to allow the initial `createSpace` PUT.
 *
 * Ported from octospaces/apps/server/src/space-role.ts — identical logic.
 */
import type { ObjectStore, RoleEnricher } from "@drakkar.software/starfish-server";

export const SPACE_OWNER_ROLE = "space:owner";
export const SPACE_MEMBER_ROLE = "space:member";

function spaceAccessFromRegistry(raw: string): { owner: string | null; members: string[] } {
  try {
    const doc = JSON.parse(raw) as Record<string, unknown>;
    const data = (doc && typeof doc === "object" && "data" in doc ? doc.data : doc) as
      | { owner?: unknown; members?: unknown }
      | undefined;
    const owner = typeof data?.owner === "string" ? data.owner : null;
    const members = Array.isArray(data?.members)
      ? (data!.members as unknown[]).filter((m): m is string => typeof m === "string")
      : [];
    return { owner, members };
  } catch {
    return { owner: null, members: [] };
  }
}

export function makeSpaceRoleEnricher(store: ObjectStore): RoleEnricher {
  return async (auth, params) => {
    const spaceId = params.spaceId;
    if (!spaceId || !auth.identity) return [];
    let raw: string | null = null;
    try {
      raw = await store.getString(`spaces/${spaceId}/_access`);
    } catch {
      raw = null;
    }
    // TOFU: space not created yet → the first writer becomes owner.
    if (!raw) return [SPACE_OWNER_ROLE, SPACE_MEMBER_ROLE];
    const { owner, members } = spaceAccessFromRegistry(raw);
    if (owner === null) return [SPACE_OWNER_ROLE, SPACE_MEMBER_ROLE];
    if (owner === auth.identity) return [SPACE_OWNER_ROLE, SPACE_MEMBER_ROLE];
    if (members.includes(auth.identity)) return [SPACE_MEMBER_ROLE];
    return [];
  };
}
