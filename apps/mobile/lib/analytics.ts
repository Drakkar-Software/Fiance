import { Platform } from "react-native";
import { SunglassesCore, createLazyClient } from "@drakkar.software/sunglasses-core";
import { AsyncStorageAdapter } from "@drakkar.software/sunglasses-storage-async-storage";
import { StarfishAnalyticsAdapter } from "@drakkar.software/sunglasses-adapter-starfish";
import { StarfishClient } from "@drakkar.software/starfish-client";

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

export const analytics = createLazyClient<FianceEvents>();

const ANALYTICS_BASE =
  process.env.EXPO_PUBLIC_ANALYTICS_URL ?? "http://localhost:8787";
const ANALYTICS_APP = "fiance";

// Guard against double-init (React StrictMode double-effects, fast-refresh, etc.)
let started = false;

export async function initAnalytics(): Promise<void> {
  if (started) return;
  started = true;

  const syncClient = new StarfishClient({
    baseUrl: ANALYTICS_BASE,
    namespace: "analytics",
  });

  const client = await SunglassesCore.create({
    storage: new AsyncStorageAdapter(),
    adapters: [
      new StarfishAnalyticsAdapter({
        client: syncClient,
        app: ANALYTICS_APP,
        // StarfishClient.push() does NOT add /push/ — applyNamespace() only prepends
        // /v1/{namespace}. Must include /push/ explicitly to reach:
        //   ANALYTICS_BASE/v1/analytics/push/events/fiance/{uuid}
        pathTemplate: "/push/events/{app}/{batchId}",
      }),
    ],
    platform: Platform.OS === "web" ? "web" : "react-native",
    appName: "fiance-mobile",
    defaultOptIn: true,
    enableSessionTracking: true,
    debug: __DEV__,
  });

  analytics.init(client);
}
