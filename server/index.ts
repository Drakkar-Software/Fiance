import { Hono } from "hono";
import type { Context } from "hono";
import {
  createSyncRouter,
  saveConfig,
  createConsoleLogger,
  createConsoleAuditLogger,
  createEntitlementRoleEnricher,
  type ObjectStore,
  type AuthResult,
} from "@drakkar.software/starfish-server";
import { config } from "./starfish-config";
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
  ENCRYPTION_SECRET: string;
};

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

async function roleResolver(c: Context<{ Bindings: Env }>): Promise<AuthResult> {
  const token = c.req.header("authorization") ?? "";
  if (token.startsWith("Bearer ")) {
    const authToken = token.slice("Bearer ".length);
    // Admin token used by Doubloon to write entitlements
    if (authToken === c.env.DOUBLOON_ADMIN_TOKEN) {
      return { identity: "doubloon-admin", roles: ["admin"] };
    }
    // Regular user token — identity from first 16 chars
    const userId = authToken.slice(0, 16);
    return { identity: userId, roles: ["user"] };
  }
  return { identity: "anonymous", roles: ["public"] };
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

const app = new Hono<{ Bindings: Env }>();

let cachedRouter: Hono | null = null;
let cachedDoubloon: ReturnType<typeof createDoubloon> | null = null;

function getSyncRouter(env: Env): Hono {
  if (cachedRouter) return cachedRouter;

  const store = new R2ObjectStore(env.BUCKET);
  const entitlementEnricher = createEntitlementRoleEnricher({
    store,
    path: "users/{identity}/entitlements",
    field: "features",
    rolePrefix: "entitlement",
    cacheTtlMs: 0, // no cache — instant post-purchase propagation
  });

  cachedRouter = createSyncRouter({
    store,
    config,
    roleResolver,
    encryptionSecret: env.ENCRYPTION_SECRET,
    cors: true,
    securityHeaders: true,
    logger: createConsoleLogger(),
    auditLogger: createConsoleAuditLogger(),
    configEndpoint: { auth: "public" },
    roleEnricher: entitlementEnricher,
  });

  saveConfig(store, config).catch(() => {});

  return cachedRouter;
}

function getDoubloon(env: Env): ReturnType<typeof createDoubloon> {
  if (cachedDoubloon) return cachedDoubloon;
  cachedDoubloon = createDoubloon(env);
  return cachedDoubloon;
}

app.all("/v1/*", (c) => {
  const url = new URL(c.req.raw.url);
  url.pathname = url.pathname.replace(/^\/v1/, "") || "/";
  return getSyncRouter(c.env).fetch(new Request(url, c.req.raw));
});

// ---------------------------------------------------------------------------
// Doubloon webhook routes
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
