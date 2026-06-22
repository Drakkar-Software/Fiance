/**
 * Starfish collection layout — `fiance` content namespace.
 *
 * All wedding-domain object collections. No registry collections (spaces,
 * spacekeyring, etc.) — those live in the shared `octospaces` namespace.
 *
 * E2EE invariant: `encryption:"delegated"` means the CLIENT seals content
 * before upload; the server stores opaque bytes. `encryption:"none"` means
 * the server stores plaintext (or client-sealed blobs with no server contract).
 *
 * Mounted at /v1/fiance/ by the Worker.
 */
import type { SyncConfig } from "@drakkar.software/starfish-server";

const JSON_ONLY = ["application/json"];

export const fianceSyncConfig: SyncConfig = {
  version: 1,
  collections: [
    // ── Generic object family (mirrors octospaces generic collections) ─────────

    // Object tree — union-merged list of every ObjectNode (plaintext, member-gated).
    {
      name: "objindex",
      storagePath: "spaces/{spaceId}/objects/_index",
      readRoles: ["space:member"],
      writeRoles: ["space:member"],
      encryption: "none",
      maxBodyBytes: 262_144,
      allowedMimeTypes: JSON_ONLY,
    },
    // LWW merge-doc — delegated E2EE. Stores the full domain entity.
    {
      name: "objdoc",
      storagePath: "spaces/{spaceId}/objects/docs/{objectId}",
      readRoles: ["space:member"],
      writeRoles: ["space:member"],
      encryption: "delegated",
      maxBodyBytes: 262_144,
      allowedMimeTypes: JSON_ONLY,
    },
    // Append-only WAL op-log — delegated E2EE, by_timestamp, author-signed.
    {
      name: "objlog",
      storagePath: "spaces/{spaceId}/objects/logs/{objectId}",
      readRoles: ["space:member"],
      writeRoles: ["space:member"],
      encryption: "delegated",
      appendOnly: { type: "by_timestamp", requireAuthorSignature: true },
      maxBodyBytes: 262_144,
      allowedMimeTypes: JSON_ONLY,
    },
    // LWW snapshot sibling for fast cold-start (alongside each objlog).
    {
      name: "objsnap",
      storagePath: "spaces/{spaceId}/objects/logs/{objectId}__snapshot",
      readRoles: ["space:member"],
      writeRoles: ["space:member"],
      encryption: "none",
      maxBodyBytes: 1_048_576,
      allowedMimeTypes: JSON_ONLY,
    },
    // Public node content (access:'public') — world-readable plaintext merge-doc.
    {
      name: "objpub",
      storagePath: "spaces/{spaceId}/objects/pub/{nodeId}",
      readRoles: ["public"],
      writeRoles: ["space:member"],
      encryption: "none",
      maxBodyBytes: 262_144,
      allowedMimeTypes: JSON_ONLY,
    },
    // Invite-only plaintext content (access:'invite'+enc:false) — cap-gated.
    // Gap-1 fix: roles explicitly wired so cap:read/write:objinv grants access.
    {
      name: "objinv",
      storagePath: "spaces/{spaceId}/objects/n/{nodeId}/content",
      readRoles: ["space:member", "cap:read:objinv"],
      writeRoles: ["space:member", "cap:write:objinv"],
      encryption: "none",
      maxBodyBytes: 262_144,
      allowedMimeTypes: JSON_ONLY,
    },
    // Raw binary blobs (client-sealed before upload — no server-side encryption contract).
    {
      name: "objblob",
      storagePath: "spaces/{spaceId}/objects/blobs/{blobId}",
      readRoles: ["space:member"],
      writeRoles: ["space:member"],
      encryption: "none",
      maxBodyBytes: 11_534_336,
      allowedMimeTypes: ["application/octet-stream"],
    },
    // Per-space custom type registry — delegated E2EE.
    {
      name: "typeindex",
      storagePath: "spaces/{spaceId}/types/_index",
      readRoles: ["space:member"],
      writeRoles: ["space:member"],
      encryption: "delegated",
      maxBodyBytes: 262_144,
      allowedMimeTypes: JSON_ONLY,
    },

    // ── Doubloon-compat: entitlements readable via cap-cert ───────────────────
    // Written by Doubloon's StarfishClient via the legacy Bearer router at the same
    // R2 key. Both routers share the same bucket so this collection picks up
    // whatever Doubloon wrote — no cross-namespace copy needed.
    // writeRoles is empty: the app never writes entitlements directly.
    {
      name: "entitlements",
      storagePath: "users/{identity}/entitlements",
      readRoles: ["cap:read:entitlements"],
      writeRoles: [],
      encryption: "none",
      maxBodyBytes: 4_096,
      allowedMimeTypes: JSON_ONLY,
    },
  ],
};
