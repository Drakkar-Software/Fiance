# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo layout

This is a **pnpm workspace** with three packages:

| Package | Path | Description |
|---------|------|-------------|
| `fiance` | `apps/mobile/` | Expo app (iOS · Android · Web) |
| `@fiance/sdk` | `packages/fiance-sdk/` | Pure headless business logic (no RN deps) |
| `@fiance/ui` | `packages/fiance-ui/` | UI components, primitives, and utils (RN/Expo) |

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
- `packages/fiance-ui/src/**/*.test.ts` — none yet (`passWithNoTests` keeps the recursive `pnpm test` green)

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

### `@fiance/ui` — vendored UI components

`packages/fiance-ui/` holds RN/Expo UI code the app depends on, resolved from source in Metro the same way as `@fiance/sdk` (source/`react-native`/`require` export conditions → `./src/...`; `import`/`types` → the tsup `dist/` build for non-RN consumers). Two origins:

- **Vendored from `@drakkar.software/seahorse`** (the external registry package this app used to depend on, now fully removed): `src/components/{ui,pin,sheets,form}/`, `src/primitives/`, `src/theme/` (`ForgeThemeProvider`), `src/utils/{app-lock,secure-store,kv-storage,links,pwa-install,file-export,cn,pin-helpers}`, `src/utils/toast/`, `tailwind/{preset.js,theme.css}`. Only the subset the app actually uses was copied (not the whole seahorse package) — see `src/components/index.ts` for the exact re-export list. `Sheet` (`src/components/sheets/SheetShell.tsx`) was recovered from seahorse's 0.11.0 release since the 0.12.0 working tree it was vendored from had dropped it.
- **Garden Press primitives moved from `apps/mobile/components/`**: `Display`, `Script`, `Label`, `Card`, `Chip`, `Avatar`, `Sprig`, `Postit`, `Underline`, `Seal`, `ScriptButton`, `PageHeader`, `FAB`, `SearchBar`, `ProgressBar`, `FilterTabs`, `MoneyDisplay` live at `src/components/*.tsx` (flat, sibling to the seahorse-derived subdirs). `src/garden-theme.ts` is the Garden Press hex-token source of truth (moved from `apps/mobile/lib/theme.ts`).

Every `apps/mobile/components/{Name}.tsx` for a moved/vendored component is now a one-line re-export (`export { Name } from "@fiance/ui/components";`), so existing `@/components/Name` import paths across the app didn't need to change. `apps/mobile/lib/theme.ts` is likewise `export { theme } from "@fiance/ui/garden-theme";`. Domain-specific or app-shell components (`PriorityBadge`, `DesktopShell`/`DesktopSidebar`, `OfflineBanner`, `StackMenu`, `Seo.*`, `QRScannerScreen`, `UpdateBanner`, `SegmentedControl`) stayed in `apps/mobile/components/` — either wedding-domain-typed or coupled to app stores/routing.

### @expo/ui BottomSheet — iOS interactive content must stay fully native

`packages/fiance-ui/src/primitives/bottom-sheet/index.tsx` (`BottomSheet`, re-exported as `SheetShell`/`Sheet`) wraps `@expo/ui/community/bottom-sheet` — the `@gorhom/bottom-sheet` drop-in. On iOS this is backed by a SwiftUI `.sheet` that hosts RN children through an `RNHostView` bridge whose touch handler attaches once, on first appear, with no retry. Traced through `node_modules/@expo/ui/src/community/bottom-sheet/BottomSheet.ios.tsx`: without an explicit `snapPoints`, `enableDynamicSizing` defaults to `true` → `fitToContents = true` → SwiftUI re-measures and resizes the sheet *after* it's presented, re-parenting the `RNHostView` and desyncing its touch handler — RN `Pressable` rows show a press animation but `onPress` never fires. It can also get stuck at the `.medium` fallback detent.

**Fix (applied in the primitive)**: on iOS only, pass `enableDynamicSizing={false}`. With no `snapPoints`, detents fall back to native `['medium','large']` — no post-present resize, so the bridge never desyncs. (`parseSnapPoint` does **not** accept the strings `'medium'`/`'large'` — passing `snapPoints={['medium','large']}` explicitly would `parseFloat` them to `NaN`.) Android (Material3) and web (vaul) were never affected — fix is iOS-only.

For genuine row-of-choices/menu sheets (not just forms/buttons), that detent fix alone isn't enough for reliable long-term correctness — belt-and-suspenders is to rebuild the **iOS** content from `@expo/ui`'s own universal components (`Column`, `List`, `ListItem`, `Text`, `TextInput`, `Button` from `@expo/ui`) inside a `ForgeHost` (`packages/fiance-ui/src/primitives/_host/ForgeHost.tsx`, exported at `@fiance/ui/primitives/host`) instead of RN primitives — see `apps/mobile/components/CompanionPickerModal.tsx` for the reference implementation (Android/web keep the original RN `Pressable` render, since they were never affected).

Two non-obvious rules when doing this:

1. **`@expo/ui`'s SwiftUI tree is reconciled separately from React Native's.** The instant a plain RN element (`View`, `Pressable`, or any NativeWind wrapper) appears as an ancestor anywhere in that tree, every `@expo/ui`-native element nested inside it renders as an unrecognized RN component instead of real SwiftUI — typically **blank**, not an error. The whole subtree from the `ForgeHost` down must be `@expo/ui`-native if anything inside needs to render or respond to touch.
2. **The one supported exception**: `ListItem`'s `leading`/`trailing` slot props. `@expo/ui`'s own implementation explicitly wraps whatever is passed there in `RNHostView matchContents` — a deliberate, code-level bridge, not automatic. RN content (icon chips, avatar initials) is safe there. It is not safe as `ListItem`'s `children` (the label) — that path only auto-wraps bare strings, so pass a plain string (or `@expo/ui`'s own `Text`), never an RN `Text`-based component.

### @expo/ui Host sizing — `matchContents`, or the leaf silently collapses/overflows

Every `@expo/ui` universal leaf (`TextInput`, `Switch`, `Checkbox`, `Button`, ...) renders inside a `Host`, and `Host.matchContents` (`{vertical?, horizontal?}` or `boolean`) controls whether the Host's RN-side view shrinks to the native content's intrinsic size. **It defaults to `false` on all axes** — with no explicit width/height style on the leaf, the RN-side view gets whatever ambiguous size plain RN flex layout hands it. `packages/fiance-ui/src/primitives/_host/ForgeHost.tsx`'s `useHostWrap(node)` didn't forward any `matchContents`, so every primitive built on it inherited this:

- **`TextInput`/`Input`** (`primitives/input/index.tsx`) — a size-less Host means the field effectively doesn't render/work — this is why text inputs can look broken anywhere they're used, sheets included. Fix: `matchContents={{ vertical: true }}` (hug height to content, still fill the row's width) — matches the official example at https://docs.expo.dev/versions/latest/sdk/ui/universal/textinput/.
- **`Switch`/`Checkbox`** (`primitives/switch/`, `primitives/checkbox/`) — both wrap `@expo/ui`'s SwiftUI `Toggle`. Same missing hint, opposite symptom: the Host stretches to fill the rest of its flex-row (both are typically the trailing child after a `flex-1` label) → a stretched native `Toggle` overflows. Fix: `matchContents={true}` (hug both axes) plus `style={{ alignSelf: 'center' }}` — a `matchContents` Host doesn't reliably inherit the parent row's `items-center` on its own, so the control can sit visibly off-center against its label without the explicit `alignSelf`.
- **`Button`** (`primitives/button/index.tsx`) — **a size-less Host does NOT reliably fill its RN parent in practice**, contrary to what the docs imply. The `fill` prop (`useHostWrap(<ExpoButton .../>, fill ? { matchContents: { vertical: true }, style: { width: '100%' } } : { matchContents: true })`) makes this explicit: `fill` for stacked/`flex-1`-half buttons (`ConfirmSheet`, `RenameSheet`, `DatePickerModal`/`TimePickerModal`, `DeleteButton`), omitted (hug, matching the doc's own canonical `<Host matchContents><Button/></Host>` pattern) for nav-bar/inline buttons (`EmptyState`, `SaveHeaderButton`). Without this, buttons render as a small overflowing pill with a mismatched hit-test area — device-confirmed as **unclickable**, not just visually wrong.

Because different leaves need different (or no) `matchContents`, the fix lives per-primitive, not in the shared wrapper: `useHostWrap(node, hostProps?)` takes an optional second argument forwarded to the `ForgeHost` it creates (`hostProps` is ignored when collapsing into an ancestor's Host, since a Host's sizing is fixed at mount) — e.g. `useHostWrap(<ExpoSwitch {...props} />, { matchContents: true })`.

### @expo/ui Button — `variant` fights a custom `backgroundColor` (double-chrome halo)

`variant="filled"`/`"outlined"` map to SwiftUI `.buttonStyle(.borderedProminent)`/`.bordered` (`node_modules/@expo/ui/src/universal/Button/index.ios.tsx`) — a **native chrome layer** (its own background, shape, insets) applied *underneath* whatever custom `style` (`backgroundColor`/`borderRadius`/`padding`) is passed. When a button also sets a custom `backgroundColor` (our Garden Press pill buttons), the native chrome shows through as a mismatched halo around/behind the custom pill, and can make Confirm/Cancel-style stacked buttons visually overlap ("button in button").

**Fix**: for any button with its own `style.backgroundColor`, use `variant="text"` (`.plain` — no native chrome at all) so the custom `style` is the sole visual source. `.plain` has **no automatic white-on-fill contrast** (unlike `.borderedProminent`), so also force the label color via the `modifiers` escape hatch: `modifiers={[foregroundStyle(colors.onPrimary)]}` (`foregroundStyle` from `@expo/ui/swift-ui/modifiers`). Buttons that rely on the native chrome alone for their background (no custom `backgroundColor` set) don't need this — only convert ones with a color clash. Long labels on a narrowed (e.g. half-width) custom button can still overflow; `modifiers={[minimumScaleFactor(0.75)]}` lets SwiftUI shrink-to-fit instead of clipping/overflowing.

### @expo/ui BottomSheet — explicit `backgroundColor`, or short content leaves a gap to the backdrop

A `BottomSheet` given a static `snapPoints` detent taller than its actual content (e.g. `ConfirmSheet`'s `['40%']` — see below) leaves a gap between the content's bottom and the detent's bottom. If the sheet's own `backgroundColor` isn't set, that gap shows the screen behind the sheet through a translucent default material — visible as a "washed out"/see-through area, and on `CompanionPickerModal`'s all-`@expo/ui`-native rebuild (no inner RN `View` to provide an opaque backing at all) the *entire* sheet ghosts, not just the gap. Fix: always pass `backgroundColor` to `BottomSheet`/`Sheet` — `colors.surface` (a `ForgeTheme` token matching the `bg-background-0` Tailwind value) for the shared `fiance-ui` sheets, or the app's own Garden Press `theme.card` for app-level sheets like `CompanionPickerModal`.

Also: a fixed `snapPoints` percentage (added to fix the very-tall default `medium`/`large` fallback for short dialogs — see the touch-desync section above) needs to be sized to actually fit the content; too generous and you get the visible-gap symptom above, too tight and content clips.

### @expo/ui DateTimePicker — `display` defaults to a compact chip, and iOS doesn't need a sheet at all

`@expo/ui/community/datetime-picker`'s `DateTimePicker` (self-hosting — no `ForgeHost`/`Host` wrapper needed, like `community/bottom-sheet` and `community/segmented-control`) defaults `display` to something that renders as a small tappable date/time **chip**, not the always-visible full picker — set it explicitly: `display="inline"` for `mode="date"`, `display="spinner"` for `mode="time"` (the classic always-visible wheel; `mode="time"`'s continuous scroll means `onValueChange` fires on every tick, so unlike date-mode it must **not** auto-commit — buffer in local state and commit on an explicit Confirm tap, mirroring the pre-existing wheel picker's UX).

On iOS, native date/time pickers don't need their own bottom sheet — `packages/fiance-ui/src/components/form/FormSection.tsx`'s `DateRow`/`TimeRow` expand the `DateTimePicker` **inline** directly under the row on iOS (tap to toggle, Today/Confirm + Clear links below), bypassing `DatePickerModal`/`TimePickerModal` entirely there. Android/web keep the sheet-based modal (`DatePickerModal`/`TimePickerModal`, which still branch `Platform.OS === "web"` for the original hand-rolled calendar/wheel vs. the native `DateTimePicker` for Android).

### Theme constants over hardcoded hex

`ForgeTheme.colors` (`packages/fiance-ui/src/theme/types.ts`/`default.ts`) is the source of truth for cross-cutting colors used in inline `style`/`modifiers` (Tailwind classes don't reach `@expo/ui` native props). Beyond `primary`/`destructive`: `onPrimary` (label color on a solid fill — `foregroundStyle(colors.onPrimary)`) and `surface` (sheet/card background, matches `bg-background-0` — `backgroundColor={colors.surface}`). Add a token here rather than inlining a new hex literal.

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

NativeWind v5 / Tailwind v4. Tokens in `apps/mobile/global.css` (`@theme inline`), imported from `@fiance/ui/tailwind-theme`. Garden Press palette: primary clay `#b96a4a`, accent olive `#6e7a4a` / mustard `#c9922f`, paper `#f2ece0` bg, card `#fdfaf1` bg, ink `#2a2418`. Type stack: Fraunces (Display component), Caveat (Script component), Inter (Label + body). `apps/mobile/lib/theme.ts` re-exports hex literals from `packages/fiance-ui/src/garden-theme.ts` for JS consumers. Shared UI components live in `packages/fiance-ui/src/components/` (see "`@fiance/ui` — vendored UI components" above) and are re-exported through thin wrappers in `apps/mobile/components/` — notably `FormSection.tsx` exports form building blocks (SectionTitle, FormCard, InputRow, ToggleRow, ChipSelect). Primitive GP components: `Display`, `Script`, `Label`, `Card`, `Chip`, `Avatar`, `Sprig`, `Postit`, `Underline`, `Seal`.

### CI/CD

- **Web**: Push to main/master → `.github/workflows/deploy-web.yml` → Cloudflare Pages (`apps/mobile/dist/`)
- **Android APK**: Push to version tags → `.github/workflows/build-apk.yml` → EAS Build (runs from `apps/mobile/`) → artifact upload
