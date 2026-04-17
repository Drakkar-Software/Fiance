import { Platform } from "react-native";
import { useOptimisticPurchaseStore } from "@/store/useOptimisticPurchaseStore";
import { getStarfishClient } from "@/lib/starfish";
import { useEntitlementsStore } from "@/store/useEntitlementsStore";
import { pullEntitlements } from "@drakkar.software/starfish-client";

export const PREMIUM_SKU = "com.weddingos.app.premium.lifetime";

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

export async function restorePurchases(userId: string): Promise<void> {
  if (Platform.OS === "web") return;
  const sfClient = getStarfishClient();
  if (!sfClient) return;
  const features = await pullEntitlements(sfClient, userId).catch(() => null);
  if (features && features.length > 0) {
    useEntitlementsStore.getState().setFeatures(features);
  }
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
