# Changelog

All notable changes to Fiancé are documented in this file.

## [Unreleased]

### Changed
- Multi-device sync now writes **one document per collection** (all guests in one doc, all vendors in one, etc.) instead of one document per entity. A bulk action such as importing 120 guests previously fired ~120 separate network writes (Starfish has no batch-push); it now serialises into a single per-collection write. This is the **Expand** step of an expand/migrate/contract rollout: this release *dual-writes* both the new per-collection docs and the legacy per-entity nodes (and reads both, unioning them), so a device still on the previous build keeps working; a later release drops the per-entity writes to realise the full request-count reduction. Deletes are now propagated by durable per-entity tombstones inside the collection doc, so a peer's stale copy can no longer resurrect a removed guest/vendor/task.

### Added
- Settings: new "Rejoindre un mariage" option lets you join an existing wedding via QR code invite, alongside the existing "create a new wedding" option.

### Fixed
- Fixed a crash ("Cannot read property 'importKey' of undefined") when scanning a QR code to join a wedding, on iOS and Android. Native crypto setup at app boot now exposes `globalThis.crypto.subtle`, which the join flow's account-level encryption relies on directly.
