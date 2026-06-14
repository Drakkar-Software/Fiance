import { Platform } from "react-native";
import { useOptimisticPurchaseStore } from "@/store/useOptimisticPurchaseStore";
import { useEntitlementsStore } from "@/store/useEntitlementsStore";
import { getStarfishClient } from "@/lib/starfish";
import { pullEntitlements } from "@drakkar.software/starfish-client";

const OPTIMISTIC_GRACE_MS = 24 * 60 * 60 * 1000;

/**
 * Returns true if the user has a server-verified premium entitlement
 * OR a local optimistic purchase record still within the 24-hour grace window.
 * Use this reactive hook in components; for non-reactive checks use isPremiumSync.
 */
export function useIsPremiumReal(): boolean {
  const features = useEntitlementsStore((s) => s.features);
  const record = useOptimisticPurchaseStore((s) => s.record);
  if (features.includes("paid-premium")) return true;
  if (record && Date.now() - record.purchasedAt < OPTIMISTIC_GRACE_MS) return true;
  return false;
}

/** Non-reactive snapshot — use outside of components (e.g. guards, lib code). */
export function isPremiumSync(): boolean {
  const features = useEntitlementsStore.getState().features;
  const record = useOptimisticPurchaseStore.getState().record;
  if (features.includes("paid-premium")) return true;
  if (record && Date.now() - record.purchasedAt < OPTIMISTIC_GRACE_MS) return true;
  return false;
}

export const PREMIUM_SKU = "com.fiance.app.premium.lifetime";

// Dynamically imported to avoid Metro bundling on web
let iapModule: typeof import("expo-iap") | null = null;

async function getIAP() {
  if (Platform.OS === "web") return null;
  if (!iapModule) iapModule = await import("expo-iap");
  return iapModule;
}

export async function ensureConnection(): Promise<void> {
  if (Platform.OS === "web") return;
  const iap = await getIAP();
  if (!iap) return;
  await iap.initConnection();
}

export async function fetchPremiumProduct() {
  if (Platform.OS === "web") return null;
  const iap = await getIAP();
  if (!iap) return null;
  const products = await iap.getProducts([PREMIUM_SKU]);
  return products[0] ?? null;
}

export async function purchasePremium(userId: string): Promise<void> {
  if (Platform.OS === "web") return;
  const iap = await getIAP();
  if (!iap) return;
  await iap.requestPurchase({
    request: {
      ios: { sku: PREMIUM_SKU, appAccountToken: userId },
      android: { skus: [PREMIUM_SKU], obfuscatedAccountId: userId },
    },
    type: "inapp",
  });
}

export async function refreshEntitlements(userId: string): Promise<void> {
  const sfClient = getStarfishClient();
  if (!sfClient || !userId) return;
  const features = await pullEntitlements(sfClient, userId).catch(() => null);
  if (features && features.length > 0) useEntitlementsStore.getState().setFeatures(features);
}

export async function restorePurchases(userId: string): Promise<void> {
  if (Platform.OS === "web") return;
  await refreshEntitlements(userId);
}

export function setupPurchaseListeners(userId: string): (() => void) | undefined {
  if (Platform.OS === "web") return;

  let cleanup: (() => void) | undefined;

  getIAP().then((iap) => {
    if (!iap) return;

    const purchaseUpdated = iap.purchaseUpdatedListener(async (purchase) => {
      await iap.finishTransaction({ purchase, isConsumable: false });

      useOptimisticPurchaseStore.getState().setRecord({
        purchasedAt: Date.now(),
        transactionId: purchase.transactionId ?? purchase.productId,
        platform: Platform.OS as "ios" | "android",
      });

      // Background pull — pick up authoritative entitlement once webhook lands
      const sfClient = getStarfishClient();
      if (sfClient && userId) {
        pullEntitlements(sfClient, userId)
          .then((features) => {
            if (features && features.length > 0) {
              useEntitlementsStore.getState().setFeatures(features);
            }
          })
          .catch(() => {});
      }
    });

    const purchaseError = iap.purchaseErrorListener((_error) => {
      // Purchase errors are handled at the call site via rejected promise
    });

    cleanup = () => {
      purchaseUpdated.remove();
      purchaseError.remove();
    };
  });

  return () => { cleanup?.(); };
}
