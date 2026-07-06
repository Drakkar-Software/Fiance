# Changelog

All notable changes to Fiancé are documented in this file.

## [Unreleased]

## [1.10.0]

### Changed
- Migrated the sync/identity/platform/analytics layer off a hand-rolled starfish wrapper onto the `@drakkar.software/dk-spaces-sdk` / `dk-spaces-platform-sdk` / `dk-spaces-analytics-sdk` family, and repointed the sync namespace from the retired `fiance` server app to `dk` (same host, `/v1/dk` instead of `/v1/fiance`). Bumped all six `@drakkar.software/starfish-*` packages to `3.0.0-alpha.65` (dk-spaces-sdk's version floor).
- Fixed a wildcard-cap authorization gap uncovered by the `dk` migration: starfish-spaces' default layout mints `collections:["*"]` account caps, which the server resolves to `cap:read:*` — a value that never matches a collection requiring an explicit `cap:read:spaces` (as `dk`'s `spaces`/`devices` collections do; the retired `fiance` namespace instead granted those via a synthesized `self` role). A custom `SpaceLayout` (mirroring the OctoVault/OctoChat reference apps) now overrides `accountScope`/`linkedDeviceScope` with explicit collection lists.
- Multi-device sync now writes **one document per collection** (all guests in one doc, all vendors in one, etc.) instead of one document per entity. A bulk action such as importing 120 guests previously fired ~120 separate network writes (Starfish has no batch-push); it now serialises into a single per-collection write. Deletes are propagated by durable per-entity tombstones inside the collection doc, so a peer's stale copy can no longer resurrect a removed guest/vendor/task. Existing projects are migrated in place on the **owner** device's next launch: it reads any legacy per-entity data, rewrites it as per-collection docs, and prunes the old nodes (a one-time, dev-phase cutover; member devices never mutate the shared space).

### Added
- Settings: "Reconnect this wedding" action, and a matching Home banner, for installs whose wedding space was provisioned under the retired `fiance` namespace. Re-provisions a fresh space under `dk` and re-pushes local data — nothing is migrated over the wire, since local storage is always the source of truth for an offline-first wedding. Existing invite/RSVP links are invalidated by this and must be regenerated afterward.
- Settings: new "Rejoindre un mariage" option lets you join an existing wedding via QR code invite, alongside the existing "create a new wedding" option.

### Fixed
- Fixed a crash ("Cannot read property 'importKey' of undefined") when scanning a QR code to join a wedding, on iOS and Android. Native crypto setup at app boot now exposes `globalThis.crypto.subtle`, which the join flow's account-level encryption relies on directly.
