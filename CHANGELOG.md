# Changelog

All notable changes to Fiancé are documented in this file.

## [Unreleased]

### Changed
- Multi-device sync now writes **one document per collection** (all guests in one doc, all vendors in one, etc.) instead of one document per entity. A bulk action such as importing 120 guests previously fired ~120 separate network writes (Starfish has no batch-push); it now serialises into a single per-collection write. Deletes are propagated by durable per-entity tombstones inside the collection doc, so a peer's stale copy can no longer resurrect a removed guest/vendor/task. Existing projects are migrated in place on the **owner** device's next launch: it reads any legacy per-entity data, rewrites it as per-collection docs, and prunes the old nodes (a one-time, dev-phase cutover; member devices never mutate the shared space).

### Added
- Settings: new "Rejoindre un mariage" option lets you join an existing wedding via QR code invite, alongside the existing "create a new wedding" option.

### Fixed
- Fixed a crash ("Cannot read property 'importKey' of undefined") when scanning a QR code to join a wedding, on iOS and Android. Native crypto setup at app boot now exposes `globalThis.crypto.subtle`, which the join flow's account-level encryption relies on directly.
