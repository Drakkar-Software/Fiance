# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install              # Install dependencies
pnpm start                # Start Expo dev server
pnpm run android          # Run on Android emulator
pnpm run ios              # Run on iOS simulator
pnpm run web              # Run in browser
pnpm lint                 # ESLint
pnpm build:web            # Export for Cloudflare Pages (output: dist/)
pnpm test                 # Run tests (Vitest)
pnpm test:watch           # Run tests in watch mode
pnpm storybook            # Start Storybook dev server (localhost:6006)
pnpm build-storybook      # Build static Storybook
```

Tests use Vitest. Test files live in `__tests__/`. Pure business logic is tested directly; modules that depend on React Native are tested by replicating the logic in isolation.

## Before committing and pushing

Always run both commands and verify they succeed before committing:

```bash
pnpm test       # all tests must pass
pnpm build:web  # web export must succeed (catches Metro config errors, bundler issues)
```

## Architecture

**Fiancé** is a privacy-first, offline-first wedding planning app. Single Expo (SDK 55) codebase targeting iOS, Android, and web. All user-facing text is in French.

### Routing

File-based routing via Expo Router. Screens live in `app/(tabs)/` — each subdirectory is a feature tab (guests, vendors, planning, budget, ideas, settings). The root `app/_layout.tsx` wraps everything in a wedding registry provider.

### Data flow: Zustand → SQLite → Starfish

Three-layer persistence:

1. **Zustand stores** (`store/`) — runtime state; domain stores include `useWeddingStore`, `useGuestsStore`, `useVendorsStore`, `usePlanningStore`, `useIdeasStore`, `useAccommodationsStore`, `useGiftsStore`, plus `useWeddingRegistryStore` for multi-wedding support.
2. **SQLite via Drizzle** (`db/schema.ts`) — 15 tables, all IDs are UUIDs (except singleton `wedding` table with id=1). `lib/persistence.ts` handles hydration on boot and write-through on every mutation.
3. **Starfish sync** (optional) — `lib/starfish.ts` and `lib/sync.ts` push AES-256-GCM encrypted backups to a remote server. Triggered via `notifySync()` after store mutations.

### Starfish sync — encryption contract

The `wedding` collection uses **client-side AES-256-GCM encryption**. The server stores an opaque `{ "_encrypted": "<base64>" }` blob and never sees plaintext. All server collections are configured with `encryption: "none"` (server pass-through; encryption is handled entirely on the client by `SyncManager`).

**Critical**: `notifySync()` must call `store.set(() => doc)` — this marks `dirty=true`, triggers `flush()`, which calls `syncManager.push()` and encrypts the payload. **Never use `store.restore(doc)` for pushing**: `restore()` only updates local Zustand state without marking dirty, so `flush()` never runs and nothing reaches the server. The `isRestoring` guard (`isRestoring = true` around `set()`) prevents the store subscription from redundantly calling `restoreFromBackup` on our own outgoing data.

### Adding a new store

Create `store/useNewStore.ts` with Zustand `create()`. Add table to `db/schema.ts`. Wire hydration/write-through in `lib/persistence.ts` (`hydrateAllStores` and `clearAllStores`). Call `notifySync()` on mutations.

### Adding a new screen

Create file under `app/(tabs)/feature/`. Expo Router auto-discovers it. Add tab entry in `app/(tabs)/_layout.tsx` if it's a new tab.

### Styling

NativeWind v4 (Tailwind for React Native). Custom color palette defined in `tailwind.config.js` (primary pink, accent gold/sage/blush). Dark mode supported. Shared UI components in `components/` — notably `FormSection.tsx` exports form building blocks (SectionTitle, FormCard, InputRow, ToggleRow, ChipSelect).

### CI/CD

- **Web**: Push to main/master → `.github/workflows/deploy-web.yml` → Cloudflare Pages
- **Android APK**: Push to main/master → `.github/workflows/build-apk.yml` → EAS Build → artifact upload
