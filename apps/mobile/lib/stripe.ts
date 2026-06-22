import { useOptimisticPurchaseStore } from "@/store/useOptimisticPurchaseStore";
import { getStarfishClient, pullEntitlements } from "@/lib/starfish";
import { useEntitlementsStore } from "@/store/useEntitlementsStore";

// Set this to the Stripe Payment Link URL (created once in Stripe dashboard)
const STRIPE_PAYMENT_LINK_URL = process.env.EXPO_PUBLIC_STRIPE_PAYMENT_LINK_URL ?? "";

export function redirectToCheckout(userId: string, weddingId?: string): void {
  if (typeof window === "undefined") return;
  const url = new URL(STRIPE_PAYMENT_LINK_URL);
  const clientRef = weddingId ? `${userId}_${weddingId}` : userId;
  url.searchParams.set("client_reference_id", clientRef);
  url.searchParams.set("success_url", `${window.location.origin}${window.location.pathname}?status=success&client_reference_id=${userId}`);
  window.location.href = url.toString();
}

export async function handleReturnFromCheckout(userId: string): Promise<void> {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  if (params.get("status") !== "success") return;

  const transactionId = params.get("client_reference_id") ?? params.get("session_id") ?? userId;

  useOptimisticPurchaseStore.getState().setRecord({
    purchasedAt: Date.now(),
    transactionId,
    platform: "stripe",
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
}
