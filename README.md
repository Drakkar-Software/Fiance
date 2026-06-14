<p align="center">
  <img src="assets/icon.png" alt="Fiancé" width="120" height="120" style="border-radius: 24px;" />
</p>

<h1 align="center">Fiancé</h1>

<p align="center">
  Privacy-first, offline-first wedding planning app.<br/>
  One codebase for iOS, Android, and Web.
</p>

<p align="center">
  <img alt="Expo SDK" src="https://img.shields.io/badge/Expo_SDK-55-000020?logo=expo" />
  <img alt="React Native" src="https://img.shields.io/badge/React_Native-0.83-61DAFB?logo=react" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" />
  <img alt="License" src="https://img.shields.io/badge/License-Private-gray" />
</p>

---

## Features

- **Guest Management** — Track RSVPs, dietary requirements, plus-ones, companions, and table assignments
- **Budget Tracker** — Monitor spending by vendor category with visual breakdowns and per-person pricing
- **Planning** — Task management with relative deadlines, priorities, categories, and preparation/agenda/day-of views
- **Vendor Directory** — Compare vendors by type (20+ categories), track quotes, deposits, contracts, and booking status
- **Mood Board** — Collect inspiration images, tag them by category, and organize into collections
- **Table Planner** — Create tables, assign guests, and track capacity
- **Cloud Sync** — Optional encrypted sync via Starfish (AES-256-GCM, zero-knowledge server)
- **Multi-wedding** — Manage multiple weddings from a single app with the wedding registry
- **App Lock** — PIN code and biometric authentication to protect your data
- **PWA Support** — Install as a Progressive Web App on any device
- **Bilingual** — Full French and English localization

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK 55 + Expo Router |
| UI | React Native + NativeWind v4 (Tailwind CSS) |
| State | Zustand v5 |
| Database | expo-sqlite + Drizzle ORM |
| Sync | Starfish client (AES-256-GCM encrypted push/pull) |
| Charts | Victory Native + Skia |
| Forms | React Hook Form + Zod |
| i18n | i18next (FR / EN) |
| Security | expo-secure-store, expo-local-authentication, expo-crypto |
| Testing | Vitest |
| Component Dev | Storybook v10 + MCP |

## Getting Started

### Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io/installation)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

### Install

```bash
pnpm install
```

### Run

```bash
pnpm start           # Expo dev server
pnpm run android     # Android emulator
pnpm run ios         # iOS simulator
pnpm run web         # Browser
```

## Build & Deploy

### Web (Cloudflare Pages)

```bash
pnpm build:web       # Export + PWA injection (output: dist/)
```

A GitHub Actions workflow at `.github/workflows/deploy-web.yml` deploys to Cloudflare Pages on push to `main`/`master`.

### Android APK (EAS Build)

```bash
# Local build (requires Android SDK)
npx eas-cli build --platform android --profile preview --local

# Cloud build (requires Expo account)
npx eas-cli build --platform android --profile preview
```

A GitHub Actions workflow at `.github/workflows/build-apk.yml` automatically builds the APK on push to `main`/`master` and on pull requests.

Required repository secret:
- `EXPO_TOKEN` — [Expo access token](https://expo.dev/accounts/[account]/settings/access-tokens)

## Cloud Sync (Starfish)

Sync is optional. All data stays on-device by default.

To enable sync, go to **Settings > Synchronisation** and provide:
1. Starfish server URL
2. Authentication token

An AES-256-GCM encryption key is generated automatically and stored in the device keychain. The server only stores opaque encrypted blobs — it never sees your data.

### Local server development

```bash
# 1. Create local secrets file (gitignored)
touch apps/server/.dev.vars

# 2. Start the local Starfish server on port 8787
#    R2 is simulated locally — data stored in apps/server/.wrangler/state/
cd apps/server && pnpm dev

# 3. In a second terminal, point the app at localhost
echo 'EXPO_PUBLIC_SYNC_URL=http://localhost:8787' > apps/mobile/.env.local
pnpm --filter fiance run web
```

> For iOS simulator or physical device, replace `localhost` with your machine's LAN IP (e.g. `http://192.168.1.x:8787`).

### Production deploy

```bash
cd apps/server
pnpm install
wrangler deploy
```

Create R2 bucket:
```bash
wrangler r2 bucket create wedding-os-sync
```

Set production secrets:
```bash
wrangler secret put ENCRYPTION_SECRET
```

## Architecture

### Data Flow: Zustand → KV-store → Starfish

```
┌─────────────┐     write-through     ┌──────────────┐     encrypted sync     ┌──────────────┐
│   Zustand    │ ──────────────────▶  │   KV-store   │ ─────────────────────▶ │   Starfish   │
│   Stores     │ ◀──────────────────  │  (expo-kv)   │ ◀───────────────────── │   Server     │
└─────────────┘     hydrate on boot   └──────────────┘                        └──────────────┘
```

1. **Zustand stores** (`apps/mobile/store/`) — Runtime state for guests, vendors, planning, budget, and ideas
2. **KV-store** (`apps/mobile/db/schema.ts` — plain TS interfaces) — all IDs are UUIDs
3. **Starfish sync** (optional) — AES-256-GCM encrypted backups to `apps/server/`

### Project Structure

```
apps/
  mobile/                  # Expo app (iOS · Android · Web)
    app/(tabs)/
      index.tsx            # Dashboard
      guests/              # Guest list + table planner
      planning/            # Task management
      vendors/             # Vendor management
      budget/              # Budget tracker
      ideas/               # Mood board
      settings/            # App settings + sync config
    components/            # Shared UI components (with Storybook stories)
    db/
      schema.ts            # Type shim → re-exports from @fiance/sdk
      types.ts             # Type shim → re-exports from @fiance/sdk
    lib/
      persistence.ts       # Store ↔ KV write-through
      starfish.ts          # Starfish sync client + notifySync
      sync.ts              # Backup serialization (delegates to @fiance/sdk)
      crypto.ts            # AES-256-GCM encryption
      budget.ts            # Budget calculation logic
      planning.ts          # Template task generation
      identity.ts          # Device identity management
    store/                 # Zustand stores (domain + registry)
    i18n/                  # i18next config + FR/EN locale files
    .storybook/            # Storybook configuration
    __tests__/             # Vitest integration tests (RN mocks)
  server/                  # Starfish sync server (Cloudflare Worker)
    index.ts               # Hono router + Starfish/Doubloon middleware
    starfish-config.ts     # Collection definitions + auth
    doubloon.ts            # IAP receipt validation
packages/
  fiance-sdk/              # Pure headless business logic (@fiance/sdk)
    src/
      domain/              # Entity reducers: guests, budget, planning, vendor-config, registry
      sync/                # Backup, RSVP, public-page, server-config helpers
```

## Development

### Testing

```bash
pnpm test            # Run all tests (Vitest)
pnpm test:watch      # Watch mode
pnpm lint            # ESLint
```

### Storybook

The project includes a web-based [Storybook](https://storybook.js.org/) (v10) for browsing and testing UI components in isolation. It uses `@storybook/react-vite` with `react-native-web-lite` to render components in the browser.

```bash
pnpm storybook           # Start at http://localhost:6006
pnpm build-storybook     # Build static site
```

All 22 shared components in `components/` have co-located story files (`*.stories.tsx`).

#### MCP Integration

The Storybook includes `@storybook/addon-mcp`, which exposes an MCP server for AI tools. When Storybook is running, connect Claude Code:

```bash
claude mcp add storybook-mcp --transport http http://localhost:6006/mcp --scope project
```

#### Writing Stories

Stories are co-located next to their components using CSF3 format:

```
components/
  StatusBadge.tsx
  StatusBadge.stories.tsx
```

```tsx
import type { Meta, StoryObj } from "storybook/react";
import { MyComponent } from "./MyComponent";

const meta: Meta<typeof MyComponent> = {
  title: "Components/MyComponent",
  component: MyComponent,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof MyComponent>;

export const Default: Story = {
  args: { /* props */ },
};
```

## License

Private project.
