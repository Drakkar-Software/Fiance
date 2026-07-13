// Shared between lib/revenuecat.ts (native impl) and lib/revenuecat.web.ts (Web
// Billing impl) — kept in its own file (not named "revenuecat*") so that neither
// platform file's `import ... from "./revenuecat-constants"` gets caught by
// Metro's own platform-extension resolution and circularly resolves to itself.

/** Entitlement identifier configured in the RevenueCat dashboard for lifetime premium. */
export const RC_ENTITLEMENT_ID = "premium";

/** Store product id — one-time lifetime purchase, same id on both stores (app.json). */
export const PREMIUM_SKU = "software.drakkar.fiance.app.premium.lifetime";

export type PurchaseOutcome =
  | { kind: "purchased" }
  | { kind: "cancelled" }
  | { kind: "failed"; error: unknown };
