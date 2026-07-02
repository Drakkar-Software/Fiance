/**
 * Analytics — event type map + adapter interface for dependency injection.
 * No Expo, no React, no Sentry imports.
 * The app initialises the concrete adapter (Starfish, Console, etc.) and passes it here.
 */

// ─── Event map ────────────────────────────────────────────────────────────────

export type FianceEvents = {
  // Lifecycle
  wedding_created:             { method: "new" | "import" | "invite" };
  wedding_switched:            undefined;
  wedding_deleted:             undefined;
  // Home
  home_opened:                 { days_until?: number };
  rsvp_sync_triggered:         undefined;
  pwa_install_clicked:         undefined;
  // Guests
  guest_added:                 undefined;
  guest_deleted:               undefined;
  guest_rsvp_shared:           undefined;
  accommodation_added:         undefined;
  accommodation_deleted:       undefined;
  invitation_type_added:       undefined;
  communication_added:         undefined;
  table_added:                 undefined;
  table_deleted:               undefined;
  wedding_role_created:        undefined;
  wedding_role_assigned:       undefined;
  seating_constraint_created:  undefined;
  wedding_event_created:       undefined;
  meal_choice_set:             undefined;
  guest_logistics_updated:     undefined;
  communication_template_used: undefined;
  document_attached:           undefined;
  vendor_selected_for_budget:  undefined;
  legal_milestone_completed:   undefined;
  honeymoon_plan_created:      undefined;
  // Vendors
  vendor_added:                { category: string };
  vendor_deleted:              { category: string };
  vendor_payment_added:        undefined;
  // Planning
  task_added:                  undefined;
  task_deleted:                undefined;
  task_completed:              undefined;
  planning_template_generated: undefined;
  agenda_event_added:          undefined;
  day_of_item_added:           undefined;
  // Budget
  budget_template_applied:     { template: string };
  // Ideas
  idea_added:                  undefined;
  idea_deleted:                undefined;
  collection_added:            undefined;
  // Settings
  sync_enabled:                undefined;
  sync_disabled:               undefined;
  export_data:                 { format: "json" | "pdf" | "csv"; kind?: string };
  import_data:                 { source: "backup" | "legacy" | "sample" | "spreadsheet" | "mariagesnet"; sample?: string; count?: number };
  public_page_shared:          undefined;
  gift_added:                  undefined;
  gift_deleted:                undefined;
  // Monetization
  premium_checkout_started:    { platform: "ios" | "android" | "web" };
  premium_purchased:           { platform: "ios" | "android" };
  premium_restored:            undefined;
};

// ─── Adapter interface ────────────────────────────────────────────────────────

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Minimal analytics adapter interface.
 * Concrete implementations (Starfish, PostHog, console, etc.) live app-side.
 */
export interface AnalyticsAdapter {
  track<K extends keyof FianceEvents>(
    event: K,
    properties: FianceEvents[K]
  ): void | Promise<void>;
  reset(): void | Promise<void>;
  shutdown(): void | Promise<void>;
}

// ─── Lazy client ─────────────────────────────────────────────────────────────

let _adapter: AnalyticsAdapter | null = null;

/**
 * Initialise the analytics module with a concrete adapter.
 * Call once at app startup (app-side) after the adapter is ready.
 */
export function initAnalytics(adapter: AnalyticsAdapter): void {
  _adapter = adapter;
}

/**
 * Track an analytics event.
 * No-ops silently if initAnalytics() has not been called yet.
 */
export function track<K extends keyof FianceEvents>(
  event: K,
  properties: FianceEvents[K]
): void {
  _adapter?.track(event, properties);
}

export function resetAnalytics(): void {
  _adapter?.reset();
}

export function shutdownAnalytics(): void {
  _adapter?.shutdown();
}
