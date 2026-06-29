<div align="center">
  <img src="apps/mobile/assets/logo.png" alt="Fiancé" width="140" style="border-radius: 32px;" />

  <h1>Fiancé</h1>

  <p><strong>Plan your dream wedding — privately, offline-first, beautifully.</strong></p>

  <p>One app. Every device. Zero compromises on your data.</p>

  <p>
    <img alt="Expo SDK 55" src="https://img.shields.io/badge/Expo_SDK-55-000020?logo=expo&logoColor=white" />
    <img alt="React Native" src="https://img.shields.io/badge/React_Native-0.83-61DAFB?logo=react&logoColor=white" />
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" />
    <img alt="Cloudflare" src="https://img.shields.io/badge/Sync-Cloudflare_Workers-F38020?logo=cloudflare&logoColor=white" />
    <img alt="License" src="https://img.shields.io/badge/License-Private-gray" />
  </p>

  <p>
    <a href="https://fiance.drakkar.software"><strong>🌐 Try the Web App →</strong></a>
  </p>
</div>

---

## What is Fiancé?

Fiancé is a **privacy-first wedding planning app** for couples who want full control over their big day — and their data. Everything lives on your device. Sync is optional, encrypted end-to-end, and zero-knowledge.

Available on **iOS, Android, and Web** from a single codebase.

---

## Features

<table>
<tr>
<td width="50%">

**👥 Guest Management**
Track RSVPs, dietary needs, plus-ones, and table assignments. Never lose track of who's coming.

**💰 Budget Tracker**
Visual breakdowns by vendor category. Know exactly where every euro goes.

**📋 Planning**
Task management with priorities and deadlines — from "12 months before" to day-of checklists.

**🏢 Vendor Directory**
Compare vendors across 20+ categories. Track quotes, deposits, contracts, and booking status.

</td>
<td width="50%">

**🖼️ Mood Board**
Collect inspiration images, tag them, and organize into themed collections.

**🪑 Table Planner**
Create tables, assign guests, manage seating capacity visually.

**🔐 App Lock**
PIN code and biometric authentication. Your data, your eyes only.

**☁️ Cloud Sync** *(optional)*
AES-256-GCM encrypted sync via Starfish. Zero-knowledge server — even we can't read your data.

</td>
</tr>
</table>

**Also:** Multi-wedding support · PWA installable · Full French & English localization

---

## Tech Stack

| | |
|---|---|
| **Cross-platform** | Expo SDK 55 + Expo Router (iOS, Android, Web) |
| **UI** | React Native + NativeWind v5 (Tailwind CSS) |
| **State** | Zustand v5 |
| **Sync** | Starfish client — AES-256-GCM encrypted push/pull |
| **Security** | expo-secure-store · expo-local-authentication · expo-crypto |
| **Forms** | React Hook Form + Zod |
| **i18n** | i18next (FR / EN) |
| **Testing** | Vitest + Storybook v10 |

---

## Quick Start

```bash
# Install
pnpm install

# Run
pnpm --filter fiance start          # Expo dev server
pnpm --filter fiance run ios        # iOS simulator
pnpm --filter fiance run android    # Android emulator
pnpm --filter fiance run web        # Browser

# Test & build
pnpm test
pnpm --filter fiance build:web
```

**Prerequisites:** Node.js 18+, [pnpm](https://pnpm.io), [Expo CLI](https://docs.expo.dev)

---

## Cloud Sync (Starfish)

Sync is **100% optional** — all data stays on-device by default.

To enable: go to **Settings › Synchronisation** and enter your Starfish server URL + auth token. An AES-256-GCM key is generated on-device and stored in the secure keychain. The server only ever sees encrypted blobs.

```bash
# Start local sync server
cd apps/server && pnpm dev          # http://localhost:8787

# Point the app at it
echo 'EXPO_PUBLIC_SYNC_URL=http://localhost:8787' > apps/mobile/.env.local
pnpm --filter fiance run web
```

```bash
# Deploy to production (Cloudflare Workers)
cd apps/server
wrangler r2 bucket create wedding-os-sync
wrangler secret put ENCRYPTION_SECRET
wrangler deploy
```

---

## How it Works

```
Zustand Stores  →  KV-store (expo-kv)  →  Starfish Server
     ↑                    ↑                      ↑
  Runtime state     Persisted on-device     Encrypted sync
  guests, budget,   hydrated on boot,      (optional, zero-
  planning, etc.    write-through           knowledge)
```

The codebase is a **pnpm monorepo**:

```
apps/
  mobile/          Expo app — iOS · Android · Web
    app/(tabs)/    Screens: guests · planning · vendors · budget · ideas
    components/    Shared UI (22 components, all with Storybook stories)
    store/         Zustand domain stores
    lib/           Sync, crypto, persistence, budget, planning logic
  server/          Starfish sync server (Cloudflare Worker)
packages/
  fiance-sdk/      Pure headless business logic — no React Native deps
```

---

## Storybook

Browse and test all UI components in isolation:

```bash
pnpm --filter fiance storybook      # http://localhost:6006
```

Connect Claude Code to Storybook via MCP for AI-assisted component development:

```bash
claude mcp add storybook-mcp --transport http http://localhost:6006/mcp --scope project
```

---

## Deploy

| Target | Command | CI |
|--------|---------|-----|
| Web (Cloudflare Pages) | `pnpm --filter fiance build:web` | Push to `main` |
| Android APK (EAS) | `npx eas-cli build --platform android --profile preview` | Push to `main` |
| Sync server | `wrangler deploy` (from `apps/server/`) | Push to `main` (paths: `apps/server/**`) |

---

<div align="center">
  <sub>Private project · Built with love for the big day</sub>
</div>
