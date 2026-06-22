import { Hono } from "hono";
import type { Context } from "hono";
import {
  createSyncRouter,
  createCapCertRoleResolver,
  createInMemoryNonceCache,
  createInMemoryRevocationStore,
  defaultServerPlugin,
  saveConfig,
  type ObjectStore,
  type AuthResult,
} from "@drakkar.software/starfish-server";
import { identitiesServerPlugin } from "@drakkar.software/starfish-identities";
import { sharingServerPlugin } from "@drakkar.software/starfish-sharing";

import { createSpacesRoleEnricher, createSpacesDirectoryServerPlugin } from "@drakkar.software/starfish-spaces";
import { CORS_ALLOW_HEADERS } from "@drakkar.software/starfish-protocol";
import { config as legacyConfig } from "./starfish-config";
import { octospacesSyncConfig } from "./octospaces-config";
import { fianceSyncConfig } from "./fiance-config";
import { createDoubloon, type DoubloonEnv } from "./doubloon";

// ---------------------------------------------------------------------------
// R2 ObjectStore using native Worker binding
// ---------------------------------------------------------------------------

class R2ObjectStore implements ObjectStore {
  constructor(private bucket: R2Bucket) {}

  async getString(key: string): Promise<string | null> {
    const obj = await this.bucket.get(key);
    if (!obj) return null;
    return obj.text();
  }

  async put(
    key: string,
    body: string,
    opts?: { contentType?: string; cacheControl?: string },
  ): Promise<void> {
    await this.bucket.put(key, body, {
      httpMetadata: {
        contentType: opts?.contentType,
        cacheControl: opts?.cacheControl,
      },
    });
  }

  async getBytes(
    key: string,
  ): Promise<{ body: Uint8Array; contentType: string } | null> {
    const obj = await this.bucket.get(key);
    if (!obj) return null;
    return {
      body: new Uint8Array(await obj.arrayBuffer()),
      contentType: obj.httpMetadata?.contentType ?? "application/octet-stream",
    };
  }

  async putBytes(
    key: string,
    body: Uint8Array,
    opts: { contentType: string; cacheControl?: string },
  ): Promise<void> {
    await this.bucket.put(key, body, {
      httpMetadata: {
        contentType: opts.contentType,
        cacheControl: opts.cacheControl,
      },
    });
  }

  async listKeys(
    prefix: string,
    opts?: { startAfter?: string; limit?: number },
  ): Promise<string[]> {
    const listed = await this.bucket.list({
      prefix,
      startAfter: opts?.startAfter,
      limit: opts?.limit,
    });
    return listed.objects.map((o) => o.key);
  }

  async delete(key: string): Promise<void> {
    await this.bucket.delete(key);
  }

  async deleteMany(keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    await this.bucket.delete(keys);
  }
}

// ---------------------------------------------------------------------------
// Cloudflare Worker env bindings
// ---------------------------------------------------------------------------

type Env = DoubloonEnv & {
  BUCKET: R2Bucket;
};

// ---------------------------------------------------------------------------
// Auth resolvers
// ---------------------------------------------------------------------------

/**
 * Legacy Bearer resolver — used ONLY for the Doubloon entitlements router
 * until Doubloon is migrated to cap-cert auth.
 *
 * TODO(doubloon-v3): remove once Doubloon is migrated.
 */
function makeLegacyRoleResolver(env: Env) {
  return async function legacyRoleResolver(
    _c: Context,
  ): Promise<AuthResult> {
    const token = _c.req.header("authorization") ?? "";
    if (token.startsWith("Bearer ")) {
      const authToken = token.slice("Bearer ".length);
      if (authToken === env.DOUBLOON_ADMIN_TOKEN) {
        return { identity: "doubloon-admin", roles: ["admin"] };
      }
    }
    return { identity: "anonymous", roles: [] };
  };
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

const app = new Hono<{ Bindings: Env }>();

// Per-Worker singleton cache — built once per isolate lifetime.
let _store: R2ObjectStore | null = null;
let _capCertResolver: ReturnType<typeof createCapCertRoleResolver> | null = null;
let _octospacesSyncRouter: Hono | null = null;
let _fianceSyncRouter: Hono | null = null;
let _legacySyncRouter: Hono | null = null;
let _doubloon: ReturnType<typeof createDoubloon> | null = null;

function getStore(env: Env): R2ObjectStore {
  if (!_store) _store = new R2ObjectStore(env.BUCKET);
  return _store;
}

function getCapCertResolver(): ReturnType<typeof createCapCertRoleResolver> {
  if (!_capCertResolver) {
    const nonceCache = createInMemoryNonceCache({ windowMs: 10 * 60_000, maxEntries: 100_000 });
    const revocationStore = createInMemoryRevocationStore();
    _capCertResolver = createCapCertRoleResolver({
      nonceCache,
      revocationStore,
      allowAnonymous: true,
      plugins: [defaultServerPlugin, identitiesServerPlugin, sharingServerPlugin],
      maxBodyBytes: 11_534_336,
    });
  }
  return _capCertResolver;
}

function getOctospacesSyncRouter(env: Env): Hono {
  if (_octospacesSyncRouter) return _octospacesSyncRouter;

  const s = getStore(env);
  const roleResolver = getCapCertResolver();
  // Official space role enricher replaces the hand-written space-role.ts.
  const spaceEnricher = createSpacesRoleEnricher(s);

  _octospacesSyncRouter = createSyncRouter({
    store: s,
    config: octospacesSyncConfig,
    roleResolver,
    roleEnricher: spaceEnricher,
    cors: { allowHeaders: [...CORS_ALLOW_HEADERS] },
    securityHeaders: true,
  });

  saveConfig(s, octospacesSyncConfig).catch(() => {});
  return _octospacesSyncRouter;
}

function getFianceSyncRouter(env: Env): Hono {
  if (_fianceSyncRouter) return _fianceSyncRouter;

  const s = getStore(env);
  const roleResolver = getCapCertResolver();
  const spaceEnricher = createSpacesRoleEnricher(s);

  _fianceSyncRouter = createSyncRouter({
    store: s,
    config: fianceSyncConfig,
    roleResolver,
    roleEnricher: spaceEnricher,
    // Directory plugin: when a write lands on objindex, it projects public-access
    // nodes to _index/objects/public (world-readable directory).
    // R2ObjectStore exposes getString + put (not putString) — adapt inline.
    plugins: [
      createSpacesDirectoryServerPlugin({
        getString: (k) => s.getString(k),
        putString: (k, v) => s.put(k, v),
      }),
    ],
    cors: { allowHeaders: [...CORS_ALLOW_HEADERS] },
    securityHeaders: true,
  });

  saveConfig(s, fianceSyncConfig).catch(() => {});
  return _fianceSyncRouter;
}

function getLegacySyncRouter(env: Env): Hono {
  if (_legacySyncRouter) return _legacySyncRouter;

  const s = getStore(env);
  const roleResolver = makeLegacyRoleResolver(env);

  _legacySyncRouter = createSyncRouter({
    store: s,
    config: legacyConfig,
    roleResolver,
    cors: { allowHeaders: [...CORS_ALLOW_HEADERS] },
    securityHeaders: true,
  });

  return _legacySyncRouter;
}

function getDoubloon(env: Env): ReturnType<typeof createDoubloon> {
  if (!_doubloon) _doubloon = createDoubloon(env);
  return _doubloon;
}

// ---------------------------------------------------------------------------
// Routing: fiance and octospaces are matched BEFORE the legacy catch-all
// ---------------------------------------------------------------------------

// Fiance content namespace — cap-cert + space-role enricher.
app.all("/v1/fiance/*", (c) => {
  const url = new URL(c.req.raw.url);
  url.pathname = url.pathname.replace(/^\/v1\/fiance/, "") || "/";
  return getFianceSyncRouter(c.env).fetch(new Request(url, c.req.raw), c.env, c.executionCtx);
});

// Shared octospaces registry namespace — cap-cert + space-role enricher.
app.all("/v1/octospaces/*", (c) => {
  const url = new URL(c.req.raw.url);
  url.pathname = url.pathname.replace(/^\/v1\/octospaces/, "") || "/";
  return getOctospacesSyncRouter(c.env).fetch(
    new Request(url, c.req.raw),
    c.env,
    c.executionCtx,
  );
});

// Legacy Bearer namespace — entitlements + analytics-events (Doubloon compat).
app.all("/v1/*", (c) => {
  const url = new URL(c.req.raw.url);
  url.pathname = url.pathname.replace(/^\/v1/, "") || "/";
  return getLegacySyncRouter(c.env).fetch(new Request(url, c.req.raw), c.env, c.executionCtx);
});

// ---------------------------------------------------------------------------
// Doubloon webhook routes (HTTP, not Starfish sync)
// ---------------------------------------------------------------------------

async function handleDoubloonWebhook(c: Context<{ Bindings: Env }>) {
  const headers: Record<string, string> = {};
  c.req.raw.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });
  const body = new Uint8Array(await c.req.arrayBuffer()) as unknown as Buffer;

  const result = await getDoubloon(c.env).handleWebhook({ headers, body });
  return c.text(result.body ?? "", result.status as 200 | 400 | 401 | 500);
}

app.post("/iap/apple", handleDoubloonWebhook);
app.post("/iap/google", handleDoubloonWebhook);
app.post("/stripe/webhook", handleDoubloonWebhook);

export default app;
