// Shared between lib/revenuecat.ts (native impl) and lib/revenuecat.web.ts (Web
// Billing impl) — kept in its own file (not named "revenuecat*") so that neither
// platform file's `import ... from "./revenuecat-constants"` gets caught by
// Metro's own platform-extension resolution and circularly resolves to itself.

/** Entitlement identifier configured in the RevenueCat dashboard for lifetime premium. */
export const RC_ENTITLEMENT_ID = "Fiancé Unlimited";

/**
 * Store product ids for the one-time lifetime purchase. The RevenueCat Test
 * Store reports the dashboard product id ("lifetime"); the real App Store /
 * Play Store products (app.json) report the fully-qualified SKU. Match against
 * both so findPremiumPackage() works in dev and prod.
 */
export const PREMIUM_PRODUCT_IDS = [
  "lifetime",
  "software.drakkar.fiance.app.premium.lifetime",
];

export type PurchaseOutcome =
  | { kind: "purchased" }
  | { kind: "cancelled" }
  | { kind: "failed"; error: unknown };
