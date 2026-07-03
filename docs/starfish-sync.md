# Starfish Sync — Architecture & Implementation

Fiancé uses [Starfish](https://github.com/Drakkar-Software/starfish) (`@drakkar.software/starfish-client` v2.3.0) for end-to-end encrypted cloud sync between devices. This document covers the full architecture: how the client is integrated, how data flows, how encryption works, and how conflicts are resolved.

---

## Table of Contents

1. [High-Level Overview](#high-level-overview)
2. [Starfish Client SDK](#starfish-client-sdk)
3. [Integration Layer (`apps/mobile/lib/starfish.ts`)](#integration-layer)
4. [Identity & Key Derivation (`apps/mobile/lib/identity.ts`)](#identity--key-derivation)
5. [Encryption](#encryption)
6. [Backup Document Format (`packages/fiance-sdk/src/sync/backup.ts`)](#backup-document-format)
7. [Push Flow](#push-flow)
8. [Pull Flow](#pull-flow)
9. [Conflict Resolution](#conflict-resolution)
10. [Persistence Architecture](#persistence-architecture)
11. [Initialization Sequence](#initialization-sequence)
12. [Network & Lifecycle Handling](#network--lifecycle-handling)
13. [Feature Gates](#feature-gates)
14. [Schema Versioning & Migrations](#schema-versioning--migrations)
15. [Network Resilience](#network-resilience)
16. [Sync Status](#sync-status)

---

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Fiancé App                            │
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

> **⚠️ This document describes the original single-blob `SyncManager` model.** Live multi-device
> sync has since moved to the **ObjectNode space model** (`apps/mobile/lib/space-sync.ts` +
> `@drakkar.software/starfish-spaces`). The single-blob `createBackupDocument()` path now backs
> only JSON export/import. The section below documents the current live-sync path; the rest of
> this file is retained for the export/backup format and key-derivation details, which still apply.

---

## Live sync: ObjectNode space model & per-collection documents (current)

The live, multi-device path no longer pushes one blob. It stores data as an **ObjectNode tree**
inside a Starfish *space*: a single shared **object index** (all node metadata) plus separate
encrypted **content docs**. `notifySync()` → `dispatchDocChange('*')` → `scheduleSyncPush()`
(debounced 2 s) → `pushSpaceSnapshot()`; hydration is `hydrateFromSpace()` on boot/foreground.
All admin content is `access:'space', enc:true` (client-side AES-256-GCM under the space keyring);
the server stores opaque `{ "_encrypted": … }`. The guest-facing `publicPage` (one/wedding) and
`rsvp` (one/guest) nodes are separate `access:'invite'` surfaces and are **never** folded into
admin data.

### Granularity: one document per collection

Content is stored **one document per collection** — all guests in one doc, all vendors in one,
etc. — keyed by a deterministic sentinel node id `col:{type}:{weddingNodeId}` at
`spaces/{spaceId}/objects/docs/{sentinelId}`. (The `wedding` root stays its own singleton doc.)
Because Starfish has **no batch-push** (one document = one key = one CAS `POST`), collapsing a
collection means a bulk action — e.g. importing 120 guests — is a **single** write instead of 120.

The collection doc is an **id-keyed map**, not an array, so two devices adding different entities
touch disjoint keys and merge cleanly:

```ts
interface CollectionDoc {
  fmt: 2;
  items:      Record<string, Entity>;   // entityId → full entity
  rev:        Record<string, number>;   // entityId → ms of last local change (LWW arbiter)
  tombstones: Record<string, number>;   // entityId → ms of deletion (durable delete)
}
```

Pure helpers live in `packages/fiance-sdk/src/sync/collection-doc.ts`: `mergeCollectionDoc`,
`buildCollectionDoc`, `collectionNodeId`, `asCollectionDoc`, `liveItems`.

### Delete-safety via tombstones

`mergeCollectionDoc(cur, local)` is used as **both** the normal-push transform and the CAS-retry
mutator (Starfish runs the mutator against the freshly-pulled remote on every attempt). Per entity
id: the live copy wins iff a live copy exists and its `rev` ≥ the newest tombstone (add-wins on a
tie → re-add after delete resurrects); otherwise the tombstone wins. Because the collection node
never leaves the index, `cur` always carries the tombstone forward, so a peer's stale
full-collection push **cannot** resurrect a deleted entity — fixing the union-merge deletion
limitation noted in [Conflict Resolution](#conflict-resolution) below. Tombstones older than a
90-day TTL are garbage-collected on build/merge.

### Rollout: expand / migrate / contract

The migration from the earlier one-doc-per-**entity** model runs in stages:

- **Expand (current release):** `pushSpaceSnapshot` **dual-writes** — the legacy per-entity nodes
  *and* the per-collection docs — and `hydrateFromSpace` **dual-reads** — pulling the collection
  docs (one `batchPullMany` over the sentinel ids) *and* the legacy per-entity nodes, unioning
  them (collection items win, tombstones remove) so a legacy-only entity written by an old-build
  peer survives. Old-build devices keep reading per-entity nodes untouched. No request-count win
  yet (dual-write is strictly more work) — this step exists purely for rollout safety.
- **Contract (later release):** stop writing per-entity nodes, prune the legacy per-entity entries
  from the index, set `syncSchemaVersion: 2` on the wedding root, and retire the in-memory
  `_deletedNodeIds` mechanism (deletes then flow purely through collection tombstones). This is
  where the bulk-import request-count reduction lands.

**Files:** `apps/mobile/lib/space-sync.ts` (build/push/hydrate),
`packages/fiance-sdk/src/sync/collection-doc.ts` (pure merge/build helpers).

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
- Persistence is disabled (`storage: false`) — Fiancé manages its own persistence through SQLite/localStorage

---

## Integration Layer

**File:** `apps/mobile/lib/starfish.ts`

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

1. Instantiates `StarfishClient` with Bearer auth and a **retry-capable fetch wrapper** (see [Network Resilience](#network-resilience))
2. Creates `SyncManager` with encryption config + custom `mergeBackups` conflict resolver
3. Creates the Zustand store via `createStarfishStore()`
4. Subscribes to `store.data` changes to detect incoming remote pulls and trigger `restoreFromBackup()`
5. Subscribes to `syncing` transitions to track `lastSyncTimestamp` on successful push/pull completion

The data subscription has a guard: it only restores when `!isRestoring`, preventing a feedback loop where pushing our own data triggers a restore.

### `notifySync()`

Called by every domain store mutation (add/update/remove). Three responsibilities:

1. **Web persistence:** calls `saveToLocalStorage()` immediately
2. **Pre-push validation:** estimates encrypted document size (JSON size × 1.34 for base64 overhead). Logs a warning at 900KB and an error at 1MB (the server's `maxBodyBytes` limit)
3. **Remote push:** debounced by 2000ms. On fire:
   - Creates the backup document and validates its size
   - Sets `isRestoring = true` (prevents subscription loop)
   - Calls `store.getState().set(() => doc)` which triggers `flush()`

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
| `getLastSyncTimestamp()` | Last successful sync time (push or pull) |
| `getSyncStatus()` | Derived sync status: `synced \| pending \| syncing \| error \| offline` |
| `teardownStarfish()` | Clean up everything |
| `onSyncStatusChange(listener)` | Subscribe to sync enable/disable events |

---

## Identity & Key Derivation

**File:** `apps/mobile/lib/identity.ts`

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
fiance://join?t={urlSafeBase64(JSON.stringify({ n: name, p: password }))}
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

**File:** `packages/fiance-sdk/src/sync/backup.ts`

The backup document is a flat snapshot of all domain store state:

```ts
interface BackupData {
  version: 4;              // schema version (current)
  timestamp: string;       // ISO 8601 creation time
  wedding: Wedding;        // singleton record
  guests: Guest[];
  tables: Table[];
  guestGroups: GuestGroup[];
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
  ├─ Creates backup document (snapshots all 5 stores)
  ├─ Validates size (~900KB warn, ~1MB error)
  ├─ Sets isRestoring = true (prevents restore loop)
  ├─ Calls store.set(() => doc) → triggers flush()
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

However, since Fiancé uses E2E encryption, incremental pulls always return the full encrypted blob (the server can't merge encrypted documents). The checkpoint is still useful for the server to short-circuit "no changes" responses.

---

## Conflict Resolution

**File:** `apps/mobile/lib/starfish.ts` — `mergeBackups(local, remote)`

Conflicts occur when two devices push simultaneously. The server detects this via `baseHash` mismatch (the client's `lastHash` doesn't match the server's current hash).

### Resolution flow

1. Push fails with 409
2. Client pulls the remote document
3. Client decrypts remote
4. Calls `mergeBackups(localData, remoteData)`
5. Re-pushes merged result

### Merge algorithm

For each key in the backup document:

- **Arrays with `id` fields** (guests, vendors, tasks, etc.): **ID-based union with per-item `updatedAt` comparison**
  - Build a map from remote array (keyed by `id`)
  - For each local item:
    - If no remote counterpart exists → add to map (local-only item)
    - If a remote counterpart exists → compare `updatedAt` timestamps, keep the newer version
    - If neither has `updatedAt` → fall back to local (preserves pre-existing behavior)
  - Result: union of both sets, with per-item newest version winning

- **Scalar values** (version, timestamp, wedding singleton): **Latest document timestamp wins**
  - Compare `local.timestamp` vs `remote.timestamp` (string comparison)
  - If remote is newer: use remote value
  - Otherwise: keep local value

### Limitations

- Per-item, not per-field: if two devices edit different fields of the same guest, the merge picks the item with the newer `updatedAt` (not a field-level merge)
- Deletions on one device will be restored from the other device's stale copy (union merge). A soft-delete/tombstone pattern would be needed to fix this
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

- **SQLite** is the source of truth. 12 tables via Drizzle ORM.
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
taskCategories → quotePricing → vendors → guests → tables → guestGroups
```

**Insert phase** (parents first):
```
wedding (update) → guestGroups → tables → guests → vendors → quotePricings →
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

### AppState listener

A single `AppState` listener handles both background flush and foreground pull:

```ts
AppState.addEventListener("change", (state) => {
  const sf = getStarfishStore();
  if (!sf) return;
  if (state === "background") {
    if (sf.getState().dirty) {
      sf.getState().flush();
    }
  } else if (state === "active") {
    const { online, syncing } = sf.getState();
    if (online && !syncing) {
      sf.getState().pull().catch(() => {});
    }
  }
});
```

- **Background:** flushes pending changes immediately so data is synced before the OS may suspend the app
- **Foreground (pull-on-resume):** pulls partner's changes when the app returns from background. Guards against pulling while offline or already syncing. Errors are silently caught (the SDK will retry on next opportunity)

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

Current version: **4**. Stored in `backup.version`.

On restore, the app checks:
- `backup.version > BACKUP_VERSION` → error: user must update the app
- `backup.version < BACKUP_VERSION` → inline migrations applied during `restoreFromBackup()`

### v1 → v2 migrations

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

### v2 → v3 migrations

**Invitation type renames on guests:**
| v2 | v3 |
|----|----|
| `DINNER` | `FULL` |
| `NEXT_DAY` | `BOTH_DAYS` |

Also migrates `pppSource` on vendors with the same mapping.

### v3 → v4 migrations

Added `companionId` field on guests (nullable). No data transformation needed — the field defaults to `null` on older backups.

### Task status normalization

Applied at all versions: legacy `IN_PROGRESS` and `CANCELLED` task statuses are silently normalized to `TODO` during restore.

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
| `apps/mobile/lib/starfish.ts` | Integration layer: init, notifySync, merge, retry fetch, sync status |
| `packages/fiance-sdk/src/sync/backup.ts` | Backup document creation, restoration, v1→v4 migration chain |
| `packages/fiance-sdk/src/sync/rsvp.ts` | RSVP roster/inbox pure helpers (buildRsvpRoster, mergeSubmissions) |
| `packages/fiance-sdk/src/sync/public-page.ts` | Public wedding page data serialization |
| `apps/mobile/lib/identity.ts` | Passphrase generation, auth/encryption key derivation, invite URLs |
| `apps/mobile/lib/crypto.ts` | Standalone AES-256-GCM utilities (not used by sync pipeline, requires Web Crypto API) |
| `apps/mobile/lib/persistence.ts` | KV write-through, hydration, bulk restore |
| `apps/mobile/app/_layout.tsx` | `SyncInitializer` component, background flush, foreground pull, network listeners |
| `apps/mobile/app/(tabs)/settings/index.tsx` | Sync toggle UI, derived sync status display, import/export |
| `apps/mobile/store/*.ts` | Domain stores — each mutation calls `notifySync()` |
| `apps/mobile/db/schema.ts` | Type shim → re-exports entity types from `@fiance/sdk` |
| `drakkar_sync/apps/fiance/collections.py` | Server-side collection config (16 collections in `/v1/fiance` namespace) |

---

## Network Resilience

**File:** `apps/mobile/lib/starfish.ts` — `createRetryFetch()`

The `StarfishClient` is initialized with a custom fetch wrapper that retries on **network-level errors** (DNS failures, connection resets, timeouts):

```ts
const client = new StarfishClient({
  baseUrl: config.serverUrl,
  auth: async () => ({ Authorization: `Bearer ${config.authToken}` }),
  fetch: createRetryFetch(3, 500),
});
```

### Retry behavior

- **Retries:** up to 3 attempts
- **Backoff:** exponential — `min(500ms × 2^attempt, 10s) + random(0–100ms)` jitter
- **Scope:** only catches network-level `fetch` errors (e.g., `TypeError: Failed to fetch`). HTTP responses (including 5xx) are **not** retried by this layer — those are handled by the `SyncManager`'s built-in conflict retry (`maxRetries: 3` for 409 responses)

This separation prevents retry amplification: if both layers retried 5xx errors, a single failing push could produce dozens of requests.

### Pre-push size validation

Before each push, the serialized document size is estimated with a 1.34× multiplier (base64 overhead from encryption). The server's `maxBodyBytes` is 1MB:

- **Warning** at 900KB estimated encrypted size
- **Error** at 1MB — the push will likely fail server-side

Both are logged to console. The push still proceeds (to avoid silently dropping data), but the logs help diagnose why sync might be failing for large weddings.

---

## Sync Status

**File:** `apps/mobile/lib/starfish.ts` — `getSyncStatus()`

Derives a human-readable sync status from the Starfish store state:

```ts
type SyncStatusValue = "synced" | "pending" | "syncing" | "error" | "offline";
```

Priority order (first match wins):
1. `!online` → **offline**
2. `error` set → **error** (includes the error message)
3. `syncing` → **syncing** (operation in flight)
4. `dirty` → **pending** (local changes not yet pushed)
5. Otherwise → **synced**

### Settings UI

The settings screen (`apps/mobile/app/(tabs)/settings/index.tsx`) subscribes reactively to the Starfish store and displays the derived status alongside the last sync timestamp:

```
Toutes les données sont synchronisées · Dernière synchro : 06/04/2026 14:32
```

The subscription updates on every store state change (no polling). i18n keys are provided in both French and English:

| Key | FR | EN |
|-----|----|----|
| `syncStatusSynced` | Toutes les données sont synchronisées | All data is synced |
| `syncStatusSyncing` | Synchronisation en cours… | Syncing… |
| `syncStatusPending` | Modifications en attente | Unsaved changes |
| `syncStatusOffline` | Hors ligne — synchronisation à la reconnexion | Offline — will sync on reconnect |
| `syncStatusError` | Erreur de synchronisation | Sync error |

### `lastSyncTimestamp`

Tracked via a store subscription that watches `syncing` transitions: when `syncing` goes from `true` → `false` with no `error`, the timestamp is recorded. This ensures it only reflects actual server-confirmed sync completions (not optimistic local writes).
