// Web (RevenueCat Web Billing) implementation, wrapping @revenuecat/purchases-js.
// Overrides lib/revenuecat.ts on web — Metro resolves this file for platform "web".
// Never import @revenuecat/purchases-js outside this file.
import { Purchases, LogLevel, ErrorCode, type CustomerInfo } from "@revenuecat/purchases-js";
import { useRevenueCatStore } from "@/store/useRevenueCatStore";
import { RC_ENTITLEMENT_ID, PREMIUM_SKU, type PurchaseOutcome } from "./revenuecat-constants";

export { RC_ENTITLEMENT_ID, PREMIUM_SKU, type PurchaseOutcome } from "./revenuecat-constants";

let purchases: Purchases | null = null;

/**
 * The wedding owner userId configureRevenueCat() was last called with. Guards
 * applyCustomerInfo against stale data: an in-flight getCustomerInfo()/changeUser()
 * promise for a PREVIOUS owner can resolve after a fast wedding switch has already
 * moved on to a new owner — comparing against CustomerInfo.originalAppUserId drops
 * it instead of overwriting the current wedding's entitlement with the wrong one's.
 */
let currentOwnerId: string | null = null;

/**
 * Find the lifetime-premium package by product id rather than assuming it's
 * whichever package the dashboard's current offering happens to list first —
 * that would silently target the wrong product if the offering ever gains a
 * second package (e.g. a future subscription tier or a paywall A/B test).
 */
async function findPremiumPackage() {
  if (!purchases) return null;
  const offerings = await purchases.getOfferings();
  const packages = offerings.current?.availablePackages ?? [];
  return packages.find((pkg) => pkg.rcBillingProduct.identifier === PREMIUM_SKU) ?? null;
}

function applyCustomerInfo(info: CustomerInfo): void {
  if (info.originalAppUserId !== currentOwnerId) return;
  useRevenueCatStore.getState().setPremium(info.entitlements.active[RC_ENTITLEMENT_ID] !== undefined);
}

/**
 * Configure RevenueCat Web Billing once per page load, keyed to the wedding
 * OWNER's userId (see resolveOwnerUserId in lib/server.ts) so every collaborator
 * reads the same shared entitlement. Later calls (e.g. active wedding switched)
 * switch user instead of re-configuring.
 *
 * No-ops (with a dev warning) when EXPO_PUBLIC_REVENUECAT_WEB_KEY is missing,
 * instead of calling Purchases.configure with a blank apiKey.
 */
export function configureRevenueCat(ownerUserId: string): void {
  currentOwnerId = ownerUserId;
  if (!purchases) {
    const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_WEB_KEY;
    if (!apiKey) {
      if (__DEV__) console.warn("[revenuecat] EXPO_PUBLIC_REVENUECAT_WEB_KEY is not set — skipping configure()");
      return;
    }
    try {
      Purchases.setLogLevel(__DEV__ ? LogLevel.Debug : LogLevel.Info);
      purchases = Purchases.configure(apiKey, ownerUserId);
    } catch (e) {
      if (__DEV__) console.warn("[revenuecat] Purchases.configure() threw:", e);
      return;
    }
    purchases.getCustomerInfo().then(applyCustomerInfo).catch(() => {});
    return;
  }
  purchases.changeUser(ownerUserId).then(applyCustomerInfo).catch(() => {});
}

/**
 * Web Billing has no persistent customer-info listener API (unlike the native
 * SDK) — CustomerInfo is refreshed explicitly after configure/purchase/restore.
 * No-op, matching the shared lib/revenuecat.ts surface so callers don't need a
 * platform branch.
 */
export function subscribeCustomerInfo(): () => void {
  return () => {};
}

export async function purchasePremium(): Promise<PurchaseOutcome> {
  if (!purchases) return { kind: "failed", error: new Error("RevenueCat not configured") };
  try {
    const pkg = await findPremiumPackage();
    if (!pkg) return { kind: "failed", error: new Error(`No offering package for product "${PREMIUM_SKU}"`) };
    const { customerInfo } = await purchases.purchase({ rcPackage: pkg });
    applyCustomerInfo(customerInfo);
    return { kind: "purchased" };
  } catch (e: any) {
    if (e?.errorCode === ErrorCode.UserCancelledError) return { kind: "cancelled" };
    return { kind: "failed", error: e };
  }
}

/**
 * Web Billing purchases are already tied to the configured appUserID — there's no
 * separate store receipt to "restore". Just refresh CustomerInfo in case a webhook
 * landed since the last check.
 */
export async function restorePremium(): Promise<boolean> {
  if (!purchases) return false;
  try {
    const customerInfo = await purchases.getCustomerInfo();
    applyCustomerInfo(customerInfo);
    return true;
  } catch {
    return false;
  }
}

export async function getPremiumPrice(): Promise<string | null> {
  try {
    const pkg = await findPremiumPackage();
    return pkg?.rcBillingProduct.currentPrice?.formattedPrice ?? null;
  } catch {
    return null;
  }
}
