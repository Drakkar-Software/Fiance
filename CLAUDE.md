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
- `apps/mobile/public/llms.txt` — add/update the relevant section
- Blog posts: add slug to `BLOG_PUBLISH_PRIORITY` in `blog-publish-dates.ts` (sitemap is generated at build)
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
3. **Starfish sync** (optional) — `apps/mobile/lib/starfish.ts` and `packages/fiance-sdk/src/sync/backup.ts` push AES-256-GCM encrypted backups to `https://sync.drakkar.software/sync` (drakkar_sync, `/v1/dk` namespace — migrated from the retired `/v1/fiance` namespace; see "Sync namespace migration: `fiance` → `dk`" below). Triggered via `notifySync()` after store mutations.

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

### @expo/ui BottomSheet — the `enableDynamicSizing={false}` fix is sufficient for plain RN content

`packages/fiance-ui/src/primitives/bottom-sheet/index.tsx` (`BottomSheet`, re-exported as `SheetShell`/`Sheet`) wraps `@expo/ui/community/bottom-sheet` — the `@gorhom/bottom-sheet` drop-in. On iOS this is backed by a SwiftUI `.sheet` that hosts RN children through an `RNHostView` bridge whose touch handler attaches once, on first appear, with no retry. Traced through `node_modules/@expo/ui/src/community/bottom-sheet/BottomSheet.ios.tsx`: without an explicit `snapPoints`, `enableDynamicSizing` defaults to `true` → `fitToContents = true` → SwiftUI re-measures and resizes the sheet *after* it's presented, re-parenting the `RNHostView` and desyncing its touch handler — RN `Pressable` rows show a press animation but `onPress` never fires. It can also get stuck at the `.medium` fallback detent.

**Fix (applied in the primitive)**: on iOS only, pass `enableDynamicSizing={false}`. With no `snapPoints`, detents fall back to native `['medium','large']` — no post-present resize, so the bridge never desyncs. (`parseSnapPoint` does **not** accept the strings `'medium'`/`'large'` — passing `snapPoints={['medium','large']}` explicitly would `parseFloat` them to `NaN`.) Android (Material3) and web (vaul) were never affected — fix is iOS-only.

**This fix is sufficient on its own — plain RN content (`Pressable`/`TextInput`/`ScrollView`) works reliably inside this primitive on iOS.** Proven by every sheet in the app: `GuestSheet` (`guests/[id].tsx`), `ConfirmSheet`, `RenameSheet`, `ContributorsCard`, `InviteQRSheet`, `PaywallSheet`. Give an explicit `snapPoints` (e.g. `["55%", "85%"]`, matching `GuestSheet`) rather than relying on `fitToContents` auto-sizing, and cap any scrollable region with `ScrollView style={{ maxHeight }}`.

**Do not rebuild sheet content from `@expo/ui`-native components (`Column`/`List`/`ListItem`/`Text`/`TextInput`/`Button` inside a `ForgeHost`) as a default move, and never for a sheet with a scrollable or searchable list.** `apps/mobile/components/CompanionPickerModal.tsx` tried this for its searchable guest list and failed three separate ways on-device (collapsed layout, blank/greedy list, dead buttons) before being reverted to the plain-RN pattern above — the touch-desync it was defending against was already fixed centrally by `enableDynamicSizing={false}`. A separate mature Drakkar app (`Astrolab2/frontend/mobile2`, extensive `@expo/ui` bottom-sheet usage) documents the same hard-won rule independently: `@expo/ui`'s `Column`/`List` sizing has no `flex` support in the iOS style transform (a `VStack` needs an explicit numeric `height` or it collapses to ~0), so an all-native tree fights height/scroll/touch simultaneously for anything beyond a short, static list. Their answer for scroll-heavy content is a full-screen modal, not a sheet. If a genuinely static (non-scrolling) row-of-choices/menu sheet ever misbehaves after confirming `snapPoints` are set, an all-native rebuild is the last resort, not the first — and two non-obvious rules apply if you go there:

1. **`@expo/ui`'s SwiftUI tree is reconciled separately from React Native's.** The instant a plain RN element (`View`, `Pressable`, or any NativeWind wrapper) appears as an ancestor anywhere in that tree, every `@expo/ui`-native element nested inside it renders as an unrecognized RN component instead of real SwiftUI — typically **blank**, not an error. The whole subtree from the `ForgeHost` down must be `@expo/ui`-native if anything inside needs to render or respond to touch.
2. **The one supported exception**: `ListItem`'s `leading`/`trailing` slot props. `@expo/ui`'s own implementation explicitly wraps whatever is passed there in `RNHostView matchContents` — a deliberate, code-level bridge, not automatic. RN content (icon chips, avatar initials) is safe there. It is not safe as `ListItem`'s `children` (the label) — that path only auto-wraps bare strings, so pass a plain string (or `@expo/ui`'s own `Text`), never an RN `Text`-based component.

### @expo/ui Host sizing — `matchContents`, or the leaf silently collapses/overflows

Every `@expo/ui` universal leaf (`TextInput`, `Switch`, `Checkbox`, `Button`, ...) renders inside a `Host`, and `Host.matchContents` (`{vertical?, horizontal?}` or `boolean`) controls whether the Host's RN-side view shrinks to the native content's intrinsic size. **It defaults to `false` on all axes** — with no explicit width/height style on the leaf, the RN-side view gets whatever ambiguous size plain RN flex layout hands it. `packages/fiance-ui/src/primitives/_host/ForgeHost.tsx`'s `useHostWrap(node)` didn't forward any `matchContents`, so every primitive built on it inherited this:

- **`TextInput`/`Input`** (`primitives/input/index.tsx`) — a size-less Host means the field effectively doesn't render/work — this is why text inputs can look broken anywhere they're used, sheets included. Fix: `matchContents={{ vertical: true }}` (hug height to content, still fill the row's width) — matches the official example at https://docs.expo.dev/versions/latest/sdk/ui/universal/textinput/.
- **`Switch`/`Checkbox`** (`primitives/switch/`, `primitives/checkbox/`) — both wrap `@expo/ui`'s SwiftUI `Toggle`. Same missing hint, opposite symptom: the Host stretches to fill the rest of its flex-row (both are typically the trailing child after a `flex-1` label) → a stretched native `Toggle` overflows. Fix: `matchContents={true}` (hug both axes) plus `style={{ alignSelf: 'center' }}` — a `matchContents` Host doesn't reliably inherit the parent row's `items-center` on its own, so the control can sit visibly off-center against its label without the explicit `alignSelf`.
- **`Button`** (`primitives/button/index.tsx`) — **a size-less Host does NOT reliably fill its RN parent in practice**, contrary to what the docs imply. The `fill` prop makes stretch-to-fill explicit. **Do NOT use `style={{ width: '100%' }}`** — `UniversalStyle.width` casts straight to `number` (`transformStyle.ios.ts`), so a percentage string is silently a no-op. The working mechanism is the SwiftUI `frame({ maxWidth: Infinity })` modifier (from `@expo/ui/swift-ui/modifiers`) applied to the Button, plus `matchContents: { vertical: true }` on the Host — the same "fill available width" pattern `@expo/ui`'s own ScrollView/BottomSheet use. Use `fill` for stacked/`flex-1`-half buttons (`ConfirmSheet`, `RenameSheet`, `DatePickerModal`/`TimePickerModal`, `DeleteButton`, `FormActions`), omit it (hug, `matchContents: true`, matching the doc's canonical `<Host matchContents><Button/></Host>`) for nav-bar/inline buttons (`EmptyState`, `SaveHeaderButton`). Without `fill`, filled buttons render as a small overflowing pill whose hit-test area doesn't match the visual — device-confirmed as **unclickable**, not just ugly.

Because different leaves need different (or no) `matchContents`, the fix lives per-primitive, not in the shared wrapper: `useHostWrap(node, hostProps?)` takes an optional second argument forwarded to the `ForgeHost` it creates (`hostProps` is ignored when collapsing into an ancestor's Host, since a Host's sizing is fixed at mount) — e.g. `useHostWrap(<ExpoSwitch {...props} />, { matchContents: true })`.

### @expo/ui Button — `variant` fights a custom `backgroundColor` (double-chrome halo)

`variant="filled"`/`"outlined"` map to SwiftUI `.buttonStyle(.borderedProminent)`/`.bordered` (`node_modules/@expo/ui/src/universal/Button/index.ios.tsx`) — a **native chrome layer** (its own background, shape, insets) applied *underneath* whatever custom `style` (`backgroundColor`/`borderRadius`/`padding`) is passed. When a button also sets a custom `backgroundColor` (our Garden Press pill buttons), the native chrome shows through as a mismatched halo around/behind the custom pill, and can make Confirm/Cancel-style stacked buttons visually overlap ("button in button").

**Fix**: for any button with its own `style.backgroundColor`, use `variant="text"` (`.plain` — no native chrome at all) so the custom `style` is the sole visual source. `.plain` has **no automatic white-on-fill contrast** (unlike `.borderedProminent`), so also force the label color. Long labels on a narrowed (e.g. half-width) custom button can still overflow; `modifiers={[minimumScaleFactor(0.75)]}` lets SwiftUI shrink-to-fit instead of clipping/overflowing.

**Setting the label color cross-platform — `foregroundStyle` is iOS-only.** `foregroundStyle` (like all `@expo/ui/swift-ui/modifiers`) is a **SwiftUI modifier with no Jetpack-Compose equivalent** — on Android it's a silent no-op (the shim in `_host/modifiers` picks the real modifier on iOS/Android but Compose ignores this one), and the universal `@expo/ui` Button never forwards a content color to Compose. So a raw `modifiers={[foregroundStyle(...)]}` colors the label on iOS but leaves Android with Material's **dark default content color → invisible on our clay/red fills**. The shared `Button` primitive (`packages/fiance-ui/src/primitives/button/index.tsx`) now exposes a **`labelColor` prop** that handles both: iOS applies `foregroundStyle(labelColor)`; Android renders the label as a colored `@expo/ui` `Text` child (`textStyle={{ color }}` → native Compose `Text.color`) since the universal Button uses `children` as its content; web is unchanged (the modifier is a no-op stub). **Always pass `labelColor={colors.onPrimary}` on colored-fill buttons — never the raw `foregroundStyle` modifier.** Same root cause hits the **native segmented control**: `@expo/ui/community/segmented-control` paints the active segment with `tintColor` but leaves the label at Material's dark default (no content-color passthrough), so on Android `apps/mobile/components/SegmentedControl.tsx` renders a **custom pill toggle** (clay `bg-primary-500` fill + `text-white` active label) on Android instead of the native control — iOS keeps the native control (its active label is already white on tint), web keeps `SegmentedControl.web.tsx`.

### @expo/ui BottomSheet — explicit `backgroundColor`, or short content leaves a gap to the backdrop

A `BottomSheet` whose native chrome color doesn't match its content shows a mismatched band around the rounded content card (and where a static `snapPoints` detent is taller than the content, the extra gap shows the screen behind through the translucent default material — "washed out"; an all-`@expo/ui`-native rebuild with no inner RN `View` backing has no content color at all, so the *entire* sheet ghosts — one more reason to avoid that approach, see the section above). **This is now handled centrally**: the `BottomSheet` primitive (`primitives/bottom-sheet/index.tsx`) defaults its `backgroundStyle` to the `ForgeTheme` `surface` color, so every sheet's chrome matches content automatically — callers only pass `backgroundColor` to override. `surface` is themed to the warm Garden Press card (`#fdfaf1`, set in the app's `ForgeThemeProvider` override in `apps/mobile/app/_layout.tsx`), not stark white, so sheets read as cream like the rest of the app. **Corollary**: an inner content card's own background (e.g. `bg-background-0` white vs `bg-accent-card` cream) must match `surface` or you reintroduce the band — align inner cards to `bg-accent-card`.

Also: a fixed `snapPoints` percentage (added to fix the very-tall default `medium`/`large` fallback for short dialogs — see the touch-desync section above) needs to be sized to actually fit the content; too generous and you get the visible-gap symptom above, too tight and content clips.

### @expo/ui DateTimePicker — `display` defaults to a compact chip, and iOS doesn't need a sheet at all

`@expo/ui/community/datetime-picker`'s `DateTimePicker` (self-hosting — no `ForgeHost`/`Host` wrapper needed, like `community/bottom-sheet` and `community/segmented-control`) defaults `display` to something that renders as a small tappable date/time **chip**, not the always-visible full picker — set it explicitly: `display="inline"` for `mode="date"`, `display="spinner"` for `mode="time"` (the classic always-visible wheel; `mode="time"`'s continuous scroll means `onValueChange` fires on every tick, so unlike date-mode it must **not** auto-commit — buffer in local state and commit on an explicit Confirm tap, mirroring the pre-existing wheel picker's UX).

On iOS, native date/time pickers don't need their own bottom sheet — `packages/fiance-ui/src/components/form/FormSection.tsx`'s `DateRow`/`TimeRow` expand the `DateTimePicker` **inline** directly under the row on iOS (tap to toggle, Today/Confirm + Clear links below), bypassing `DatePickerModal`/`TimePickerModal` entirely there. Android/web keep the sheet-based modal (`DatePickerModal`/`TimePickerModal`, which still branch `Platform.OS === "web"` for the original hand-rolled calendar/wheel vs. the native `DateTimePicker` for Android).

### Standard sheet + form-action wrappers, and the export-subpath build trap

Two shared wrappers keep the native UI uniform — prefer them over hand-rolling:
- `SheetScaffold` (`@fiance/ui/components`) — the standard bottom-sheet shell: always paints `backgroundColor={colors.surface}`, renders `title` in a consistent place, applies rounded-top padding, defaults to a compact iOS detent, and takes `footer`/`scrollable`. `ConfirmSheet`/`RenameSheet` are built on it; new sheets should be too.
- `FormActions` (`@fiance/ui/components`, re-exported via `@/components/FormSection`) — the standard primary+cancel row (native `Button`, `fill`, `variant="text"`+`foregroundStyle` fill pattern). Replaced the repeated `bg-primary-500`/`bg-accent-paper` Pressable pill pairs across the CRUD screens.

**Build trap**: `@fiance/ui`'s export map lists `import` → `dist/...` and `source`/`react-native`/`require` → `src/...`. Metro resolves the established subpaths (`.`, `./components`, `./theme`) from `src`, but a **newly added** export subpath (we tried `./primitives/host`) resolved to the unbuilt `dist/` path on web and broke `expo export --platform web` (`Unable to resolve module`). Don't add per-file export subpaths for RN/Metro consumers — **re-export through the `@fiance/ui/components` barrel** instead (that's how `ForgeHost` is exposed).

### @expo/ui `swift-ui/modifiers` crashes the web bundle at load — never import it directly

`@expo/ui/swift-ui/modifiers` runs `const ExpoUI = requireNativeModule('ExpoUI')` at **module top-level** (`node_modules/@expo/ui/src/swift-ui/modifiers/index.ts`), and that subpath has **no `.web` fallback** (single `default` export condition → the iOS source). So any file that statically `import`s a modifier from it (`frame`, `foregroundStyle`, `minimumScaleFactor`, `labelsHidden`, …) makes the **web** bundle evaluate that module on load and throw `Uncaught Error: Cannot find native module 'ExpoUI'` — the web export *succeeds* (resolution is fine) but the page fails to render at runtime. `pnpm build:web` won't catch it; only loading the page does. This bit us after migrating the CRUD Save/Cancel pairs to the native `FormActions`/`Button` (which use these modifiers). Note the universal (`.`) and `community/*` subpaths are safe — they ship pure-RN `.tsx`/`.web.tsx` fallbacks and don't eagerly require the native module.

**Fix (in place)**: a platform-split shim — `packages/fiance-ui/src/primitives/_host/modifiers.ts` re-exports the real modifiers from `@expo/ui/swift-ui/modifiers` (picked on iOS/Android, where the native module exists), and `modifiers.web.ts` provides no-op stubs (the `@expo/ui` universal web fallbacks ignore the `modifiers` prop, so stubs never affect rendering). Metro resolves `.web.ts` for web. **All fiance-ui code must import these modifiers from `../_host/modifiers`, never from `@expo/ui/swift-ui/modifiers` directly** — add any newly-needed modifier to both shim files. Verify after a web export with `grep -c ExpoUI apps/mobile/dist/_expo/static/js/web/entry-*.js` → must be `0`.

### iOS home-screen widget (`expo-widgets`)

`PlanningWidget` (iOS Small + Medium) mirrors the home dashboard: a countdown plus a **priority-ordered** line list — warnings first (overdue tasks → deposits due → expiring quotes → critical unstarted → guests without a table → over-budget), then upcoming agenda events, then next tasks. Shorter widgets slice to capacity, so with no warnings the space fills with agenda/tasks. Config plugin lives in `app.json` (`bundleIdentifier: …app.widgets`, `groupIdentifier: group.software.drakkar.fiance.app`) and generates the widget target + App Group entitlement at prebuild — CNG-only, never hand-edit `ios/`.

Four rules, all non-obvious:

1. **The `'widget'` directive stringifies the function.** `babel-preset-expo`'s `widgets-plugin` replaces the `createWidget('PlanningWidget', fn)` component with a **string of `fn`'s own source**, stored in the App Group and evaluated natively inside the widget extension. So the widget fn (`apps/mobile/widgets/PlanningWidget.tsx`) must be **fully self-contained**: every color/size is an inline literal, and it references only the injected `@expo/ui/swift-ui` components/modifiers + JS globals. No imported constants (`GP`, theme), no outer-scope consts, no shared helpers — they are all `undefined` at native eval time.
2. **Never import the widget from cross-platform code.** It imports `@expo/ui/swift-ui`, which would crash the web bundle (see the `ExpoUI` note above). It's reached only through a platform-split bridge: `apps/mobile/lib/widget.ts` (web/Android **no-op stub**) vs `widget.ios.ts` (imports `PlanningWidget` + `buildWidgetData`, calls `PlanningWidget.updateSnapshot(...)`). App code imports **only** `@/lib/widget`. This is what keeps `grep -c ExpoUI …web/entry-*.js` at `0`.
3. **Data is pre-localized in JS.** The native widget can't call i18next, so `apps/mobile/lib/widget-data.ts` (`buildWidgetData()`) returns ready-to-render strings (icons are SF Symbol names). It reuses the home thresholds, planning selectors, `computeBudgetSummary`, and `getPrimaryEvent` — keep it in lockstep with `home/index.tsx`.
4. **Refresh is push-based.** `WidgetInitializer` (`lib/providers.tsx`, mounted under `activeWedding` in `app/_layout.tsx`, iOS-only) calls `updateWidget()` on a debounced subscription to the planning/vendors/guests/wedding/events stores and on app foreground. A dismissible home banner (`useWidgetBanner` + the shared `components/HomeBanner.tsx`, iOS-only, AsyncStorage flag) tells the user how to add it.

### Theme constants over hardcoded hex

`ForgeTheme.colors` (`packages/fiance-ui/src/theme/types.ts`/`default.ts`) is the source of truth for cross-cutting colors used in inline `style`/`modifiers` (Tailwind classes don't reach `@expo/ui` native props). Beyond `primary`/`destructive`: `onPrimary` (label color on a solid fill — `foregroundStyle(colors.onPrimary)`) and `surface` (sheet/card background, matches `bg-background-0` — `backgroundColor={colors.surface}`). Add a token here rather than inlining a new hex literal.

### Starfish sync — encryption contract

The `wedding` collection uses **client-side AES-256-GCM encryption**. The server stores an opaque `{ "_encrypted": "<base64>" }` blob and never sees plaintext. All server collections are configured with `encryption: "none"` (server pass-through; encryption is handled entirely on the client by `SyncManager`).

**Critical**: `notifySync()` must call `store.set(() => doc)` — this marks `dirty=true`, triggers `flush()`, which calls `syncManager.push()` and encrypts the payload. **Never use `store.restore(doc)` for pushing**: `restore()` only updates local Zustand state without marking dirty, so `flush()` never runs and nothing reaches the server. The `isRestoring` guard (`isRestoring = true` around `set()`) prevents the store subscription from redundantly calling `restoreFromBackup` on our own outgoing data.

### Sync namespace migration: `fiance` → `dk`

The client was migrated off a hand-rolled starfish-spaces wrapper onto the `@drakkar.software/dk-spaces-sdk` / `dk-spaces-platform-sdk` / `dk-spaces-analytics-sdk` family, and the sync namespace moved from the retired `fiance` server app (`/v1/fiance`) to `dk_spaces`'s **`dk`** namespace (`/v1/dk`, same host — a pure client repoint, the server collections/paths/encryption are identical). All six `@drakkar.software/starfish-*` packages were bumped to `3.0.0-alpha.65` (dk-spaces-sdk's peer floor) in lockstep across `apps/mobile/package.json` and `packages/fiance-sdk/package.json`.

**The one correctness-critical fix, not just a string swap**: the `fiance` server granted `spaces`/`devices` access via a synthesized `self` role; `dk` requires explicit `cap:read/write:spaces` / `cap:read/write:devices` scopes. starfish-spaces' `defaultSpaceLayout.accountScope`/`linkedDeviceScope` mint `collections:["*"]` — the server synthesizes `cap:read:*` from that, which never matches `cap:read:spaces`, so every `_spaces`/`_devices` op 403s under `dk`. Fixed by `packages/fiance-sdk/src/core/layout.ts` — a custom `SpaceLayout` (spread `defaultSpaceLayout`, override just `accountScope`/`linkedDeviceScope` with dk-spaces-sdk's explicit-collection versions), installed via `configureSpaces({ layout })` inside `configureFiance()`. Mirrors how the OctoVault/OctoChat reference apps solved the identical problem. Built **lazily inside `fianceLayout()`**, not at module scope — an eager top-level `...defaultSpaceLayout` spread would evaluate on every import of `@fiance/sdk` (via the barrel), crashing any test that partially mocks `@drakkar.software/starfish-spaces` without `defaultSpaceLayout`, even if that test never calls `configureFiance()`.

`configureFiance(cfg, kv)` now takes `{ syncBase }` + a `{get,set,remove}`-shaped `KvAdapter` (dk-spaces-platform-sdk's `kvGet/kvSet/kvRemove`) and internally calls `configureDKSpaces({ syncBase, syncNamespace: 'dk' })` + `configureKv(kv)` (which also wires `configureSpaces`/`configureSpaceAccessStore` under the **fixed** `dk.spaceaccess.` KV prefix — not configurable) + installs the custom layout. `apps/mobile/lib/server.ts`/`identity.ts`/`app/wedding/[id].tsx` source the namespace from `getSyncNamespace()` (re-exported from `@fiance/sdk`) rather than a hardcoded string — single source of truth, seeded once at boot.

Native platform crypto moved from a manual `configurePlatform({crypto: QuickCrypto})` + `globalThis.crypto = QuickCrypto` assignment in `providers.tsx` to `dk-spaces-platform-sdk`'s `configureStarfishPlatform()` — it's platform-split (`index.js`/`index.native.js`), so Metro/Node resolve the right implementation automatically; the native file's top-level `install()` from `react-native-quick-crypto` already exposes `globalThis.crypto.subtle` (verified: `getCrypto()`'s fallback in starfish-protocol checks exactly that), so the old manual assignment (needed by starfish-spaces' `account-seal.ts` for `joinSpaceByLink`) is no longer necessary. **Kept the app's own native Argon2id `hash-wasm` shim** (`apps/mobile/lib/hash-wasm-shim.native.ts`, ~150ms via quick-crypto's OpenSSL binding) instead of switching to `dk-spaces-platform-sdk`'s generic pure-JS `@noble/hashes` shim (~15–45s on Hermes) — that would have been a real regression, not a simplification.

Analytics (`apps/mobile/lib/analytics.ts`) swapped the hand-rolled `SunglassesCore.create()` + `StarfishClient` + `StarfishAnalyticsAdapter` wiring for `dk-spaces-analytics-sdk`'s `createTelemetryClient`/`createTelemetry`/`TelemetryProvider`/`useTelemetryScreenTracking` — the SDK's `TelemetryProvider` hardcodes the exact same `autoCaptureErrors`/`includeNonFatalGlobalErrors` config the app was already passing manually, so this is a behavior-neutral swap, not a config change. The four direct `@drakkar.software/sunglasses-*` deps were dropped from `apps/mobile/package.json` (now transitive via the analytics SDK).

**Existing installs**: this was a fresh-start cutover, not a data migration — a wedding's `spaceId`/`syncNamespace` provisioned under `fiance` is meaningless under `dk` (different registry, different KV credential prefix, different cap model), but since local Zustand/KV state is always the offline-first source of truth, there's nothing to migrate over the wire. `WeddingRegistryEntry.syncNamespace` (stamped at provisioning time in `space-provision.ts`) records which namespace a `spaceId` belongs to; `needsNamespaceResync()` (`apps/mobile/lib/space-resync.ts`) flags a mismatch against the currently configured namespace. The Settings "Reconnect this wedding" action + matching Home banner call `resyncWeddingToCurrentNamespace()`, which clears the stale `spaceId`/`weddingNodeId`/`syncNamespace` and re-runs the *exact same first-sync path a brand-new wedding takes* (re-provision → `pushSpaceSnapshot`) — no bespoke relocate/decrypt logic needed. Existing invite/RSVP links are invalidated by this (new node IDs under the new space) and must be regenerated after.

### Adding a new store

Create `apps/mobile/store/useNewStore.ts` with Zustand `create()`. Add KV key to `apps/mobile/db/schema.ts`. Wire hydration/write-through in `apps/mobile/lib/persistence.ts` (`hydrateAllStores` and `clearAllStores`). Call `notifySync()` on mutations.

### Adding a new screen

Create file under `apps/mobile/app/(tabs)/feature/`. Expo Router auto-discovers it. Add tab entry in `apps/mobile/app/(tabs)/_layout.tsx` if it's a new tab.

### `LegendList` — pass `extraData` when a row reads state outside its own item

`LegendList` (`@legendapp/list`) memoizes rows by item identity and only re-invokes `renderItem` for a row when that row's item reference changes. If a row's visual state is derived from something *other* than the item itself — e.g. a lookup into a second Zustand store keyed by the item's id (like `comm.recipients.find((r) => r.guestId === guest.id)` in `apps/mobile/app/(tabs)/guests/communication/[id].tsx`) — toggling that external state does not change the item reference, so the row silently keeps rendering stale content. It only catches up later when something unrelated forces a fresh set of item references (e.g. the foreground re-hydrate in `providers.tsx`), which can look like a ~30s hang instead of an instant UI bug.

**Fix**: pass `extraData={theExternalState}` (or a `Set`/`Map` derived from it) to `LegendList` so a change in that external state forces `renderItem` to re-run for all rows. This is safe even when the lookup is a component reading its own store selector directly inside the row (e.g. `GuestCard` in `apps/mobile/app/(tabs)/guests/index.tsx`) — that pattern doesn't need `extraData` since the row component re-renders itself via its own hook subscription regardless of list memoization.

### Blog (Le Carnet) — publication dates and JSON-LD

Every blog post must expose **`datePublished`** and **`dateModified`** in JSON-LD via `buildBlogPostingNode()` in `apps/mobile/lib/blog.ts`.

| Field | Source | JSON-LD | When to change |
|-------|--------|---------|----------------|
| `date` | `BLOG_PUBLISH_DATES` in `blog-publish-dates.ts`, or explicit `date` on the post / `postPair()` | `datePublished` | **Once**, when the article is first published. Never bump on edits. |
| `updated` | `BLOG_CONTENT_UPDATED` in `blog-publish-dates.ts`, or explicit `updated` on `postPair()` | `dateModified` | **Only** when article content changes (title, excerpt, or `sections`). Do not set when wiring imports, reordering, or updating sitemap/`llms.txt` alone. |

**Adding a new article**

1. Write content in `blog-posts-*.ts` (or inline in `blog.ts` for legacy posts).
2. Add the slug to `BLOG_PUBLISH_PRIORITY` in `blog-publish-dates.ts`.
3. Wire the post in `blog.ts`, and update `llms.txt`.
4. Do **not** add a `BLOG_CONTENT_UPDATED` entry yet.

**Editing article content**

1. Change title, excerpt, or sections.
2. Add or update `BLOG_CONTENT_UPDATED[slug]` with the edit date (`YYYY-MM-DD`).
3. Optionally align sitemap `<lastmod>` on next deploy (auto-generated from publish/update dates).

`postPair()` resolves `date` and `updated` from the maps by default. Inline posts in `blog.ts` / `blog-posts-3-10.ts` must set `date: getBlogPublishDate(slug)` manually; add `updated` only after a content edit.

Run `pnpm test` — `blog-jsonld.test.ts` asserts every slug has valid `datePublished` / `dateModified`.

### Styling

NativeWind v5 / Tailwind v4. Tokens in `apps/mobile/global.css` (`@theme inline`), imported from `@fiance/ui/tailwind-theme`. Garden Press palette: primary clay `#b96a4a`, accent olive `#6e7a4a` / mustard `#c9922f`, paper `#f2ece0` bg, card `#fdfaf1` bg, ink `#2a2418`. Type stack: Fraunces (Display component), Caveat (Script component), Inter (Label + body). `apps/mobile/lib/theme.ts` re-exports hex literals from `packages/fiance-ui/src/garden-theme.ts` for JS consumers. Shared UI components live in `packages/fiance-ui/src/components/` (see "`@fiance/ui` — vendored UI components" above) and are re-exported through thin wrappers in `apps/mobile/components/` — notably `FormSection.tsx` exports form building blocks (SectionTitle, FormCard, InputRow, ToggleRow, ChipSelect). Primitive GP components: `Display`, `Script`, `Label`, `Card`, `Chip`, `Avatar`, `Sprig`, `Postit`, `Underline`, `Seal`.

### CI/CD

- **Web**: Deploy via Cloudflare Workers (`apps/mobile/wrangler.toml`, static assets in `apps/mobile/dist/`). Build with `pnpm --filter fiance build:web`; optional `BUILD_DATE=YYYY-MM-DD` env controls which blog posts are included in the export/sitemap.
- **Android APK**: EAS Build from `apps/mobile/` on version tags (see project EAS config).

## App Store Optimization (ASO)

Source of truth for the Apple App Store listing copy. The app ships FR-primary (France storefront) with English as the second market. Live listing today: **"Fiancé – Organiser son mariage"** (id `6786687256`). This section captures the ASO rules and the optimized metadata to ship — keep it in sync whenever features or store copy change. Marketing wording lives in `apps/mobile/i18n/locales/{fr,en}/marketing.json`; `app.json` `description` is the web/PWA description, **not** the App Store one (the App Store fields are managed in App Store Connect, per-localization).

### How Apple indexes metadata (the rules that constrain everything below)

| Field | Limit | Indexed for search? | Weight |
|-------|-------|---------------------|--------|
| App Name / Title | **30** | ✅ yes | highest |
| Subtitle | **30** | ✅ yes | 2nd |
| Keywords field (hidden) | **100** | ✅ yes | 3rd |
| Promotional Text | **170** | ❌ no | — (editable without app review) |
| Description | **4000** | ❌ **no** | — (conversion only) |

Load-bearing facts (2025–2026, sourced from Apple Developer/Apple Ads + AppTweak/SplitMetrics/MobileAction):

- **The Description is NOT part of Apple's classic keyword index** (unlike Google Play, which fully indexes it). Its primary job is conversion — only the first ~3 lines (~170 chars) show before "more", so that hook is the highest-leverage copy. Caveat (WWDC25, June 2025): the description **and screenshots** now feed Apple's **AI-generated App Store Tags** and semantic/natural-language search, so the description has *indirect* discovery value. Still write it for humans — never keyword-stuff it (it won't rank the way a Play description does).
- **Ranking weight is Title > Subtitle > Keywords** — this ordering is **ASO practitioner consensus from testing**, not Apple-published. Apple only confirms all three are indexed for "text relevance" and gives no weights. Practically: put the single most valuable keyword in the Title, second tier in the Subtitle, long tail in the Keywords field.
- **Apple combines individual words across Title + Subtitle + Keywords _within one localization_** to form searchable phrases (e.g. "plan" in subtitle + "table" in subtitle → ranks for "plan de table"). So spread component words; don't write whole phrases redundantly.
- **Never duplicate a keyword** across Name/Subtitle/Keywords — Apple indexes each word once; repeats just waste your 160 indexable chars.
- **Keywords field syntax:** comma-separated, **no spaces after commas** (saves chars), **singular by default** (Apple stems plurals, so both usually = a wasteful duplicate — but singular vs plural *can* rank differently, so when you have spare chars and both terms have real volume, testing both is legitimate). **Special characters (`-`, `@`) are treated as blank spaces** — so `faire-part` indexes as the two tokens `faire`+`part` (fine — it still ranks for "faire part"; just know it isn't one atomic token). **Never** put in the keyword field: the brand/app name, the category name, or `app`/`free`/`gratuit`/stop-words ("the/to/for/son/de/la") — all indexed for free or ignored.
- **Words combine only WITHIN a locale, never across locales.** Each localization must carry complete, self-sufficient phrases. (You *may* deliberately repeat a word inside one locale's fields when you need it to form a multi-word phrase — the "no duplication" rule is about not wasting slots, not an absolute ban.)
- **Cross-localization stacking (free extra reach):** each storefront indexes a primary locale + secondary "backend" locales (verified against Apple's official App Store localizations reference). **The France storefront indexes THREE secondary locales: English (U.K.), Italian, and German** → each is a *second keyword bank* that ranks in France (guidance below only fills English (U.K.); Italian/German are extra unused banks). **The US storefront indexes exactly 9 secondaries** — Arabic, Chinese (Simplified), Chinese (Traditional), French, Korean, Portuguese (Brazil), Russian, Spanish (Mexico), Vietnamese → place *additional English* terms in those keyword fields to rank in the US. Never duplicate across the primary and its secondaries.
- **Accents (FR) — Apple only:** on the **App Store**, accented ≠ unaccented at indexing (`rétroplanning` and `retroplanning` are different tokens), and mobile users often type the unaccented form. Tactic: **accented forms in the visible Title/Subtitle** (credibility), **unaccented high-volume variants in the hidden Keywords field** (`retroplanning`, `invites`, `fete`, `prestataires`) — without duplicating a word already in the title/subtitle. (Apps targeting the accented form often *also* rank for the unaccented one, so this is a volume-capture optimization, not strictly either/or.) **Google Play normalizes accents** — do NOT double them there; see the Play section.
- **2025–2026 signals (WWDC25):** Apple added **AI-generated App Store Tags** (LLM reads metadata + description + screenshots), **semantic/natural-language search**, **Custom Product Page keyword binding** (a CPP can rank for its assigned keywords), and screenshot-text is now read for discovery (AI extraction, not classic OCR — real but not a firmly confirmed ranking surface; put captions near the top of screenshots). The keyword field is **100 today**, but WWDC25 demos showed **107 chars** — a possible near-future bump; treat 100 as the hard limit. None of the 30/30/100 limits or the Title/Subtitle/Keywords structure changed.

### Positioning (what to own vs. what to avoid)

Fiancé's differentiators map almost perfectly onto this category's whitespace:

- **Own the whitespace incumbents structurally can't claim:** privacy-first / **sans compte** / no sign-up / **hors-ligne** / no ads / no vendor spam / "your data stays on your device." Every major competitor (Zola, The Knot, WeddingWire, Bridebook, Joy, Mariages.net, Zankyou, Mariages.io) is account-gated and monetized via registry, vendor lead-gen, or a cash-fund wallet — the opposite of this app. These terms are low-*search-volume* (put them in the Description + keyword field, not the precious Subtitle) but high-*conversion* — they're the reason to choose us.
- **Own the under-contested high-intent keywords:** **seating chart / plan de table** (mostly owned by single-purpose niche apps, buried in incumbents' all-in-one listings) and, in FR, **rétroplanning** (well-searched, under-used by US-localized competitors who say "checklist" / "liste de tâches").
- **Don't fight on prestataires / annuaire / vendor marketplace / registry / wedding website:** Mariages.net (67k+ vendors) and Zola/Knot own these with capital and inventory we don't match. Mention vendors as *your own vendor notebook*, not a directory.
- Table-stakes quartet everyone lists (have them, but they don't differentiate alone): **checklist, budget, guest list, countdown**.

### Optimized metadata to ship

**🇫🇷 French (fr-FR — primary storefront locale)**
- **App Name (29/30):** `Fiancé : Organisation Mariage`
- **Subtitle (30/30):** `Budget, invités, plan de table`
- **Keywords (97/100):** `retroplanning,checklist,prestataire,rsvp,faire-part,invitation,planning,tache,ceremonie,placement`
- **Description — hook (first 3 lines, pre-"plus"):**
  > Organisez tout votre mariage au même endroit — invités, RSVP, plan de table, budget, prestataires et rétroplanning. 100 % privé, fonctionne hors ligne. Sans compte, sans publicité, sans démarchage.
- **Description — body:**
  > Fiancé est l'application d'organisation de mariage pensée pour les couples qui veulent tout gérer sereinement, sans céder leurs données.
  >
  > ✓ Liste d'invités & RSVP — suivez les confirmations, les accompagnants et les régimes alimentaires
  > ✓ Plan de table — glisser-déposer, tables rondes ou rectangulaires, export PDF
  > ✓ Budget mariage — suivez chaque dépense et acompte en temps réel
  > ✓ Prestataires — comparez, contactez et suivez traiteur, photographe, DJ, fleuriste…
  > ✓ Rétroplanning & checklist — ne rien oublier jusqu'au grand jour
  > ✓ Compte à rebours & widget — gardez le jour J en tête
  > ✓ Partage de photos — un album privé pour vos invités via QR code, sans compte
  > ✓ Site de mariage — partagez les infos avec vos invités
  >
  > 🔒 100 % privé — vos données restent sur votre téléphone. Aucune publicité, aucun tracking, aucune revente.
  > 📶 Hors ligne — tout fonctionne sans connexion. Synchronisation optionnelle chiffrée AES-256 avec votre partenaire.
  > 🆓 Gratuit — sans abonnement caché.
  >
  > Créez votre mariage en 30 secondes, sans inscription. Téléchargez Fiancé et commencez à organiser dès aujourd'hui.

**🇬🇧🇺🇸 English (en-US — primary for English storefronts)**
- **App Name (23/30):** `Fiancé: Wedding Planner`
- **Subtitle (28/30):** `Guest List, Budget & Seating`
- **Keywords (99/100):** `checklist,rsvp,countdown,chart,table,vendor,todo,organizer,private,offline,invitation,tracker,noads`
- **Description — hook (first 3 lines):**
  > Plan your entire wedding in one place — guest list, RSVPs, seating chart, budget, vendors and checklist. 100% private, works offline. No account, no ads, no vendor spam.
- **Description — body:**
  > Fiancé is the all-in-one wedding planner for couples who want to organize everything calmly — without handing over their data.
  >
  > ✓ Guest list & RSVP — track replies, plus-ones and dietary needs
  > ✓ Seating chart — drag & drop, round or rectangular tables, PDF export
  > ✓ Wedding budget — track every expense and deposit in real time
  > ✓ Vendors — compare, contact and track caterer, photographer, DJ, florist…
  > ✓ Checklist & timeline — never forget a thing before the big day
  > ✓ Countdown & widget — keep the date front of mind
  > ✓ Photo sharing — a private album for guests via QR code, no account
  > ✓ Wedding website — share details with your guests
  >
  > 🔒 100% private — your data stays on your device. No ads, no tracking, no data selling.
  > 📶 Offline — everything works without a connection. Optional AES-256 encrypted sync with your partner.
  > 🆓 Free — no hidden subscription.
  >
  > Create your wedding in 30 seconds, no sign-up. Download Fiancé and start planning today.

> Char counts verified against the 30/30/100 limits. Every keyword-field term is checked to **not** repeat any word already in that locale's Name or Subtitle (e.g. the fr-FR keyword field deliberately omits `organisation`, `mariage`, `budget`, `invités`, `plan`, `table`), and contains no brand/category/stop-words.

### Cross-localization stacking plan (App Store Connect — free extra keyword reach)

- **France storefront → enable the English (U.K.) localization** as a second keyword bank (indexed by the FR store). Name it `Fiancé: Wedding Planner`; fill its keyword field with English wedding terms French users also search, no fr-FR duplicates: `wedding,planner,seating,guest,countdown,vendor,rsvp,checklist,private,offline`.
- **France also indexes Italian and German** (two more free keyword banks the base plan leaves empty). Optional extra reach: add Italian (`matrimonio,invitati,tavoli,budget,scaletta,checklist`) and German (`hochzeit,gäste,tischplan,budget,checklist,countdown`) keyword fields — French users searching those terms, and IT/DE speakers in France, then rank too.
- **US storefront → fill the 9 secondary locales' keyword fields with additional English long-tail** (Spanish (Mexico), French, Portuguese (Brazil), Korean, Russian, Arabic, Chinese ×2, Vietnamese): `honeymoon,registry,save,date,bridal,groom,ceremony,reception,marriage,engagement,couples` — expands the indexable footprint from 160 toward ~1,440 chars.
- **Promotional Text (170, non-indexed, editable without review):** use for seasonal/timely hooks (e.g. "Nouvelle saison des mariages — organisez le vôtre, 100 % privé.").

### Maintenance rules

- When a feature is **added or renamed**, re-evaluate the **Subtitle** and **Keywords** first (highest ROI), not the Description.
- Never let a keyword appear in more than one of Name/Subtitle/Keywords **within a locale** — it's wasted space. Re-run the dedup check after any edit.
- Keep the **Description tuned for conversion, not keywords** (Apple doesn't index it). Protect the first 3 lines as the hook.
- Keep FR **accented** in the visible Title/Subtitle and push **unaccented** high-volume variants into the hidden keyword field.
- Exact competitor 30-char **subtitles could not be byte-verified** from this environment (Apple domains blocked); before a competitive-copy decision, confirm live via an ASO tool (AppTweak / Sensor Tower / Mobile Action) or a device set to the target storefront.

## Google Play Store Optimization (Play ASO)

Source of truth for the **Google Play** listing (`software.drakkar.fiance.app`). Play is optimized **separately from Apple** because the ranking mechanics are fundamentally different — do not copy the App Store keyword strategy here. Play fields are managed in Play Console, per-locale.

### Play vs. Apple — the differences that flip the whole strategy

| | App Store (Apple) | Google Play |
|---|---|---|
| Hidden keyword field | ✅ 100 chars | ❌ **none — doesn't exist** |
| Long **description** indexed for search? | ❌ no (conversion only) | ✅ **yes — fully indexed** |
| Where keywords go | Title + Subtitle + keyword field | **Title + Short description + Full description** (the descriptions *are* the keyword surface) |
| Keyword repetition | wasteful (indexed once) | **helpful in moderation** (repeat each core term ~3–5×, naturally) |
| Cross-locale stacking | ✅ yes (backend locales) | ❌ **no** — each locale self-contained (Google auto-translates/semantic-matches for some free reach) |
| Accents (é/è) | **distinct tokens** — index both forms | **normalized** — accented ranks for unaccented; do **NOT** double them |
| Keyword-list ("comma salad") copy | harmless in desc (not indexed) | **rejection risk** — metadata policy bans repetitive keywords |

- **Field limits:** Title **30**, Short description **80**, Full description **4000** (all three indexed; weight **Title > Short > Full**). Stable since the 2021 title cut from 50→30.
- **The long description IS a ranking asset** (not just conversion). Weave each target keyword **~3–5× in natural prose** (≈2–3% density; ~1 exact match per 250 chars). First ~167 chars show before "read more" — put primary keywords there, readably. Google's NLP **penalizes stuffing** — no synonym dumps.
- **Repetition across Title + Short + Full is positive on Play** (a relevance stack), unlike Apple where repeats waste slots. Still don't repeat the exact same phrase mechanically.
- **Metadata policy (rejection triggers, stricter than Apple):** in Title / Short description / icon / developer name — **no emojis, no ALL-CAPS** (unless it's the real brand), **no promo words** ("#1", "Best", "Top", "New", **"Free"/"Gratuit"**, "Sale"), no price, no "download now" CTAs in graphics, **no repetitive/irrelevant keyword lists**. (Emoji/✓ bullets are fine in the *long description* body — use sparingly, never as keyword substitutes.)
- **No cross-locale stacking:** set **fr-FR as the default locale** (untargeted locales fall back to it), add full **en-US** (+ en-GB) localizations. Don't expect English to "leak" into the FR store — localize deliberately.
- **Behavioral signals gate ranking** (much more than Apple): install **velocity**, ratings + review responses, **D1/D7/D30 retention**, low uninstalls, and **Android Vitals** (crashes/ANRs). The offline-first, no-account UX should help retention.
- **Play-only levers:** **Store Listing Experiments** (free built-in A/B test of icon/screenshots/short + full description — note the **Title is NOT testable**), and **Custom Store Listings** with **keyword-level targeting** (2025) for high-intent terms like "plan de table" / "seating chart". **Tags** (up to 5, from Google's fixed list) drive browse/Explore discovery, **not** keyword search.

### Optimized Play metadata to ship

**🇫🇷 French (fr-FR — default locale)**
- **Title (29/30):** `Fiancé : Organisation Mariage`
- **Short description (72/80):** `Invités, RSVP, plan de table, budget, rétroplanning. Privé et hors ligne`
- **Full description (indexed — weave keywords naturally):**
  > Organisez tout votre mariage au même endroit : invités, RSVP, plan de table, budget, prestataires et rétroplanning. Fiancé est 100 % privé et fonctionne hors ligne — sans compte, sans publicité, sans démarchage de prestataires.
  >
  > Fiancé est l'application d'organisation de mariage pensée pour les couples qui veulent tout gérer sereinement, sans céder leurs données personnelles.
  >
  > ✓ Liste d'invités & RSVP — suivez les confirmations, les accompagnants et les régimes alimentaires
  > ✓ Plan de table — glisser-déposer, tables rondes ou rectangulaires, export PDF
  > ✓ Budget mariage — suivez chaque dépense et acompte en temps réel
  > ✓ Prestataires — comparez, contactez et suivez traiteur, photographe, DJ, fleuriste (votre carnet, pas un annuaire)
  > ✓ Rétroplanning & checklist — un planning personnalisé pour ne rien oublier jusqu'au jour J
  > ✓ Compte à rebours & widget — gardez la date de votre mariage en tête
  > ✓ Partage de photos — un album privé pour vos invités via QR code, sans compte
  > ✓ Site de mariage — partagez les infos avec vos invités
  >
  > Privé — vos données restent sur votre téléphone. Aucune publicité, aucun tracking, aucune revente.
  > Hors ligne — tout fonctionne sans connexion. Synchronisation optionnelle chiffrée AES-256 avec votre partenaire.
  > Sans abonnement caché.
  >
  > Créez votre mariage en 30 secondes, sans inscription. Téléchargez Fiancé et commencez à organiser votre mariage dès aujourd'hui.

  Target density (FR): `mariage` ~8–12×, `plan de table` 2–3×, `invités` 3–4×, `rétroplanning` 2–3×, `budget` 3–4×, `prestataires` 2×, `RSVP` 2×, `privé`/`hors ligne`/`sans compte` 2–3× each — all already woven above; keep it that way on edits.

**🇬🇧🇺🇸 English (en-US — full localization)**
- **Title (23/30):** `Fiancé: Wedding Planner`
- **Short description (74/80):** `Guest list, RSVP, seating, budget, checklist. Private, offline, no account`
- **Full description (indexed — weave keywords naturally):**
  > Plan your entire wedding in one place: guest list, RSVPs, seating chart, budget, vendors and checklist. Fiancé is 100% private and works offline — no account, no ads, no vendor spam.
  >
  > Fiancé is the all-in-one wedding planner for couples who want to organize everything calmly — without handing over their data.
  >
  > ✓ Guest list & RSVP — track replies, plus-ones and dietary needs
  > ✓ Seating chart — drag & drop, round or rectangular tables, PDF export
  > ✓ Wedding budget — track every expense and deposit in real time
  > ✓ Vendors — compare, contact and track caterer, photographer, DJ, florist (your own notebook, not a directory)
  > ✓ Checklist & timeline — a personalized wedding checklist so you never forget a thing before the big day
  > ✓ Countdown & widget — keep your wedding date front of mind
  > ✓ Photo sharing — a private album for guests via QR code, no account
  > ✓ Wedding website — share details with your guests
  >
  > Private — your data stays on your device. No ads, no tracking, no data selling.
  > Offline — everything works without a connection. Optional AES-256 encrypted sync with your partner.
  > No hidden subscription.
  >
  > Create your wedding in 30 seconds, no sign-up. Download Fiancé and start planning your wedding today.

  Target density (EN): `wedding` ~8–12×, `seating chart` 2×, `guest list` 3×, `budget` 3×, `checklist` 2×, `vendors` 2×, `RSVP` 2×, `private`/`offline`/`no account` 2–3× each.

### Play maintenance rules

- **Title:** keep it policy-clean (no "Gratuit/Free", no "#1", no emoji, no ALL-CAPS). Put the #1 keyword (`Mariage` / `Wedding Planner`) here — the highest-weight, fastest-moving lever (rank shifts in 48–72h after a title change).
- **Short description (80):** the 2nd-highest-weighted field and the most under-optimized — pack the high-value keywords the Title lacks, still reading naturally; don't repeat Title words.
- **Full description:** on a feature add/rename, re-weave the new term ~3–5× in natural prose and put it in the hook (first ~167 chars). Never convert it into a keyword list — that's a rejection trigger.
- **Accents:** write correctly accented everywhere in FR (Play normalizes, so unaccented is covered for free) — do **not** duplicate accented/unaccented as on Apple.
- **Don't fight the directory game** (Mariages.net, Zankyou) or registry/cash-fund (Mariages.io "wallet") — frame vendors as *your own notebook*. Own the whitespace no Play competitor can: **private / no account / offline / no ads** (indexed here, so it earns free long-tail) plus **plan de table / rétroplanning / seating chart**.
- Competitor **titles and 80-char short descriptions could not be byte-verified** here (Play + mirrors blocked); confirm live via an ASO tool or a device on the target storefront before mirroring competitor copy. Closest FR structural analogs to study: **MyWed**, **Weddi**, **Mariage de A à Z**; closest "no-ads/clean" EN analog: **The Big Day**.
