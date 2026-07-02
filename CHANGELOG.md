# Changelog

All notable changes to Fiancé are documented in this file.

## [1.9.0] - 2026-07-02

### Added
- Settings: new "Rejoindre un mariage" option lets you join an existing wedding via QR code invite, alongside the existing "create a new wedding" option.

### Fixed
- Fixed a crash ("Cannot read property 'importKey' of undefined") when scanning a QR code to join a wedding, on iOS and Android. Native crypto setup at app boot now exposes `globalThis.crypto.subtle`, which the join flow's account-level encryption relies on directly.
