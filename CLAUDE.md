# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo layout

This is a **pnpm workspace** with two packages:

| Package | Path | Description |
|---------|------|-------------|
| `fiance` | `apps/mobile/` | Expo app (iOS · Android · Web) |
| `@fiance/sdk` | `packages/fiance-sdk/` | Pure headless business logic (no RN deps) |

## Commands

Run from the **repo root** (pnpm delegates to the right workspace):

```bash
pnpm install                        # Install all workspace dependencies
pnpm test                           # Run all tests (mobile + SDK)
pnpm --filter fiance start          # Start Expo dev server
pnpm --filter fiance run android    # Run on Android emulator
pnpm --filter fiance run ios        # Run on iOS simulator
pnpm --filter fiance run web        # Run in browser
pnpm --filter fiance lint           # ESLint (mobile)
pnpm --filter fiance build:web      # Export for Cloudflare Pages (output: apps/mobile/dist/)
pnpm --filter fiance test:watch     # Watch mode (mobile tests)
pnpm --filter fiance storybook      # Start Storybook dev server (localhost:6006)
```

Tests use Vitest. Test files:
- `apps/mobile/__tests__/` — integration tests that depend on RN mocks
- `packages/fiance-sdk/src/**/*.test.ts` — pure-logic unit tests (no RN)

## Production domain

The web app is deployed at **https://fiance.drakkar.software** (Cloudflare Pages). All canonical URLs, sitemap, robots.txt, llms.txt, and i18n `canonical` fields must use this domain.

When adding or renaming a page, route, or significant feature, update:
- `apps/mobile/public/sitemap.xml` — add/update the URL entry
- `apps/mobile/public/llms.txt` — add/update the relevant section
- `apps/mobile/i18n/locales/*/marketing.json` — update `canonical` fields

## Before committing and pushing

Always run both commands and verify they succeed before committing:

```bash
pnpm test                       # all tests must pass (mobile + SDK)
pnpm --filter fiance build:web  # web export must succeed (catches Metro config errors, bundler issues)
```

## Dependency management rules

- **NEVER use `pnpm.overrides`** in package.json to force dependency versions.
- **NEVER run `pnpm install --force`** — it reinstalls packages into workspace-local node_modules, creating stale nested copies that shadow the root.
- When bumping starfish-* versions, bump **both** `apps/mobile/package.json` AND `packages/fiance-sdk/package.json` to the same version set so pnpm can deduplicate to a single instance.

## Architecture

**Fiancé** is a privacy-first, offline-first wedding planning app built as a pnpm workspace monorepo. The Expo app (`apps/mobile/`) targets iOS, Android, and web. All user-facing text is in French.

### Routing

File-based routing via Expo Router. Screens live in `apps/mobile/app/(tabs)/` — each subdirectory is a feature tab (guests, vendors, planning, budget, ideas, settings). The root `apps/mobile/app/_layout.tsx` wraps everything in a wedding registry provider.

### Data flow: Zustand → KV-store → Starfish

Three-layer persistence:

1. **Zustand stores** (`apps/mobile/store/`) — runtime state; domain stores include `useWeddingStore`, `useGuestsStore`, `useVendorsStore`, `usePlanningStore`, `useIdeasStore`, `useAccommodationsStore`, `useGiftsStore`, plus `useWeddingRegistryStore` for multi-wedding support.
2. **KV-store** (`apps/mobile/db/schema.ts` — plain TS interfaces, no Drizzle ORM) — `apps/mobile/lib/persistence.ts` handles hydration on boot and write-through on every mutation via `lib/kv-storage.ts`.
3. **Starfish sync** (optional) — `apps/mobile/lib/starfish.ts` and `packages/fiance-sdk/src/sync/backup.ts` push AES-256-GCM encrypted backups to `https://sync.drakkar.software/sync` (drakkar_sync, `/v1/fiance` namespace). Triggered via `notifySync()` after store mutations.

### `@fiance/sdk` — pure headless SDK

`packages/fiance-sdk/` contains pure TypeScript logic with no React Native dependencies:
- `src/domain/` — entity reducers (guests, budget, planning, vendor-config, registry), schema, types
- `src/sync/` — backup serialization/migration, public-page helpers, RSVP helpers, server-config
- `src/analytics.ts`

Import alias: `@fiance/sdk` (declared as `workspace:*` dep in `apps/mobile`; TypeScript resolves via tsconfig path alias; Metro resolves via the `react-native` export condition pointing to source).

Currently `useGuestsStore` delegates to SDK reducers. Budget/planning/vendor-config/registry libs have SDK copies but the app still calls its own local copies — this is a known TODO.

### Starfish sync — encryption contract

The `wedding` collection uses **client-side AES-256-GCM encryption**. The server stores an opaque `{ "_encrypted": "<base64>" }` blob and never sees plaintext. All server collections are configured with `encryption: "none"` (server pass-through; encryption is handled entirely on the client by `SyncManager`).

**Critical**: `notifySync()` must call `store.set(() => doc)` — this marks `dirty=true`, triggers `flush()`, which calls `syncManager.push()` and encrypts the payload. **Never use `store.restore(doc)` for pushing**: `restore()` only updates local Zustand state without marking dirty, so `flush()` never runs and nothing reaches the server. The `isRestoring` guard (`isRestoring = true` around `set()`) prevents the store subscription from redundantly calling `restoreFromBackup` on our own outgoing data.

### Adding a new store

Create `apps/mobile/store/useNewStore.ts` with Zustand `create()`. Add KV key to `apps/mobile/db/schema.ts`. Wire hydration/write-through in `apps/mobile/lib/persistence.ts` (`hydrateAllStores` and `clearAllStores`). Call `notifySync()` on mutations.

### Adding a new screen

Create file under `apps/mobile/app/(tabs)/feature/`. Expo Router auto-discovers it. Add tab entry in `apps/mobile/app/(tabs)/_layout.tsx` if it's a new tab.

### Blog (Le Carnet) — publication dates and JSON-LD

Every blog post must expose **`datePublished`** and **`dateModified`** in JSON-LD via `buildBlogPostingNode()` in `apps/mobile/lib/blog.ts`.

| Field | Source | JSON-LD | When to change |
|-------|--------|---------|----------------|
| `date` | `BLOG_PUBLISH_DATES` in `blog-publish-dates.ts`, or explicit `date` on the post / `postPair()` | `datePublished` | **Once**, when the article is first published. Never bump on edits. |
| `updated` | `BLOG_CONTENT_UPDATED` in `blog-publish-dates.ts`, or explicit `updated` on `postPair()` | `dateModified` | **Only** when article content changes (title, excerpt, or `sections`). Do not set when wiring imports, reordering, or updating sitemap/`llms.txt` alone. |

**Adding a new article**

1. Write content in `blog-posts-*.ts` (or inline in `blog.ts` for legacy posts).
2. Add the slug and first-publication date to `BLOG_PUBLISH_DATES`.
3. Wire the post in `blog.ts`, and update `sitemap.xml` + `llms.txt`.
4. Do **not** add a `BLOG_CONTENT_UPDATED` entry yet.

**Editing article content**

1. Change title, excerpt, or sections.
2. Add or update `BLOG_CONTENT_UPDATED[slug]` with the edit date (`YYYY-MM-DD`).
3. Optionally align `sitemap.xml` `<lastmod>` with `updated` (not required for JSON-LD).

`postPair()` resolves `date` and `updated` from the maps by default. Inline posts in `blog.ts` / `blog-posts-3-10.ts` must set `date: getBlogPublishDate(slug)` manually; add `updated` only after a content edit.

Run `pnpm test` — `blog-jsonld.test.ts` asserts every slug has valid `datePublished` / `dateModified`.

### Styling

NativeWind v5 / Tailwind v4. Tokens in `apps/mobile/global.css` (`@theme inline`). Garden Press palette: primary clay `#b96a4a`, accent olive `#6e7a4a` / mustard `#c9922f`, paper `#f2ece0` bg, card `#fdfaf1` bg, ink `#2a2418`. Type stack: Fraunces (Display component), Caveat (Script component), Inter (Label + body). `apps/mobile/lib/theme.ts` exports hex literals for JS consumers. Shared UI components in `apps/mobile/components/` — notably `FormSection.tsx` exports form building blocks (SectionTitle, FormCard, InputRow, ToggleRow, ChipSelect). Primitive GP components: `Display`, `Script`, `Label`, `Card`, `Chip`, `Avatar`, `Sprig`, `Postit`, `Underline`, `Seal`.

### CI/CD

- **Web**: Push to main/master → `.github/workflows/deploy-web.yml` → Cloudflare Pages (`apps/mobile/dist/`)
- **Android APK**: Push to version tags → `.github/workflows/build-apk.yml` → EAS Build (runs from `apps/mobile/`) → artifact upload
