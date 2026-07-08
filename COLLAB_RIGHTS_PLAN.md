# Collaborator Rights — Roles & Per-Feature Permissions

Owner-defined **roles** (with per-feature permissions) chosen when generating an invite
link, so a collaborator joins a wedding with **limited rights** instead of today's
all-or-nothing full access.

This document is the design study **and** the phased implementation roadmap.
**Phases 1–2 are being implemented now; Phases 3–5 are specified but not built.**

---

## Context

Today sharing a wedding is **all-or-nothing**. A wedding lives in one Starfish "space"
encrypted under **one keyring / one CEK**. The owner mints a bearer invite link
(`createSpaceInviteLink(..., write=true, ...)`); the joiner registers as `role:"member"`
and can **read and write all 28 collections**. There is no read-only mode, no per-feature
scoping, no member list, and no revocation UI.

We want the owner to **pick a role when generating an invite**, **edit roles and their
per-feature permissions**, and have those rights enforced. Enforcement is **layered** — a
role declares its own `tier`, and each tier maps to a stronger mechanism.

### Established facts (from codebase exploration)

- **One space = one keyring = one CEK.** Every admin collection is a node
  `col:{type}:{weddingNodeId}`, `access:'space', enc:true`. Any member decrypts everything
  (`apps/mobile/lib/space-sync.ts`; satellite `space-access.ts`).
- **`write` boolean is the only built-in role axis.**
  `createSpaceInviteLink(session, spaceId, name, write, origin)` →
  `spaceMemberScope(spaceId, canWrite)` → `ops:["read","list"]` vs `+["write"]`
  (`apps/mobile/lib/invite-link.ts`; satellite `layout.ts`).
- **Server auth is cap-based, no role table.** The **path gate** (`scope.paths`) is
  enforced independently of roles — the finest reliable server lever.
- **BLOCKING UNKNOWN for server enforcement:** whether `write=false` is *actually*
  enforced depends on the **dk server's `objdoc`/`objindex` `writeRoles`** —
  `cap:write:*` ⇒ enforced; `space:member` (roster) ⇒ client hint only. That config is in
  neither client repo (dk deployment). Must be verified before promising a "read-only role".
- **Per-node keyring primitive exists** (satellite `node-keyring.ts`,
  `createNodeInviteLink({isolated:true})`) → true crypto partition possible, but needs
  re-architecting the one-keyring sync path.
- **Plaintext scoped-share precedent exists**: public page (`pub-{weddingNodeId}`) and RSVP
  nodes are `access:'invite', enc:false` with per-node caps (`public-page.ts`,
  `rsvp-sync.ts`). No membership, no keyring.
- **Data is already per-collection nodes** → per-collection scoping is addressable.
- **Registry** (`wedding-registry.ts`, SecureStore, `role:"owner"|"member"`) is local-only,
  **outside the backup chain** → an owner's role choice can't reach a member locally; it
  must travel via sync.
- SDK ships unused `removeSpaceMember` (roster only) and `revokeSpaceAccess`
  (keyring rotation — the real eviction for an `enc` space).

---

## Options studied (capabilities · security · flexibility · simplicity)

Threat model: wedding collaborators (partner, parents, planner, vendor) are
**semi-trusted, not adversarial**. Real threats = accidental edits, privacy leakage,
"scope this helper to one surface". *Not* in scope: a collaborator running a patched client
to replay their own caps against the raw API. Two possible guarantees:
**server-gated fetch** (encrypted-to-them but server won't deliver/accept) vs
**cryptographically impossible** (their key never wrapped that data).

### A — Client-side roles & per-feature permissions (UX gating)
`useCan(surface, action)` gates tabs/buttons from a synced role+assignment model.
- **Capabilities** ★★★ arbitrary per-feature, editable custom roles — exactly the ask.
- **Security** ★ cosmetic for a `write=true` member (holds keyring + write cap). Real only combined with B/C.
- **Flexibility** ★★★ · **Simplicity** ★★★ pure client · **Offline-first** ★★★.

### B — Server-enforced Viewer (whole-space read-only, `write=false`)
- **Capabilities** ★★ all-or-nothing read-only; viewer still reads every collection.
- **Security** ★★ genuine write-block *iff* dk gates writes by `cap:write:*` (else illusory).
- **Flexibility** ★ · **Simplicity** ★★★ client ≈ zero (blocked on dk verification) · **Offline** ★★★.

### C — Path-scoped member cap (hide some collections server-side, no crypto change)
Narrow `scope.paths` (allow node subtree, `!`-deny hidden collections).
- **Capabilities** ★★★ selective hide, read+write.
- **Security** ★★ server-gated fetch. Residual weakness: member still holds space CEK;
  `_index` (must stay in scope) leaks existence/count/type of hidden collections.
- **Flexibility** ★★★ · **Simplicity** ★★ client glob logic, no dk config change · **Offline** ★★★.

### D — Crypto partition (per-node keyrings, `isolated` invites)
Restricted collections become `access:'invite', enc:true` isolated nodes; member added as
recipient only for authorized ones.
- **Capabilities** ★★★ · **Security** ★★★★ cryptographically impossible to read others.
- **Flexibility** ★★★ · **Simplicity** ★ large re-architecture of `space-sync.ts`
  (drops one-keyring batch-pull + `spaceEncryptorCache`; per-node recipient/cap lifecycle;
  co-owner = wrap 28 keyrings + ~56–84 caps; revoke = rotate up to 28 keyrings) · **Offline** ★.

### E — View-only web share (extend the public page)
Per surface, publish a hand-built **plaintext** projection node + read-only node cap.
- **Capabilities** ★★ read-only share-out of a hand-picked subset.
- **Security** ★★★ safe-by-omission for hidden data; shown data plaintext on server
  (fine for non-sensitive projections, not PII/budgets).
- **Flexibility** ★★ · **Simplicity** ★★★ reuses `public-page.ts`/`rsvp-sync.ts`, no server change · **Offline** ★★★.

### Comparison matrix (1 worst – 4 best)

| Axis | A UX | B Viewer | C Path-scoped | D Per-node crypto | E Web projection |
|---|---|---|---|---|---|
| Capability | 3 | 2 | 3 | 4 | 2 |
| Security | 1 | 2 | 2 | 4 | 3 |
| Flexibility | 4 | 1 | 3 | 4 | 2 |
| Simplicity/effort | 4 | 4\* | 3 | 1 | 4 |
| Offline-first | 4 | 4 | 3 | 1 | 4 |
| dk server work | none | verify/maybe change | verify only | likely | none |

\* B is trivial client-side but blocked on the server-config verification.

### Layered design — a role picks its own tier

```
RoleDefinition {
  id; name; isSystem; canWrite; matrix; tier; createdAt; updatedAt;
  matrix: { guests|vendors|planning|budget|ideas -> "view"|"edit" }  // absent surface = hidden
  tier:  "app-cosmetic"   // Layer A only (UX gating)      — semi-trusted helper
       | "app-readonly"   // A + B  (server write-block)    — trusted viewer, sees all
       | "app-scoped"     // A + B + C (server hide)        — Phase 4
       | "web-view"       // Layer E (plaintext projection) — Phase 3
       | "app-crypto"     // Layer D (per-node keyrings)    — Phase 5
}
```

`canWrite` is derived: `true` iff any surface is `edit` **and** tier ∈ {`app-cosmetic`,`app-scoped`}.
Owner is always implicit full-access.

---

## Phased roadmap

### ✅ Phase 1 — A: client roles + per-feature permissions (UX gating) — **building now**

Ships the core ask (per-feature custom roles, chosen at invite time). Pure client;
cosmetic enforcement but complete UX and data model.

- **Domain types** (`packages/fiance-sdk/src/domain/schema.ts`): `RoleDefinition`,
  `PermissionAssignment`, `PermissionMatrix`, `FeatureSurface`, `PermissionAction`,
  `RoleTier`; `DEFAULT_PERMISSION_ROLES` (Éditeur / Lecteur / Planificateur).
- **Store** (`apps/mobile/store/usePermissionsStore.ts`, pattern = `useWeddingPartyStore`):
  `roles`, `assignments`, CRUD + `setRoles/setAssignments`; each mutation →
  `persistPermissions` → `notifySync()`.
- **Persistence** (`apps/mobile/lib/persistence.ts`): KV keys `permissionRoles`,
  `permissionAssignments`; wired into `hydrateAllStores`/`clearAllStores`.
- **Backup v15 → v16** (`packages/fiance-sdk/src/sync/backup.ts`): add the two collections;
  empty-seed system roles on restore; keep `version>16` throw.
- **Real-time sync** (`object-types.ts` + `mappers.ts` + `space-sync.ts` `collectionSources()`
  + hydrate dispatch): owner-authored, `access:'space', enc:true`.
- **Registry cache** (`wedding-registry.ts` + `.web.ts`, `useWeddingRegistryStore`):
  `roleId?`, `permissions?: PermissionMatrix` on the active member's entry.
- **Join resolution** (`join-space.ts`): match the token's ephemeral `subUserId` to an
  assignment, cache the resolved matrix on the entry; re-resolve when the collection hydrates.
- **Hook** (`apps/mobile/lib/permissions/usePermissions.ts`): `usePermissions()` +
  `useCan(surface, action)`. Owner ⇒ `true`.
- **Gating**: `app/(tabs)/_layout.tsx` (tab visibility) + feature-screen add/edit/delete controls.
- **Invite UI**: role picker in `InviteQRSheet.tsx`; `createInviteLink(entry, roleId)`
  writes the assignment; owner-only "Rôles & permissions" entry in `settings/index.tsx`.
- **Management screen** `app/settings/roles.tsx`: role editor (5×2 matrix + tier picker),
  member list, role reassign, remove via `revokeSpaceAccess` + `removeAssignment`.
- **i18n**: `settings.json` (fr + en), no hardcoded strings.

### ✅ Phase 2 — B: server-enforced Viewer (`write=false`) — **building now**

- `invite-link.ts` passes `role.canWrite` (not hardcoded `true`) as the 4th arg to
  `createSpaceInviteLink`. `Lecteur`/`Planificateur` → read-only cap.
- **Verification gate** — read the dk server `objdoc`/`objindex` `writeRoles`. If roster-gated,
  the read-only tier is a client hint until dk changes `writeRoles`→`cap:write:*`. UI copy is
  honest about the current guarantee; the client change ships regardless.

### ⏳ Phase 3 — E: web view-only projections (not built)

Per shareable surface, add a plaintext projection builder (like `buildPublicPageDocument`),
push to an `access:'invite', enc:false` node, mint a read-only `createNodeInviteLink(..., false)`,
render at `app/wedding/[id].tsx`. `web-view` roles produce a link, not a membership. The
projection function is the security boundary → unit-test that no unselected field leaks.
Pros/cons: option **E** above.

### ⏳ Phase 4 — C: path-scoped per-collection hide (not built)

`app-scoped` roles mint a member cap with a narrowed `scope.paths` (allow
`spaces/{spaceId}/objects/**` + `_index`, `!`-deny hidden collections' sentinel nodes).
Server-gated (no dk config change if the path gate + per-key batch check are mounted).
Document the `_index` metadata leak and the CEK-still-held residual weakness in code.
Pros/cons: option **C** above.

### ⏳ Phase 5 — D: crypto partition via per-node keyrings (not built)

Reserved for adversarial sharing. Move restricted collections onto isolated per-node
keyrings; a member's KEM key is never wrapped to unauthorized CEKs → decryption
cryptographically impossible. Requires the `space-sync.ts` rework (drop the one-keyring
batch-pull + `spaceEncryptorCache`, per-node recipient/cap lifecycle, per-node revoke).
The existing RSVP/public-page isolated nodes show the shape; a single narrow external
surface (e.g. "vendor edits only their quote") could adopt D without the full rework.
Pros/cons: option **D** above.

---

## Status (implemented)

**Phase 1 + Phase 2 shipped.** Role model (SDK `domain/permissions.ts`), synced `permissionRoles`/`permissionAssignments` collections (backup **v16** in both `packages/fiance-sdk/src/sync/backup.ts` and `apps/mobile/lib/sync.ts`, real-time via `space-sync.ts`), registry-cached matrix + join-time resolution (`lib/permissions/resolve.ts`, re-run reactively in `providers.tsx`), the `useCan()` hook, tab-visibility gating (native + web), the invite role picker + role-scoped `write` flag (`invite-link.ts`), and the `settings/roles.tsx` editor (Garden Press UI: Fraunces monograms, olive = built-in / clay = custom). All tests green; web export clean (`grep -c ExpoUI` = 0).

**Two scoped follow-ups inside Phase 1** (not blockers, documented so they aren't mistaken for done):
- **Edit-control gating** currently covers tab visibility + the *primary add* affordance on guests/vendors/planning. Per-control edit/delete gating inside detail screens is not yet wired — for a view-only role a visible tab still exposes deeper edit buttons. Extend `useCan(surface, "edit")` across the detail screens to close this.
- **Revocation** removes the assignment (client) only; it does not yet call `revokeSpaceAccess` (keyring rotation). Regenerating the invite link is the real cut-off today. Wire `revokeSpaceAccess` for true eviction.

**Phase 2 open item:** the read-only tier's server enforcement still depends on the dk server's `objdoc`/`objindex` `writeRoles` (see verification step 6) — not verifiable from these repos. The client ships the `write=false` cap regardless; UI copy is honest about the current guarantee.

## Verification (Phases 1–2)

1. `pnpm test` + `pnpm --filter fiance build:web` green.
2. Assignment round-trip: owner picks Lecteur → link → join on a 2nd identity → entry gets
   `role-viewer` + matrix, restricted tabs hide, edit controls gone.
3. Backup v16 round-trip: a v15 import seeds the 3 system roles, no crash; a v16 export
   re-imports intact; `version>16` still throws.
4. Hydrate ordering: permissions landing *after* join re-resolves the matrix, tabs update reactively.
5. Owner never locked out, even with a stray assignment referencing its id.
6. Phase 2 server check: join a `write=false` invite, attempt a mutating push, record 403 vs
   200 (documents whether B is truly server-enforced).
