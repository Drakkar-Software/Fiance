import { createServer, defineConfig } from "@drakkar.software/doubloon-server";
import { AppleBridge } from "@drakkar.software/doubloon-bridge-apple";
import { GoogleBridge } from "@drakkar.software/doubloon-bridge-google";
import { StripeBridge } from "@drakkar.software/doubloon-bridge-stripe";
import { createStarfishDestination } from "@drakkar.software/doubloon-starfish";
import { StarfishClient } from "@drakkar.software/starfish-client";
import type { WalletResolver } from "@drakkar.software/doubloon-core";

export type DoubloonEnv = {
  STARFISH_SELF_URL: string;
  DOUBLOON_ADMIN_TOKEN: string;
  APPLE_ISSUER_ID: string;
  APPLE_KEY_ID: string;
  APPLE_PRIVATE_KEY: string;
  GOOGLE_SERVICE_ACCOUNT_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
};

// ---------------------------------------------------------------------------
// Wallet validator — accepts 16-char hex userIds derived from Starfish tokens
// ---------------------------------------------------------------------------

function isValidUserId(address: string): boolean {
  if (!address || typeof address !== "string") return false;
  if (/^[0-9a-f]{16}$/i.test(address)) return true;
  // Also accept standard Solana/EVM for forward-compat
  if (/^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{32,44}$/.test(address)) return true;
  if (/^0x[0-9a-fA-F]{40}$/.test(address)) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Direct wallet resolver — identity is already embedded in the payment
// ---------------------------------------------------------------------------

const directWalletResolver: WalletResolver = {
  async resolveWallet(_store, identifier) {
    return identifier || null;
  },
  async linkWallet() {},
};

// ---------------------------------------------------------------------------
// Google wallet resolver — calls Play API to retrieve obfuscatedExternalAccountId
// ---------------------------------------------------------------------------

async function createRS256JWT(payload: object, pemKey: string): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" };
  const encode = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const signingInput = `${encode(header)}.${encode(payload)}`;

  const keyData = pemKey
    .replace(/-----BEGIN (?:RSA )?PRIVATE KEY-----\n?/, "")
    .replace(/-----END (?:RSA )?PRIVATE KEY-----\n?/, "")
    .replace(/\n/g, "");
  const keyBytes = Uint8Array.from(atob(keyData), (c) => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    keyBytes,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signingInput),
  );
  const b64Sig = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `${signingInput}.${b64Sig}`;
}

function createGoogleWalletResolver(
  serviceAccountJson: string,
  packageName: string,
  productId: string,
): WalletResolver {
  return {
    async resolveWallet(_store, purchaseToken) {
      const sa = JSON.parse(serviceAccountJson);
      const now = Math.floor(Date.now() / 1000);
      const jwt = await createRS256JWT(
        {
          iss: sa.client_email,
          scope: "https://www.googleapis.com/auth/androidpublisher",
          aud: "https://oauth2.googleapis.com/token",
          exp: now + 3600,
          iat: now,
        },
        sa.private_key,
      );
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
      });
      const { access_token } = (await tokenRes.json()) as { access_token: string };
      const apiRes = await fetch(
        `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/products/${productId}/tokens/${purchaseToken}`,
        { headers: { Authorization: `Bearer ${access_token}` } },
      );
      const purchase = (await apiRes.json()) as { obfuscatedExternalAccountId?: string };
      return purchase.obfuscatedExternalAccountId ?? null;
    },
    async linkWallet() {},
  };
}

// ---------------------------------------------------------------------------
// Doubloon server factory
// ---------------------------------------------------------------------------

const PREMIUM_PRODUCT = {
  slug: "paid-premium",
  name: "Fiancé Premium",
  defaultDuration: 0, // lifetime — no expiry
};
const GOOGLE_PRODUCT_SKU = "com.fiance.app.premium.lifetime";
const PACKAGE_NAME = "com.fiance.app";

export function createDoubloon(env: DoubloonEnv) {
  const adminClient = new StarfishClient({
    baseUrl: env.STARFISH_SELF_URL,
    auth: async () => ({ Authorization: `Bearer ${env.DOUBLOON_ADMIN_TOKEN}` }),
  });

  const destination = createStarfishDestination({
    client: adminClient,
    products: [PREMIUM_PRODUCT],
    signerKey: "doubloon-admin",
    storagePath: "users/{user}/entitlements",
    field: "features",
  });

  const productResolver = {
    resolveProductId: async () => PREMIUM_PRODUCT.slug,
  };

  const googleWalletResolver = createGoogleWalletResolver(
    env.GOOGLE_SERVICE_ACCOUNT_KEY,
    PACKAGE_NAME,
    GOOGLE_PRODUCT_SKU,
  );

  const { serverConfig } = defineConfig({
    products: [PREMIUM_PRODUCT],
    destination,
    bridges: {
        apple: new AppleBridge({
          bundleId: PACKAGE_NAME,
          issuerId: env.APPLE_ISSUER_ID,
          keyId: env.APPLE_KEY_ID,
          privateKey: env.APPLE_PRIVATE_KEY,
          productResolver,
          walletResolver: directWalletResolver,
          walletValidator: isValidUserId,
        }),
        google: new GoogleBridge({
          packageName: PACKAGE_NAME,
          serviceAccountKey: env.GOOGLE_SERVICE_ACCOUNT_KEY,
          productResolver,
          walletResolver: googleWalletResolver,
          walletValidator: isValidUserId,
        }),
        stripe: new StripeBridge({
          webhookSecret: env.STRIPE_WEBHOOK_SECRET,
          productResolver,
          walletResolver: directWalletResolver,
          walletValidator: isValidUserId,
          // client_reference_id is "{userId}_{weddingId}" — extract just the userId
          clientReferenceIdTransform: (id) => id.split("_")[0],
        }),
      },
      onMintFailure: async (instruction, error, ctx) => {
        console.error("[doubloon] mint failure", {
          productId: instruction.productId,
          user: instruction.user,
          error: error.message,
          retryCount: ctx.retryCount,
        });
      },
  });

  return createServer(serverConfig);
}
