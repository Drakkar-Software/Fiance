/**
 * Custom SpaceLayout for the `dk` sync namespace.
 *
 * starfish-spaces' `defaultSpaceLayout.accountScope`/`linkedDeviceScope` mint
 * wildcard-collection caps (`collections:["*"]`). The server synthesizes cap
 * roles by literal concatenation (`cap:read:${collection}`), so a wildcard
 * collection produces `cap:read:*` — which never matches a collection that
 * requires an EXPLICIT `cap:read:spaces` (as the `dk` namespace's `spaces` and
 * `devices` collections do; the retired `fiance` namespace instead granted
 * those via the synthesized `self` role, which needed no explicit cap match).
 * Left unfixed, every `_spaces`/`_devices` read or write against `dk` 403s.
 *
 * Fix (mirrors the OctoVault/OctoChat reference apps): override just these two
 * scopes with dk-spaces-sdk's explicit-collection versions. Every other layout
 * field (paths, `spaceOwnerScope`, `spaceMemberScope`, …) is byte-identical
 * between the starfish default and dk-spaces-sdk, so it is left untouched via
 * the spread.
 */
import { defaultSpaceLayout } from '@drakkar.software/starfish-spaces';
import type { SpaceLayout } from '@drakkar.software/starfish-spaces';
import { accountScope, linkedDeviceScope } from '@drakkar.software/dk-spaces-sdk';

// Built lazily inside the function (not at module scope): config.ts imports
// this module unconditionally via the @fiance/sdk barrel, so an eager
// `...defaultSpaceLayout` spread here would evaluate on every import of
// @fiance/sdk — including in tests that partially mock starfish-spaces
// without configureFiance() ever running.
export function fianceLayout(): SpaceLayout {
  return {
    ...defaultSpaceLayout,
    accountScope,
    linkedDeviceScope,
  };
}
