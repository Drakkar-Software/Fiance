# Starfish Sync — Architecture & Implementation

WeddingOS uses [Starfish](https://github.com/Drakkar-Software/starfish) (`@drakkar.software/starfish-client` v1.3.2) for end-to-end encrypted cloud sync between devices. This document covers the full architecture: how the client is integrated, how data flows, how encryption works, and how conflicts are resolved.

---

## Table of Contents

1. [High-Level Overview](#high-level-overview)
2. [Starfish Client SDK](#starfish-client-sdk)
3. [Integration Layer (`lib/starfish.ts`)](#integration-layer)
4. [Identity & Key Derivation (`lib/identity.ts`)](#identity--key-derivation)
5. [Encryption](#encryption)
6. [Backup Document Format (`lib/sync.ts`)](#backup-document-format)
7. [Push Flow](#push-flow)
8. [Pull Flow](#pull-flow)
9. [Conflict Resolution](#conflict-resolution)
10. [Persistence Architecture](#persistence-architecture)
11. [Initialization Sequence](#initialization-sequence)
12. [Network & Lifecycle Handling](#network--lifecycle-handling)
13. [Feature Gates](#feature-gates)
14. [Schema Versioning & Migrations](#schema-versioning--migrations)

---

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        WeddingOS App                            │
│                                                                 │
│  ┌───────────┐    notifySync()    ┌──────────────┐              │
│  │  Zustand   │ ───────────────►  │ lib/starfish │              │
│  │  Stores    │                   │  (debounce)  │              │
│  │ (5 domain) │ ◄──── restore ──  │              │              │
│  └─────┬─────┘                   └──────┬───────┘              │
│        │ write-through                  │                       │
│        ▼                                ▼                       │
│  ┌───────────┐              ┌──────────────────┐               │
│  │  SQLite    │              │  SyncManager     │               │
│  │  (Drizzle) │              │  (encrypt/push)  │               │
│  └───────────┘              └────────┬─────────┘               │
│                                      │                          │
└──────────────────────────────────────┼──────────────────────────┘
                                       │ HTTPS
                                       ▼
                              ┌──────────────────┐
                              │  Starfish Server  │
                              │  /pull/wedding/x  │
                              │  /push/wedding/x  │
                              └──────────────────┘
```

Sync is **document-level**: the entire wedding dataset is serialized into a single backup document, encrypted client-side with AES-256-GCM, and pushed/pulled as one blob. There are no per-field diffs — the server stores the latest encrypted snapshot and detects conflicts via content hashing.

---

## Starfish Client SDK

The SDK has three layers:

### `StarfishClient` — HTTP transport

Low-level HTTP wrapper. Handles auth headers and response parsing.

```ts
const client = new StarfishClient({
  baseUrl: "https://sync.example.com",
  auth: async (req) => ({ Authorization: `Bearer ${token}` }),
});
```

| Method | Description |
|--------|-------------|
| `pull(path, checkpoint?)` | `GET {baseUrl}{path}?checkpoint={n}` — returns `{ data, hash, timestamp }` |
| `push(path, data, baseHash, signature?)` | `POST {baseUrl}{path}` — body is `{ data, baseHash }`. Returns `{ hash, timestamp }`. Throws `ConflictError` on 409 |

### `SyncManager` — Sync state machine

Wraps `StarfishClient` with encryption, conflict retry, and local state tracking.

```ts
const syncManager = new SyncManager({
  client,
  pullPath: `/pull/wedding/${userId}`,
  pushPath: `/push/wedding/${userId}`,
  encryptionSecret: encryptionKey,  // AES-256-GCM key
  encryptionSalt: userId,           // HKDF salt
  onConflict: mergeBackups,         // custom conflict resolver
  maxRetries: 3,
});
```

Internal state:
- `lastHash` — hash of the last known server version (for conflict detection)
- `lastCheckpoint` — timestamp for incremental pulls
- `localData` — in-memory copy of the synced document

Key methods:
- `pull()` — fetch remote, decrypt, update internal state
- `push(data)` — encrypt, push, retry on conflict (up to `maxRetries`)
- `update(modifier)` — atomic pull → modify → push

### `createStarfishStore()` — Zustand binding

Creates a reactive Zustand store wrapping the `SyncManager`:

```ts
interface StarfishState {
  data: Record<string, unknown>;  // the backup document
  syncing: boolean;                // operation in flight?
  online: boolean;                 // network connectivity
  dirty: boolean;                  // local changes pending push?
  error: string | null;            // last sync error
}

interface StarfishActions {
  pull(): Promise<void>;
  set(modifier: (current) => next): void;  // marks dirty, auto-flushes if online
  flush(): Promise<void>;                   // push if dirty
  setOnline(online: boolean): void;         // triggers flush on reconnect
}
```

Behavior:
- `set()` updates `data`, marks `dirty: true`, and immediately calls `flush()` if online
- `flush()` is a no-op if already `syncing` or not `dirty`
- `setOnline(true)` triggers `flush()` if there are pending changes
- Persistence is disabled (`storage: false`) — WeddingOS manages its own persistence through SQLite/localStorage

---

## Integration Layer

**File:** `lib/starfish.ts`

This is the bridge between domain stores and the Starfish SDK.

### Module state

```ts
let store: StoreApi<StarfishStore> | null = null;
let isRestoring = false;            // prevents feedback loops
let lastSyncTimestamp: string | null = null;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
const PUSH_DEBOUNCE_MS = 2000;
```

### `initStarfish(config)`

Called by `SyncInitializer` in `_layout.tsx`. Creates the full stack:

1. Instantiates `StarfishClient` with Bearer auth
2. Creates `SyncManager` with encryption config + custom `mergeBackups` conflict resolver
3. Creates the Zustand store via `createStarfishStore()`
4. Subscribes to `store.data` changes to detect incoming remote pulls and trigger `restoreFromBackup()`

The subscription has a guard: it only restores when `!isRestoring`, preventing a feedback loop where pushing our own data triggers a restore.

### `notifySync()`

Called by every domain store mutation (add/update/remove). Two responsibilities:

1. **Web persistence:** calls `saveToLocalStorage()` immediately
2. **Remote push:** debounced by 2000ms. On fire:
   - Sets `isRestoring = true` (prevents subscription loop)
   - Calls `store.getState().set(() => createBackupDocument())` which triggers `flush()`
   - Records `lastSyncTimestamp`

The debounce prevents rapid-fire pushes during typing.

### `teardownStarfish()`

Clears store, timers, and notifies listeners that sync is disabled. Called before re-initializing (e.g., switching weddings).

### Exports

| Export | Purpose |
|--------|---------|
| `initStarfish(config)` | Initialize sync for a wedding |
| `getStarfishStore()` | Get the Zustand store (or `null`) |
| `useStarfishSync(selector)` | React hook to read sync state |
| `notifySync()` | Trigger debounced push after mutation |
| `getLastSyncTimestamp()` | Last successful sync time |
| `teardownStarfish()` | Clean up everything |
| `onSyncStatusChange(listener)` | Subscribe to sync enable/disable events |

---

## Identity & Key Derivation

**File:** `lib/identity.ts`

### Passphrase generation

```ts
generatePassphrase(): string
```

Generates a 12-word passphrase from a 256-word list. Each word maps to one random byte (0–255) — no modulo bias. Output format: `"apple-arrow-atlas-..."`.

Uses `expo-crypto.getRandomValues()` for cryptographic randomness.

### Auth token

```ts
deriveAuthToken(password: string): Promise<string>
```

`SHA-256(password.trim())` → 64-char hex string. Deterministic — same password always yields the same token across devices. Used as a `Bearer` token for HTTP auth.

### Encryption key

```ts
deriveEncryptionKey(password: string, salt: string): Promise<string>
```

`SHA-256(password.trim() + ":" + salt)` → 64-char hex string. The salt is `authToken.slice(0, 16)` (the first 16 chars of the auth token), ensuring different weddings with different passwords produce different encryption keys.

### Key derivation chain

```
seedPhrase (12-word passphrase)
├── authToken = SHA-256(seedPhrase)            → Bearer auth header
├── userId = authToken.slice(0, 16)            → server path + encryption salt
└── encryptionKey = SHA-256(seedPhrase:userId)  → passed to SyncManager
```

### Invite URLs

Deep links for sharing wedding access:

```
weddingos://join?t={urlSafeBase64(JSON.stringify({ n: name, p: password }))}
```

URL-safe base64 (RFC 4648 section 5): uses `-` and `_` instead of `+` and `/`, no padding.

---

## Encryption

### Two-layer encryption design

The Starfish protocol uses HKDF key derivation + AES-256-GCM:

**Layer 1 — HKDF key derivation** (in `starfish-protocol`):

```ts
deriveKey(secret, salt, info): Promise<CryptoKey>
```

Uses Web Crypto `HKDF` with `SHA-256`:
- `secret` — the encryption key (64-char hex from `deriveEncryptionKey()`)
- `salt` — the user ID (`authToken.slice(0, 16)`)
- `info` — `"starfish-e2e"` (default)

Produces a 256-bit AES-GCM `CryptoKey`.

**Layer 2 — AES-256-GCM encryption** (in `starfish-client`):

The `createEncryptor(secret, salt, info)` function returns an `Encryptor` with `encrypt()` and `decrypt()` methods:

**Encrypt:**
1. JSON-serialize the backup document
2. Generate random 12-byte IV
3. Encrypt plaintext with AES-GCM using the derived key
4. Prepend IV to ciphertext: `IV (12 bytes) || ciphertext`
5. Base64-encode the combined bytes
6. Wrap in `{ _encrypted: "<base64>" }`

**Decrypt:**
1. Read base64 from `_encrypted` field
2. Split: first 12 bytes = IV, rest = ciphertext
3. Decrypt with AES-GCM
4. Parse JSON to recover the backup document

### What is encrypted

The entire backup document is encrypted as a single blob. The server only sees `{ _encrypted: "..." }` — it has no access to wedding names, guest lists, budgets, or any planning data.

### What is NOT encrypted

- The auth token (transmitted as a Bearer header)
- The `baseHash` (content hash used for conflict detection — but it's a hash of the *encrypted* payload, not the plaintext)
- HTTP metadata (paths, timestamps)

---

## Backup Document Format

**File:** `lib/sync.ts`

The backup document is a flat snapshot of all domain store state:

```ts
interface BackupData {
  version: 2;              // schema version
  timestamp: string;       // ISO 8601 creation time
  wedding: Wedding;        // singleton record
  guests: Guest[];
  tables: Table[];
  vendors: Vendor[];
  quotePricings: QuotePricing[];
  tasks: Task[];
  taskCategories: TaskCategory[];
  agendaEvents: AgendaEvent[];
  dayOfItems: DayOfItem[];
  ideas: Idea[];
  ideaCollections: IdeaCollection[];
}
```

`createBackupDocument()` reads current state from all 5 domain Zustand stores and assembles this structure.

---

## Push Flow

```
User edits data (e.g., updates a guest name)
         │
         ▼
Store mutation (updateGuest)
  ├─ Updates Zustand state (optimistic)
  ├─ Writes to SQLite (write-through)
  └─ Calls notifySync()
         │
         ▼
notifySync()
  ├─ saveToLocalStorage() (web only, immediate)
  └─ Starts/resets 2000ms debounce timer
         │
         ▼  (after 2000ms of no further edits)
Debounce fires
  ├─ Sets isRestoring = true (prevents restore loop)
  ├─ Calls store.set(() => createBackupDocument())
  │    └─ Snapshots all 5 domain stores
  └─ Sets isRestoring = false
         │
         ▼
StarfishStore.set()
  ├─ Updates data, marks dirty = true
  └─ Calls flush() (since online)
         │
         ▼
StarfishStore.flush()
  └─ Calls syncManager.push(data)
         │
         ▼
SyncManager.push()
  ├─ Encryptor encrypts backup → { _encrypted: "..." }
  ├─ POST /push/wedding/{userId}
  │    body: { data: { _encrypted }, baseHash }
  │
  ├─ 200 OK → update lastHash, done
  └─ 409 Conflict → pull remote, merge, retry (up to 3x)
```

### Retry backoff on conflict

Exponential with jitter: `min(100 * 2^attempt, 2000) + random(0, 100)` ms between retries.

---

## Pull Flow

```
SyncInitializer mounts (or explicit pull)
         │
         ▼
store.getState().pull()
         │
         ▼
StarfishStore.pull()
  └─ syncManager.pull()
         │
         ▼
SyncManager.pull()
  ├─ GET /pull/wedding/{userId}?checkpoint={n}
  ├─ Decrypts response data (if encrypted)
  ├─ Updates lastHash, lastCheckpoint, localData
  └─ Returns PullResult
         │
         ▼
StarfishStore receives data
  └─ Sets data = syncManager.getData()
         │
         ▼
Store subscription fires (in initStarfish)
  ├─ Checks: data changed AND has version AND !isRestoring
  ├─ Sets isRestoring = true
  ├─ Calls restoreFromBackup(data, db)
  │    │
  │    ├─ Native (db exists):
  │    │    ├─ restoreAllTables(db, data) — atomic bulk replace
  │    │    └─ hydrateAllStores(db) — reload Zustand from SQLite
  │    │
  │    └─ Web (db = null):
  │         ├─ Directly sets each store
  │         └─ saveToLocalStorage()
  │
  └─ Sets isRestoring = false
```

### Checkpoint-based incremental pulls

The `checkpoint` parameter (a server timestamp) tells the server to only return data updated since that point. On first pull, `checkpoint = 0` triggers a full sync. After each pull, `lastCheckpoint` is updated to the server's response timestamp.

However, since WeddingOS uses E2E encryption, incremental pulls always return the full encrypted blob (the server can't merge encrypted documents). The checkpoint is still useful for the server to short-circuit "no changes" responses.

---

## Conflict Resolution

**File:** `lib/starfish.ts` — `mergeBackups(local, remote)`

Conflicts occur when two devices push simultaneously. The server detects this via `baseHash` mismatch (the client's `lastHash` doesn't match the server's current hash).

### Resolution flow

1. Push fails with 409
2. Client pulls the remote document
3. Client decrypts remote
4. Calls `mergeBackups(localData, remoteData)`
5. Re-pushes merged result

### Merge algorithm

For each key in the backup document:

- **Arrays with `id` fields** (guests, vendors, tasks, etc.): **ID-based union**
  - Build a map from remote array (keyed by `id`)
  - Overlay local array (local items win per-id)
  - Result: union of both sets, with local versions of shared items
  - Remote-only items are preserved

- **Scalar values** (version, timestamp, wedding singleton): **Latest timestamp wins**
  - Compare `local.timestamp` vs `remote.timestamp` (string comparison)
  - If remote is newer: use remote value
  - Otherwise: keep local value

### Limitations

- Per-item, not per-field: if two devices edit different fields of the same guest, the merge picks one entire item (the local device's version)
- Deletions on one device while the other edits the same item will cause the item to reappear (union merge)
- The Starfish SDK's default merge (`deepMerge`) is overridden by this custom strategy

---

## Persistence Architecture

### Three-layer persistence

```
┌──────────────────┐
│   Zustand Stores  │  Runtime state (in-memory)
│   (5 domain)      │
└────────┬─────────┘
         │ write-through / hydration
         ▼
┌──────────────────┐
│  SQLite (native)  │  Persistent on-device storage (iOS/Android)
│  localStorage     │  Persistent browser storage (web)
└────────┬─────────┘
         │ backup document
         ▼
┌──────────────────┐
│  Starfish Server  │  Encrypted cloud backup
└──────────────────┘
```

### Native (iOS/Android)

- **SQLite** is the source of truth. 11 tables via Drizzle ORM.
- Every store mutation writes through to SQLite immediately.
- On boot: `hydrateAllStores(db)` loads all tables into Zustand stores.
- On sync pull: `restoreAllTables(db, data)` atomically replaces all data, then re-hydrates stores.

### Web

- **localStorage** under the key `wedding_data`. Stores the full backup document as JSON.
- No SQLite available (`db = null`).
- Every mutation calls `saveToLocalStorage()` via `notifySync()`.
- On sync pull: directly sets store state, then saves to localStorage.

### Bulk restore (sync pull)

`restoreAllTables(db, data)` performs a full replace respecting FK constraints:

**Delete phase** (children first):
```
ideas → ideaCollections → dayOfItems → agendaEvents → tasks →
taskCategories → quotePricing → vendors → guests → tables
```

**Insert phase** (parents first):
```
wedding (update) → tables → guests → vendors → quotePricings →
taskCategories → tasks → agendaEvents → dayOfItems →
ideaCollections → ideas
```

### Write-through helpers

Each entity type has three persistence functions:

| Function | Pattern |
|----------|---------|
| `persist*(db, entity)` | Upsert (insert + `ON CONFLICT DO UPDATE`) |
| `update*Db(db, id, updates)` | Partial update |
| `delete*Db(db, id)` | Delete with cascade cleanup |

Delete cascades are manual (not DB-level FK cascades):
- Deleting a table → unassigns all guests (`tableId = null`)
- Deleting a vendor → deletes all quotePricings for that vendor
- Deleting a collection → unassigns all ideas (`collectionId = null`)

---

## Initialization Sequence

### App startup

```
RootLayout
  ├─ loadRegistry() — loads wedding list from secure store
  ├─ loadLanguage() — loads i18n preference
  └─ isLockEnabled() — checks biometric lock
       │
       ▼
  If locked → LockScreen
  If no wedding → OnboardingScreen
  If wedding exists → AppContent
       │
       ▼
  AppContent
    └─ DatabaseProvider(dbFileName)
         ├─ Opens SQLite (native) or clears stores + loadFromLocalStorage (web)
         ├─ Runs migrations
         ├─ hydrateAllStores(db)
         │
         └─ SyncInitializer(wedding)
              ├─ Checks: seedPhrase && !syncDisabled && isPremium() && serverUrl
              ├─ Derives authToken, userId, encryptionKey
              ├─ initStarfish({ serverUrl, authToken, userId, encryptionKey })
              └─ Immediate pull (critical for join flow)
```

### `SyncInitializer` component

```tsx
function SyncInitializer({ wedding }: { wedding: WeddingRegistryEntry }) {
  useEffect(() => {
    // Teardown previous instance if switching weddings
    if (getStarfishStore()) teardownStarfish();

    // Guard: sync requires seedPhrase + not disabled + premium + server URL
    if (!wedding.seedPhrase || wedding.syncDisabled || !isPremium()) return;
    const serverUrl = wedding.serverUrl || process.env.EXPO_PUBLIC_SYNC_URL;
    if (!serverUrl) return;

    let cancelled = false;
    (async () => {
      const authToken = await deriveAuthToken(wedding.seedPhrase!);
      if (cancelled) return;
      const userId = authToken.slice(0, 16);
      const encryptionKey = await deriveEncryptionKey(wedding.seedPhrase!, userId);
      if (cancelled) return;
      initStarfish({ serverUrl, authToken, userId, encryptionKey });
      // Immediate pull — so data appears right after joining
      const sf = getStarfishStore();
      if (sf && !cancelled) {
        try { await sf.getState().pull(); } catch { /* sync will retry */ }
      }
    })();

    return () => { cancelled = true; };
  }, [wedding.id]);

  return null;
}
```

Re-runs when `wedding.id` changes (wedding switching).

---

## Network & Lifecycle Handling

### Background flush

When the app goes to background, if there are dirty (un-pushed) changes, flush immediately:

```ts
AppState.addEventListener("change", (state) => {
  if (state === "background") {
    const sf = getStarfishStore();
    if (sf?.getState().dirty) {
      sf.getState().flush();
    }
  }
});
```

### Network connectivity

NetInfo listener updates the store's `online` state. When connectivity returns and there are pending changes, `setOnline(true)` triggers an automatic `flush()`:

```ts
NetInfo.addEventListener(({ isConnected }) => {
  const sf = getStarfishStore();
  if (sf) sf.getState().setOnline(!!isConnected);
});
```

---

## Feature Gates

Sync is only initialized when **all** conditions are met:

| Condition | Source |
|-----------|--------|
| `wedding.seedPhrase` exists | Wedding registry (secure store) |
| `wedding.syncDisabled` is falsy | Wedding registry |
| `isPremium()` returns true | `lib/premium.ts` |
| Server URL is available | `wedding.serverUrl` or `EXPO_PUBLIC_SYNC_URL` env var |

If any condition is not met, `SyncInitializer` returns early and no sync infrastructure is created.

---

## Schema Versioning & Migrations

### Backup version

Current version: **2**. Stored in `backup.version`.

On restore, the app checks:
- `backup.version > BACKUP_VERSION` → error: user must update the app
- `backup.version < BACKUP_VERSION` → migration applied

### v1 → v2 migrations

Applied during `restoreFromBackup()`:

**Field renames:**
| v1 | v2 |
|----|----|
| `jourJItems` | `dayOfItems` |
| `forfaitPersonnel` | `staffFee` |
| `forfaitDeplacement` | `travelFee` |

**Pricing key renames:**
| v1 | v2 |
|----|----|
| `repas` | `dinner` |
| `boisson` | `drinks` |
| `lendemain` | `next-day` |
| `vaisselle` | `tableware` |
| `nappe` | `linen` |
| `vegetarien` | `vegetarian` |
| `enfant` | `child` |
| `presta` | `service` |

**Idea category renames:**
| v1 | v2 |
|----|----|
| `DECO_TABLE` | `TABLE_DECOR` |
| `DECO_SALLE` | `VENUE_DECOR` |
| `DECO_CEREMONIE` | `CEREMONY_DECOR` |
| `TENUE` | `ATTIRE` |
| `GATEAU` | `CAKE` |
| `LIEU` | `VENUE` |

---

## Server API

The Starfish server exposes two endpoints per collection:

### Pull

```
GET /pull/wedding/{userId}?checkpoint={timestamp}
Authorization: Bearer {authToken}
Accept: application/json

Response 200:
{
  "data": { "_encrypted": "<base64>" },
  "hash": "<sha256-hex>",
  "timestamp": 1712345678
}
```

### Push

```
POST /push/wedding/{userId}
Authorization: Bearer {authToken}
Content-Type: application/json

{
  "data": { "_encrypted": "<base64>" },
  "baseHash": "<sha256-hex-or-null>"
}

Response 200: { "hash": "<sha256-hex>", "timestamp": 1712345678 }
Response 409: Conflict (baseHash mismatch)
```

The `hash` is a SHA-256 digest of the stable-stringified (sorted keys) encrypted payload. It is computed by the server and used for conflict detection — the client never needs to compute it locally.

---

## File Map

| File | Role |
|------|------|
| `lib/starfish.ts` | Integration layer: init, notifySync, merge, store management |
| `lib/sync.ts` | Backup document creation, restoration, v1→v2 migration |
| `lib/identity.ts` | Passphrase generation, auth/encryption key derivation, invite URLs |
| `lib/crypto.ts` | Standalone AES-256-GCM utilities (not used by sync pipeline) |
| `lib/persistence.ts` | SQLite write-through, hydration, bulk restore |
| `app/_layout.tsx` | `SyncInitializer` component, background/network listeners |
| `store/*.ts` | Domain stores — each mutation calls `notifySync()` |
| `db/schema.ts` | 11 SQLite tables defining the data model |
