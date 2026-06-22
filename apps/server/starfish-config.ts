/**
 * LEGACY collection layout — Bearer-auth-only router.
 *
 * Only the collections that still need the legacy Bearer admin resolver:
 *  - `entitlements` — written by Doubloon's StarfishClient via Bearer token
 *  - `analytics-events` — public-write, never needed cap-cert
 *
 * All wedding-domain collections (wedding, wedding-page, rsvp-roster, etc.)
 * are retired; data lives in the octospaces/fiance namespaces as ObjectNodes.
 *
 * TODO(doubloon-v3): once Doubloon is migrated to cap-cert auth, move
 * `entitlements` to the fiance namespace and delete this file.
 */
import type { SyncConfig } from "@drakkar.software/starfish-server";

export const config: SyncConfig = {
  version: 1,
  collections: [
    {
      name: "entitlements",
      storagePath: "users/{identity}/entitlements",
      readRoles: ["admin"],
      writeRoles: ["admin"],
      encryption: "none",
      maxBodyBytes: 4_096,
      allowedMimeTypes: ["application/json"],
    },
    {
      name: "analytics-events",
      storagePath: "analytics/{identity}/events",
      readRoles: [],
      writeRoles: ["public"],
      encryption: "none",
      maxBodyBytes: 65_536,
      allowedMimeTypes: ["application/json"],
      ttlMs: 90 * 24 * 60 * 60 * 1000,
      appendOnly: { type: "by_timestamp" },
    },
  ],
};
