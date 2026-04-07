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
  ],
};
