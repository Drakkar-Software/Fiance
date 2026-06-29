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
import { updateWeddingEntry, type WeddingRegistryEntry } from '@/lib/wedding-registry';
import { withIndexLock } from '@/lib/index-lock';

/**
 * Idempotent: returns the existing `spaceId` if already provisioned, otherwise
 * creates the space (_access, objindex seed, _keyring, _spaces entry) and persists
 * the returned `sp-` id on the registry entry.
 */
export async function ensureSpaceProvisioned(
  session: Session,
  wedding: WeddingRegistryEntry,
): Promise<string> {
  // Already done — fast path.
  if (wedding.spaceId) return wedding.spaceId;

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
  const { spaces } = await readSpaces(session.spacesRegistryClient, session);
  const space = buildSpace(spaceId, name);
  await writeSpaces(session.spacesRegistryClient, session, [...spaces, space]);

  // 5. Persist so subsequent sessions skip provisioning.
  await updateWeddingEntry(wedding.id, { spaceId });

  return spaceId;
}
