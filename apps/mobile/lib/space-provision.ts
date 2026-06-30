/**
 * Space provisioner — bootstraps the owner's starfish-space for a new wedding.
 *
 * The SDK splits registry operations between two sub-clients on the fiance namespace:
 *   - `spacesRegistryClient` — _access, _spaces
 *   - `spacesKeyringClient`  — _keyring  (via ownerEnsureSpaceKeyring)
 *   - `contentClient`        — objindex  (via seedSpaceObjectIndex)
 *
 * The first `writeSpaceAccess` succeeds via TOFU (Trust On First Use): when no
 * `_access` doc exists, the server enricher grants [space:owner, space:member]
 * to any authenticated identity, letting the owner bootstrap their own space.
 * After that first write the enricher reads the stored doc on every request.
 */

import * as Crypto from 'expo-crypto';
import {
  writeSpaceAccess,
  seedSpaceObjectIndex,
  ownerEnsureSpaceKeyring,
  readSpaces,
  writeSpaces,
  buildSpace,
  type Session,
} from '@fiance/sdk';
import { type WeddingRegistryEntry } from '@/lib/wedding-registry';
import { useWeddingRegistryStore } from '@/store/useWeddingRegistryStore';
import { withIndexLock } from '@/lib/index-lock';

/**
 * Idempotent: returns the existing `spaceId` if already provisioned, otherwise
 * creates the space (_access, objindex seed, _keyring, _spaces entry) and persists
 * the returned `sp-` id on the registry entry.
 *
 * For member-role entries (joined via invite link), `spaceId` is always set at
 * join time — the fast-path short-circuits and owner provisioning never runs.
 */
export async function ensureSpaceProvisioned(
  session: Session,
  wedding: WeddingRegistryEntry,
): Promise<string> {
  // Fast path: spaceId already set (always true for member-role entries joined via link).
  if (wedding.spaceId) return wedding.spaceId;

  // Guard: members must never run owner provisioning steps.
  if (wedding.role === "member") {
    throw new Error(
      `[space-provision] member entry ${wedding.id} has no spaceId — invite join did not persist spaceId`,
    );
  }

  const spaceId = `${session.spaceIdPrefix}${Crypto.randomUUID().replace(/-/g, '')}`;
  const name = wedding.label;

  // 1. Write _access to fiance (TOFU grants space:owner on first write).
  //    Sets owner = userId, members = [], and the human-readable space name.
  await writeSpaceAccess(
    session.spacesRegistryClient,
    spaceId,
    session.userId,
    [],
    null,
    session,
    { name },
  );

  // 2. Seed the empty object index in fiance (idempotent — skips if already seeded).
  //    getSpaceClient falls through to session.contentClient when no local access entry.
  //    Wrapped in withIndexLock: seedSpaceObjectIndex has no CAS retry, so a concurrent
  //    duplicate activation racing here would get a 409 hash_mismatch without the lock.
  await withIndexLock(spaceId, () => seedSpaceObjectIndex(session, spaceId));

  // 3. Create the space-wide E2EE keyring in fiance.
  //    Uses session.spacesKeyringClient.
  await ownerEnsureSpaceKeyring(session, spaceId);

  // 4. Register the space in the user's _spaces list (fiance).
  //    Best-effort: a CAS 409 here must not abort provisioning — the spaceId is
  //    persisted below and sync uses it directly, not _spaces. The SDK fix
  //    (updateSpacesDoc hardening) makes this converge; the try/catch is a safety net.
  const { spaces } = await readSpaces(session.spacesRegistryClient, session);
  const space = buildSpace(spaceId, name);
  try {
    await writeSpaces(session.spacesRegistryClient, session, [...spaces, space]);
  } catch (err) {
    console.warn('[space-provision] _spaces registration failed (non-fatal):', err);
  }

  // 5. Persist so subsequent sessions skip provisioning.
  //    Use the store action (not the raw KV writer) so the in-memory registry is
  //    updated immediately — the fast-path at the top of this function then holds
  //    on the next activation and prevents orphan-space churn.
  await useWeddingRegistryStore.getState().updateWedding(wedding.id, { spaceId });

  return spaceId;
}
