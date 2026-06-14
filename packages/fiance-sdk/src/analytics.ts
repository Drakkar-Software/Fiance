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
  // Home
  home_opened:                 { days_until?: number };
  rsvp_sync_triggered:         undefined;
  pwa_install_clicked:         undefined;
  // Guests
  guest_added:                 undefined;
  // Vendors
  vendor_added:                { category: string };
  // Planning
  task_completed:              undefined;
  planning_template_generated: undefined;
  // Budget
  budget_template_applied:     { template: string };
  // Ideas
  idea_added:                  undefined;
  // Settings
  sync_enabled:                undefined;
  sync_disabled:               undefined;
  export_data:                 undefined;
  import_data:                 undefined;
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
