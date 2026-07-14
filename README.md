<div align="center">
  <img src="apps/mobile/assets/logo.png" alt="Fiancé" width="140" style="border-radius: 32px;" />

  <h1>Fiancé</h1>

  <p><strong>Plan your dream wedding — privately, offline-first, beautifully.</strong></p>

  <p>One app. Every device. Zero compromises on your data.</p>

  <p>
    <img alt="Expo SDK 57" src="https://img.shields.io/badge/Expo_SDK-57-000020?logo=expo&logoColor=white" />
    <img alt="React Native" src="https://img.shields.io/badge/React_Native-0.86-61DAFB?logo=react&logoColor=white" />
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white" />
    <img alt="Cloudflare" src="https://img.shields.io/badge/Web_App-Cloudflare_Pages-F38020?logo=cloudflare&logoColor=white" />
    <img alt="License" src="https://img.shields.io/badge/License-Private-gray" />
  </p>

  <p>
    <a href="https://apps.apple.com/fr/app/fianc%C3%A9-organiser-son-mariage/id6786687256"><img alt="Download on the App Store" src="https://img.shields.io/badge/App_Store-Download-0D96F6?logo=apple&logoColor=white" /></a>
    <a href="https://play.google.com/store/apps/details?id=software.drakkar.fiance.app"><img alt="Get it on Google Play" src="https://img.shields.io/badge/Google_Play-Download-414141?logo=googleplay&logoColor=white" /></a>
    <a href="https://fiance.drakkar.software"><img alt="Try the Web App" src="https://img.shields.io/badge/Web_App-Try_it-F38020?logo=googlechrome&logoColor=white" /></a>
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

**💌 Invitation Tracking**
Log every send — type, date, notes. Custom invitation categories with accommodation needs per group.

**🏨 Accommodations**
Manage hotels for out-of-town guests: check-in/out dates, bed count, price per night.

**💬 Guest Communications**
Keep a full log of every message, call, and email with your guests.

**💰 Budget Tracker**
Visual breakdowns by vendor category. Know exactly where every euro goes.

**📋 Planning**
Task management with priorities and deadlines — from "12 months before" to day-of checklists.

**🎭 Wedding Party & Roles**
Assign officiants, witnesses, and ceremony roles to guests — or to people outside your guest list.

**🪑 Seating Constraints**
Must-sit-together / must-not-sit-together rules, with automatic conflict warnings on the seating plan and table list.

**📅 Multi-Day Events**
Civil ceremony, religious ceremony, cocktail, dinner, brunch — each with its own date, time, and venue, shown on the public page timeline.

**🍽️ Meal Choices**
Per-guest, per-event menu selection with a one-click caterer menu summary export.

**🚌 Guest Logistics**
Shuttle assignment, parking needs, and arrival notes per guest, with a dedicated logistics export.

</td>
<td width="50%">

**🏢 Vendor Directory**
Compare vendors across 20+ categories. Side-by-side comparison for any category — mark a winner, only they count toward your budget.

**🖼️ Mood Board**
Collect inspiration images, tag them, and organize into themed collections.

**🎁 Gift List**
Track your gift registry — home, travel, experience, and more — with purchase status.

**📸 Event Photos**
Collect and organize wedding day memories in a shared photo gallery.

**🌐 Public Wedding Page**
Shareable page for guests: program, RSVP, practical info. No account needed.

**⏱️ Wedding Day View**
Live countdown and day-of agenda — your schedule at a glance as the day unfolds.

**📲 iOS Widget**
Home-screen widget with your countdown, urgent warnings, upcoming agenda, and next tasks — a glance without opening the app.

**📨 Communication Templates**
Reusable email, SMS, and postal templates with `{{guest.firstName}}`-style placeholders.

**📎 Documents**
Attach quotes, contracts, and files to vendors, guests, or legal milestones — stored on-device, binaries never leave your phone.

**⚖️ Legal & Admin Checklist**
Civil-marriage milestones (bans, city hall appointment, contract signing) with due dates and a dashboard reminder.

**🌴 Honeymoon Planner**
Destination, dates, budget vs. spent, and a day-by-day itinerary.

</td>
</tr>
</table>

**Also:** Export to PDF/CSV · Data backup & restore · Multi-wedding support · PWA installable · iOS home-screen widget · App Lock (PIN + biometrics) · Cloud backup (AES-256-GCM, zero-knowledge) · Full French & English localization

---

## Tech Stack

| | |
|---|---|
| **Cross-platform** | Expo SDK 57 + Expo Router (iOS, Android, Web) |
| **UI** | React Native + NativeWind v5 (Tailwind CSS) |
| **State** | Zustand v5 |
| **Sync** | `@drakkar.software/dk-spaces-sdk` (Starfish client) — AES-256-GCM E2EE object-space sync |
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
# Point the app at the production drakkar_sync server (dk namespace)
echo 'EXPO_PUBLIC_SYNC_URL=https://sync.drakkar.software/sync' > apps/mobile/.env.local
pnpm --filter fiance run web
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
    components/    App-specific components
    store/         Zustand domain stores
    lib/           Sync, crypto, persistence, budget, planning logic
packages/
  fiance-sdk/      Pure headless business logic — no React Native deps
  fiance-ui/       Shared UI components, primitives, and utils
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
| Web (Cloudflare Pages) | `pnpm --filter fiance build:web` | Push to `master` |
| Android APK (EAS) | `npx eas-cli build --platform android --profile preview` | Push to `master` |
| Sync server | Managed by `Drakkar-Software/Infra` (drakkar_sync) | Infra repo deploy |

---

## iOS Submission (Xcode CLI)

`pnpm --filter fiance submit:ios:xcode -- path/to/app.ipa` uploads a built `.ipa` to App Store Connect via `xcrun altool`, authenticated with an App Store Connect API key (Apple ID + app-specific password auth is deprecated for `altool`).

**Generate the key** (one-time, per Apple Developer account):

1. Go to [App Store Connect → Users and Access → Integrations → App Store Connect API](https://appstoreconnect.apple.com/access/integrations/api).
2. Click **Generate API Key** (or **+**), name it, and give it the **App Manager** role (or higher).
3. Download the `.p8` file — Apple only lets you download it **once**.
4. Note the **Key ID** and **Issuer ID** shown next to the key.

**Install the key locally** (one-time, per machine):

```bash
mkdir -p ~/.appstoreconnect/private_keys
mv ~/Downloads/AuthKey_<KEY_ID>.p8 ~/.appstoreconnect/private_keys/
```

**Run the upload**:

```bash
export ASC_API_KEY_ID=<KEY_ID>
export ASC_API_ISSUER_ID=<ISSUER_ID>
pnpm --filter fiance submit:ios:xcode -- path/to/app.ipa
```

---

<div align="center">
  <sub>Private project · Built with love for the big day</sub>
</div>
