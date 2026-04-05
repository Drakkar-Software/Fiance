# WeddingOS

Privacy-first, offline-first wedding planning app built with React Native and Expo.

## Features

- **Guest Management** — Track RSVPs, dietary requirements, plus-ones, and table assignments
- **Budget Tracker** — Monitor spending by vendor category with visual breakdowns
- **Planning** — Task management with relative deadlines (months before wedding), priorities, and categories
- **Vendors** — Compare vendors by type, track quotes, deposits, and booking status
- **Mood Board** — Collect inspiration images, tag them, and organize into collections
- **Table Planner** — Create tables, assign guests, and track capacity
- **Cloud Sync** — Optional encrypted sync via Starfish (AES-256-GCM, zero-knowledge server)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK 52 + Expo Router v4 |
| UI | React Native + NativeWind v4 (Tailwind CSS) |
| State | Zustand v5 |
| Database | expo-sqlite + Drizzle ORM |
| Sync | Starfish client (encrypted push/pull) |
| Charts | Victory Native + Skia |
| Security | expo-secure-store, expo-local-authentication, expo-crypto |

## Getting Started

### Prerequisites

- Node.js 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

### Install

```bash
npm install
```

### Run

```bash
# Development server
npm start

# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

### Database

```bash
# Generate migrations
npm run db:generate

# Apply migrations
npm run db:push
```

## Build APK

The project uses [EAS Build](https://docs.expo.dev/build/introduction/) for producing Android APKs.

### Local build (requires Android SDK)

```bash
npx eas-cli build --platform android --profile preview --local
```

### Cloud build (requires Expo account)

```bash
npx eas-cli build --platform android --profile preview
```

The `preview` profile produces a standalone `.apk` file suitable for direct installation.

### CI

A GitHub Actions workflow at `.github/workflows/build-apk.yml` automatically builds the APK on every push to `main` or `master`, and on pull requests. The artifact is uploaded and available for download from the workflow run.

Required repository secret:
- `EXPO_TOKEN` — Expo access token ([create one here](https://expo.dev/accounts/[account]/settings/access-tokens))

## Cloud Sync (Starfish)

Sync is optional. All data stays on-device by default.

To enable sync, go to **Settings > Synchronisation** and provide:
1. Starfish server URL
2. Authentication token

An AES-256-GCM encryption key is generated automatically and stored in the device keychain. The server only stores opaque encrypted blobs — it never sees your data.

## Project Structure

```
app/
  (tabs)/
    index.tsx          # Dashboard
    invites/           # Guest list + table planner
    planning/          # Task management
    prestataires/      # Vendor management
    budget/            # Budget tracker
    idees/             # Mood board
    settings/          # App settings + sync config
components/            # Shared UI components
db/
  schema.ts            # Drizzle ORM schema (9 tables)
  types.ts             # Enums, labels, colors
  provider.tsx         # DB initialization + store hydration
lib/
  starfish.ts          # Starfish sync client
  sync.ts              # Backup document creation/restore
  persistence.ts       # Store ↔ SQLite write-through
  planning.ts          # Template task generation
  crypto.ts            # Local encryption utilities
store/                 # Zustand stores (5 domain stores)
```

## License

Private project.
