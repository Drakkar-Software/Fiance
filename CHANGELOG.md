# Changelog

All notable changes to Fiancé are documented in this file.

## [Unreleased]

## [2.0.0]

### Added
- **Free vs. Premium**: a real, enforced free tier (30 guests, 3 vendors, 1 event, 25 custom planning tasks, 1 invited collaborator — couple sync itself stays unconditionally free) backed by a pure SDK quota helper (`isWithinFreeLimit`) and checked at every add/save entry point, including the ones reachable by direct URL on web. A reusable `PremiumGate` blur-lock overlay gates advanced budget tools (categories, contributors, multi-currency, quote comparison) and the public page's gift registry, FAQ, and multi-day program (free tier only publishes the earliest day), each with a "Déverrouiller" unlock CTA. The paywall (`/settings/premium`) and `PaywallSheet` were rewritten with the real benefit list and a live price instead of a hardcoded one.
- RevenueCat integration (iOS, Android, and Web Billing) bound to the wedding **owner's** entitlement, so every collaborator on a wedding reads the same premium unlock without needing their own RevenueCat account; the entitlement is also persisted onto the synced wedding document so it works fully offline/cold-boot.
- Collaborator roles with per-feature permissions: invite family, a wedding planner, or vendors with view-only or edit access per section, with revocation support and a read-only banner/gating for view-only collaborators.
- Day-of moments can now link to a wedding-party role (e.g. "Maid of Honor gives a speech at 6pm") instead of only a free-text name.
- Real-time sync push over SSE (server + SDK + mobile), so collaborators see changes land live instead of waiting for the next poll.
- Per-invitation-type guest pricing: vendor cost-per-guest now derives from dynamic invitation-type counts (adults/children/vendors, etc.) with a visible count-mode toggle, fixed fees, and a propagated dynamic total, instead of a single flat per-head rate.
- iOS home-screen widget (`expo-widgets`, Small + Medium) mirroring the home dashboard: countdown plus a priority-ordered summary (overdue tasks, vendor deposits due, expiring quotes, critical unstarted tasks, guests without a table, over-budget, then upcoming agenda events and next tasks). Refreshes on data changes and app foreground; fully localized; a dismissible home banner explains how to add it. iOS-only.
- First-visit feature welcome screens introducing new areas of the app.
- Collaborator roles: invite-link "copy to clipboard" before opening the share sheet, and an invite name requirement so collaborators show up identifiable in the roster.
- 118 new Le Carnet blog articles (two batches of 68 and 50) filling out planning, budget, guest, vendor, and comparison content; social-media and App Store/Play Store badges added to the marketing footer/README; a store-review prompt at 10+ guests/vendors/tasks.
- Settings: real app version + last-update date shown in the About card; EAS Insights + EAS Observe instrumentation for release health monitoring.

### Fixed
- Closed a wedding-singleton lost-update hole with per-entity revision LWW, and fixed a rollout-window bug that could lose data during a sync race; fixed an SSE sync race, status pollution, and duplicated auth headers.
- Fixed member-device data loss caused by a read-only cap, a member invite that pointed at an unpublished space, and an objdoc-403 affecting link-joined collaborators.
- Fixed the analytics 404 and the public page not going live immediately after wedding creation; fixed resync-path bugs surfaced by review of the `fiance` → `dk` namespace migration.
- Fixed a RevenueCat entitlement id / product id mismatch against the dashboard, a stale cross-wedding entitlement, a customer-info listener leak, and a configure-crash risk on rapid wedding switching; the purchase CTA no longer shows a raw ellipsis placeholder while the price is loading.
- Wired resilient fetch for sync calls to avoid 429 rate limiting from the sync server; deduped the RSVP `/content` fetch that re-ran on every tab focus; fixed an instant-check delay on the communication guest roster.
- Fixed guest cold-start scroll offset and the iOS companion-picker sheet layout; fixed a budget category silently dropping a deselected vendor when its comparison group had no winner; hid empty guest filters and warn on possible duplicate guest names.
- Fixed SEO meta title lengths and invalid breadcrumb JSON-LD; improved EmptyState contrast and fixed an action-button width bug on web.
- Restored a "create table" entry point in the guests table-management and seating-plan screens' header (top-right +), matching the guest/vendor add pattern, so it's reachable on both mobile and wide desktop layouts alongside the floating action button.
- Fixed the EmptyState primary button not stretching full-width/centering on web (an `@expo/ui` Host sizing quirk defeated the fill style) and form text-input font color going near-invisible when the OS is in dark mode but the app itself is set to light — the input was reading the raw OS scheme instead of the app's actual resolved theme.
- Fixed the previous wedding's data flashing on Home after switching weddings: `router.replace` to home fired before `switchWedding`'s async registry write/reload resolved, so the destination screen painted stale data until the swap caught up. Switching now routes through a dedicated transition screen — an animated Garden Press overlay naming the destination wedding — that only hands off to Home once the new wedding's data is fully hydrated.

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
