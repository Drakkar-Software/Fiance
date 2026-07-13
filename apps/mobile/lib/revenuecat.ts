// Native (iOS + Android) RevenueCat implementation, wrapping react-native-purchases.
// This is the Metro/TS default for "@/lib/revenuecat" — the web override lives in
// revenuecat.web.ts. Never import react-native-purchases outside this file.
import { Platform } from "react-native";
import Purchases, { LOG_LEVEL, type CustomerInfo } from "react-native-purchases";
import { useRevenueCatStore } from "@/store/useRevenueCatStore";
import { RC_ENTITLEMENT_ID, PREMIUM_SKU, type PurchaseOutcome } from "./revenuecat-constants";

export { RC_ENTITLEMENT_ID, PREMIUM_SKU, type PurchaseOutcome } from "./revenuecat-constants";

/**
 * Find the lifetime-premium package by product id rather than assuming it's
 * whichever package the dashboard's current offering happens to list first —
 * that would silently target the wrong product if the offering ever gains a
 * second package (e.g. a future subscription tier or a paywall A/B test).
 */
async function findPremiumPackage() {
  const offerings = await Purchases.getOfferings();
  const packages = offerings.current?.availablePackages ?? [];
  return packages.find((pkg) => pkg.product.identifier === PREMIUM_SKU) ?? null;
}

let configured = false;

/** Null when the required env var is missing/blank — never returns an empty string. */
function resolveApiKey(): string | null {
  if (__DEV__) {
    const testKey = process.env.EXPO_PUBLIC_REVENUECAT_TEST_KEY;
    if (testKey) return testKey;
  }
  const key =
    Platform.OS === "ios"
      ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY
      : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
  return key || null;
}

function applyCustomerInfo(info: CustomerInfo): void {
  useRevenueCatStore.getState().setPremium(info.entitlements.active[RC_ENTITLEMENT_ID] !== undefined);
}

/**
 * Configure RevenueCat once per app launch, keyed to the wedding OWNER's userId
 * (see resolveOwnerUserId in lib/server.ts) so every collaborator's device reads
 * the same shared entitlement. Later calls (e.g. active wedding switched) log in
 * as the new owner instead of re-configuring.
 *
 * No-ops (with a dev warning) when the required EXPO_PUBLIC_REVENUECAT_* key is
 * missing, instead of calling Purchases.configure with a blank apiKey — which the
 * native SDK accepts silently and then fails every subsequent call with an opaque
 * auth error. `configured` is only flipped once Purchases.configure() actually
 * succeeds — a synchronous throw (bad key, native double-configure guard) is
 * caught so it can't crash the caller's effect nor permanently mis-mark the
 * module as configured when it never was.
 */
export function configureRevenueCat(ownerUserId: string): void {
  if (!configured) {
    const apiKey = resolveApiKey();
    if (!apiKey) {
      if (__DEV__) console.warn("[revenuecat] no EXPO_PUBLIC_REVENUECAT_* key set for this platform/build — skipping configure()");
      return;
    }
    try {
      Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.INFO);
      Purchases.configure({ apiKey, appUserID: ownerUserId });
      configured = true;
    } catch (e) {
      if (__DEV__) console.warn("[revenuecat] Purchases.configure() threw:", e);
      return;
    }
    Purchases.getCustomerInfo().then(applyCustomerInfo).catch(() => {});
    return;
  }
  Purchases.logIn(ownerUserId)
    .then(({ customerInfo }) => applyCustomerInfo(customerInfo))
    .catch(() => {});
}

/**
 * Subscribe to entitlement changes (purchase, restore, login, renewal). Owned by
 * the caller's effect lifecycle — call once per mount and invoke the returned
 * function on cleanup, so a remount (e.g. RevenueCatInitializer re-running on a
 * wedding switch) never accumulates duplicate listeners.
 */
export function subscribeCustomerInfo(): () => void {
  Purchases.addCustomerInfoUpdateListener(applyCustomerInfo);
  return () => Purchases.removeCustomerInfoUpdateListener(applyCustomerInfo);
}

export async function purchasePremium(): Promise<PurchaseOutcome> {
  try {
    const pkg = await findPremiumPackage();
    if (!pkg) return { kind: "failed", error: new Error(`No offering package for product "${PREMIUM_SKU}"`) };
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    applyCustomerInfo(customerInfo);
    return { kind: "purchased" };
  } catch (e: any) {
    if (e?.userCancelled) return { kind: "cancelled" };
    return { kind: "failed", error: e };
  }
}

export async function restorePremium(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    applyCustomerInfo(customerInfo);
    return true;
  } catch {
    return false;
  }
}

export async function getPremiumPrice(): Promise<string | null> {
  try {
    const pkg = await findPremiumPackage();
    return pkg?.product.priceString ?? null;
  } catch {
    return null;
  }
}
