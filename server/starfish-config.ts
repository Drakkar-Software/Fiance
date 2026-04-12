import type { SyncConfig } from "@drakkar.software/starfish-server";

export const config: SyncConfig = {
  version: 1,
  collections: [
    {
      name: "wedding",
      storagePath: "wedding/{identity}",
      readRoles: ["self"],
      writeRoles: ["self"],
      encryption: "none",
      maxBodyBytes: 1_048_576,
      allowedMimeTypes: ["application/json"],
    },
    {
      name: "wedding-page",
      storagePath: "wedding-page/{identity}",
      readRoles: ["public"],
      writeRoles: ["self"],
      encryption: "none",
      maxBodyBytes: 524_288,
      allowedMimeTypes: ["application/json"],
    },
    {
      name: "rsvp-roster",
      storagePath: "rsvp-roster/{identity}",
      readRoles: ["public"],
      writeRoles: ["self"],
      encryption: "none",
      maxBodyBytes: 524_288,
      allowedMimeTypes: ["application/json"],
    },
    {
      name: "rsvp-inbox",
      storagePath: "rsvp-inbox/{identity}",
      readRoles: ["self"],
      writeRoles: ["public"],
      encryption: "none",
      maxBodyBytes: 65_536,
      allowedMimeTypes: ["application/json"],
      ttlMs: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
    {
      name: "gift-claims",
      storagePath: "gift-claims/{identity}",
      readRoles: ["self"],
      writeRoles: ["public"],
      encryption: "none",
      maxBodyBytes: 16_384,
      allowedMimeTypes: ["application/json"],
      ttlMs: 90 * 24 * 60 * 60 * 1000, // 90 days
    },
    {
      name: "analytics-events",
      storagePath: "analytics/{identity}/events",
      readRoles: [],
      writeRoles: ["public"],
      encryption: "none",
      maxBodyBytes: 65_536,
      allowedMimeTypes: ["application/json"],
      ttlMs: 90 * 24 * 60 * 60 * 1000, // 90 days
      // TODO: restore queueOnly: true once queueOnly + writeRoles["public"] is supported
      queueOnly: false,
    },
  ],
};
