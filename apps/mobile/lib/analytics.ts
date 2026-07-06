import { createTelemetry, createTelemetryClient } from "@drakkar.software/dk-spaces-analytics-sdk";

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
  ceremony_item_added:         undefined;
  ceremony_item_deleted:       undefined;
  speech_added:                undefined;
  speech_deleted:              undefined;
  playlist_track_added:        undefined;
  // Budget
  budget_template_applied:     { template: string };
  // Ideas
  idea_added:                  undefined;
  idea_deleted:                undefined;
  collection_added:            undefined;
  // Settings
  sync_enabled:                undefined;
  sync_disabled:               undefined;
  wedding_resynced:            undefined;
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

export const analytics = createTelemetryClient<FianceEvents>();

const ANALYTICS_BASE =
  process.env.EXPO_PUBLIC_ANALYTICS_URL ?? "";
const ANALYTICS_APP = "fiance";

// Guard against double-init (React StrictMode double-effects, fast-refresh, HMR module re-eval, etc.)
// Uses globalThis so it survives module re-evaluation in development.
const g = globalThis as Record<string, unknown>;
const INIT_KEY = "__fiance_analytics_started__";

export async function initAnalytics(): Promise<void> {
  if (g[INIT_KEY]) return;
  g[INIT_KEY] = true;

  const client = await createTelemetry({
    // Bare host, no /v1 — StarfishClient prepends /v1/{namespace} internally.
    syncBaseUrl: ANALYTICS_BASE,
    app: ANALYTICS_APP,
    namespace: "analytics",
    // Effective push endpoint: ANALYTICS_BASE/v1/analytics/push/events/fiance/{uuid}
    appName: "fiance-mobile",
    defaultOptIn: true,
    debug: __DEV__,
  });

  analytics.init(client);
}
